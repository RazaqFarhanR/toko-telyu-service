import { admin } from "./firebaseService.js";

export async function sendFCM(userFcmToken, title, body, data = {}) {
  if (!userFcmToken) return;

  const message = { token: userFcmToken, notification: { title, body }, data };

  try {
    const response = await admin.messaging().send(message);
    console.debug("FCM sent:", response);
  } catch (err) {
    console.error("Error sending FCM:", err);
  }
}
