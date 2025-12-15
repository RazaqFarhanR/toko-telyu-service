import { createTransaction } from "../services/midtransService.js";

export const createTransactionController = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { orderId, amount, customerName, customerEmail } = req.body;
  if (!orderId || !amount) return res.status(400).json({ error: "Missing orderId or amount" });

  try {
    const transaction = await createTransaction({ orderId, amount, customerName, customerEmail });
    console.log(transaction.token, transaction.redirect_url);

    res.status(200).json({ 
      transactionToken: transaction.token,
      redirectUrl: transaction.redirect_url 
    });
    // res.status(200).json({ 
    //   transactionToken: "fdaa08d8-e263-4032-ab38-facefd874336",
    //   redirectUrl: "https://app.sandbox.midtrans.com/snap/v4/redirection/fdaa08d8-e263-4032-ab38-facefd874336" 
    // });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create transaction" });
  }
};
