import dotenv from "dotenv";
dotenv.config();

import midtransClient from "midtrans-client";

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY, // HARUS server key
  // clientKey jangan dipakai di backend
});

async function test() {
  try {
    const transaction = await snap.createTransaction({
      transaction_details: { order_id: `ORDER-${Date.now()}`, gross_amount: 10000 },
      customer_details: { first_name: "John Doe", email: "john@example.com" },
      credit_card: { secure: true },
    });

    console.log("Transaction result:", transaction); // transaction sudah dideklarasikan
  } catch (err) {
    console.error("Midtrans error:", err);
  }
}

test();
