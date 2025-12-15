import dotenv from "dotenv";
dotenv.config();

import midtransClient from "midtrans-client";

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

console.log(process.env.MIDTRANS_SERVER_KEY);
console.log(process.env.MIDTRANS_CLIENT_KEY);


export const createTransaction = async ({ orderId, amount, customerName, customerEmail }) => {
  const parameter = {
    transaction_details: { order_id: orderId, gross_amount: amount },
    customer_details: { first_name: customerName, email: customerEmail },
    credit_card: { secure: true },
    finish_redirect_url: "https://example.com/finish"
  };

  return await snap.createTransaction(parameter);
};
