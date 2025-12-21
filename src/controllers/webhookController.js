import { firestore } from "../services/firebaseService.js";
import {
  mapMidtransToTransactionStatus,
  mapMidtransToPaymentStatus,
} from "../utils/mapping.js";

/**
 * Midtrans Webhook Controller
 * - Update payment & order status
 * - Restore stock on failed / expired payment
 * - Idempotent & transaction-safe
 */
export const webhookController = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const payload = req.body;

  const orderId = payload.order_id;
  const transactionStatus = payload.transaction_status;

  if (!orderId || !transactionStatus) {
    return res
      .status(400)
      .json({ error: "Missing order_id or transaction_status" });
  }

  try {
    const paymentSnap = await firestore
      .collection("payment")
      .where("order_id", "==", orderId)
      .limit(1)
      .get();

    if (paymentSnap.empty) {
      return res.status(404).json({ error: "Payment not found" });
    }

    const paymentDoc = paymentSnap.docs[0];
    const paymentData = paymentDoc.data();

    const orderRef = firestore.collection("order").doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res.status(404).json({ error: "Order not found" });
    }

    const orderData = orderDoc.data();

    const nextPaymentStatus =
      mapMidtransToPaymentStatus(transactionStatus);
    const nextOrderStatus =
      mapMidtransToTransactionStatus(transactionStatus);

    if (
      orderData.payment_status === nextPaymentStatus &&
      paymentData.payment_status === nextPaymentStatus
    ) {
      return res.status(200).send("Already processed");
    }

    await firestore.runTransaction(async (transaction) => {
      transaction.update(paymentDoc.ref, {
        payment_status: nextPaymentStatus,
        payment_method:
          payload.payment_type ?? paymentData.payment_method,
        response_json: payload,
        updated_at: new Date(),
      });

      transaction.update(orderRef, {
        order_status: nextOrderStatus,
        payment_status: nextPaymentStatus,
        updated_at: new Date(),
      });

      const shouldRestoreStock = [
        "expire",
        "cancel",
        "deny",
        "failure",
      ].includes(transactionStatus);

      if (shouldRestoreStock) {
        const itemsSnap = await transaction.get(
          orderRef.collection("order_items")
        );

        for (const itemDoc of itemsSnap.docs) {
          const item = itemDoc.data();

          const variantRef = firestore
            .collection("product")
            .doc(item.product_id)
            .collection("product_variant")
            .doc(item.variant_id);

          const variantSnap = await transaction.get(variantRef);

          if (!variantSnap.exists) {
            console.warn(
              `[RESTORE_STOCK] Variant not found: ${item.variant_id}`
            );
            continue;
          }

          const currentStock = variantSnap.get("stock") ?? 0;

          transaction.update(variantRef, {
            stock: currentStock + item.amount,
          });
        }
      }
    });

    return res.status(200).send("OK");
  } catch (err) {
    console.error("Webhook error:", err);
    return res
      .status(500)
      .json({ error: "Failed to process webhook" });
  }
};
