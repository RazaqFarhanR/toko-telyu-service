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

    const paymentRef = firestore.collection("payment").doc(orderId);

    await paymentRef.set(
      {
        order_id: orderId,
        payment_method: "midtrans",
        payment_status: mapMidtransToPaymentStatus(transactionStatus),

        amount: Number(payload.gross_amount) || 0,
        midtrans_transaction_id: payload.transaction_id ?? null,
        payment_url:
          payload.redirect_url ??
          payload.finish_redirect_url ??
          null,

        response_json: payload,
        updated_at: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return res.status(200).send("OK");
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ error: "Failed to update order/payment" });
  }
};
