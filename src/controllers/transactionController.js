import { createTransaction } from "../services/midtransService.js";

export const createTransactionController = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { orderId, amount, customerName, customerEmail } = req.body;
  if (!orderId || !amount) return res.status(400).json({ error: "Missing orderId or amount" });

  try {
    const transaction = await createTransaction({ orderId, amount, customerName, customerEmail });
    console.log(transaction.token, transaction.redirect_url);

    // res.status(200).json({ 
    //   transactionToken: transaction.token,
    //   redirectUrl: transaction.redirect_url 
    // });
    res.status(200).json({ 
      transactionToken: "a722d00c-5ede-4454-9fd6-0ea6c82704e5",
      redirectUrl: "https://app.sandbox.midtrans.com/snap/v4/redirection/a722d00c-5ede-4454-9fd6-0ea6c82704e5" 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create transaction" });
  }
};
