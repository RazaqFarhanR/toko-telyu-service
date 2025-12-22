import admin from "firebase-admin";

const base64 = process.env.FIREBASE_ADMIN_BASE64;

if (!base64) {
  throw new Error(
    "FIREBASE_ADMIN_BASE64 is missing! Please set it in your .env"
  );
}

// Decode Base64 menjadi JSON object
let serviceAccount;

try {
  const jsonString = Buffer.from(base64, "base64").toString("utf8");
  serviceAccount = JSON.parse(jsonString);
} catch (e) {
  console.error("Failed to decode FIREBASE_ADMIN_BASE64:", e);
  throw e;
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const firestore = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

export { admin, firestore, FieldValue };
