import { firestore, FieldValue } from "../services/firebaseService.js";
import {
  mapMidtransToTransactionStatus,
  mapMidtransToPaymentStatus,
} from "../utils/mapping.js";

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
    const orderRef = firestore.collection("order").doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res.status(404).json({ error: "Order not found" });
    }

    await orderRef.update({
      order_status: mapMidtransToTransactionStatus(transactionStatus),
      payment_status: mapMidtransToPaymentStatus(transactionStatus),
    });

    const paymentSnap = await firestore
      .collection("payment")
      .where("order_id", "==", orderId)
      .limit(1)
      .get();

    if (!paymentSnap.empty) {
      const paymentDoc = paymentSnap.docs[0];

      await paymentDoc.ref.update({
        payment_status: mapMidtransToPaymentStatus(transactionStatus),
        midtrans_transaction_id: payload.transaction_id ?? null,
        response_json: payload,
      });
    }

    return res.status(200).send("OK");
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ error: "Failed to update order/payment" });
  }
};
