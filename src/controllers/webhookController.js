import { firestore } from "../services/firebaseService.js";
import {
  mapMidtransToTransactionStatus,
  mapMidtransToPaymentStatus,
} from "../utils/mapping.js";

export const webhookController = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const payload = req.body;

  const transactionId = payload.transaction_id;
  const transactionStatus = payload.transaction_status;

  if (!transactionId || !transactionStatus) {
    return res
      .status(400)
      .json({ error: "Missing transaction_id or transaction_status" });
  }

  try {
    const paymentSnap = await firestore
      .collection("payment")
      .where("midtrans_transaction_id", "==", transactionId)
      .limit(1)
      .get();

    if (paymentSnap.empty) {
      return res.status(404).json({ error: "Payment not found" });
    }

    const paymentDoc = paymentSnap.docs[0];
    const paymentData = paymentDoc.data();
    const orderId = paymentData.order_id;

    await paymentDoc.ref.update({
      payment_status: mapMidtransToPaymentStatus(transactionStatus),
      payment_method: payload.payment_type ?? paymentData.payment_method,
      response_json: payload,
    });

    const orderRef = firestore.collection("order").doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res.status(404).json({ error: "Order not found" });
    }

    await orderRef.update({
      order_status: mapMidtransToTransactionStatus(transactionStatus),
      payment_status: mapMidtransToPaymentStatus(transactionStatus),
    });

    return res.status(200).send("OK");
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ error: "Failed to update order/payment" });
  }
};
