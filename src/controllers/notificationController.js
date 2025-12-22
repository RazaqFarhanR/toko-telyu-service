import { sendFCM } from '../services/notificationService.js';
import { admin } from '../services/firebaseService.js';

/**
 * Mapping transaction status ke label yang lebih friendly
 * @param {string} status - status internal (contoh: "PENDING", "OUTFORDELIVERY")
 * @returns {string} label yang user-friendly
 */
export function formatTransactionStatus(status) {
  switch (status) {
    case 'PENDING':
      return 'on Process';
    case 'READYFORPICKUP':
      return 'Ready for Pickup';
    case 'OUTFORDELIVERY':
      return 'Out for Delivery';
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
}

/**
 * Notify a user when their order status changes.
 * Expects { customerId, orderId, newStatus } in request body
 */
export async function notifyOrderStatus(req, res) {
  const { customerId, orderId, newStatus } = req.body;

  if (!customerId || !orderId || !newStatus) {
    return res.status(400).json({ 
      error: 'Missing required fields: customerId, orderId, newStatus' 
    });
  }

  try {
    const userSnap = await admin.firestore().collection('user').doc(customerId).get();
    if (!userSnap.exists) return res.status(404).json({ error: 'User not found' });

    const userData = userSnap.data();
    if (!userData.fcmToken) return res.json({ message: 'User has no FCM token' });

    const title = 'Order Update';
    const body = `Your order (ID: ${orderId}) status is now "${formatTransactionStatus(newStatus)}".`;
    const data = { orderId, orderStatus: newStatus };

    await sendFCM(userData.fcmToken, title, body, data);
    return res.json({ message: 'Notification sent to user.' });

  } catch (err) {
    console.error('Error sending notification to user:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Notify all admins when a new order is created.
 * Expects { orderId, customerName } in request body
 */
export async function notifyAdminsNewOrder(req, res) {
  const { orderId, customerName } = req.body;

  if (!orderId || !customerName) {
    return res.status(400).json({ 
      error: 'Missing required fields: orderId, customerName' 
    });
  }

  try {
    const adminSnap = await admin.firestore()
      .collection('user')
      .where('role', '==', 'RoleEnum.ADMIN')
      .get();

    if (adminSnap.empty) return res.json({ message: 'No admin users to notify.' });

    const notifications = [];
    adminSnap.forEach(doc => {
      const adminData = doc.data();
      if (adminData.fcmToken) {
        const title = 'New Order Placed';
        const body = `A new order (ID: ${orderId}) has been placed by ${customerName}.`;
        notifications.push(sendFCM(adminData.fcmToken, title, body, { orderId }));
      }
    });

    await Promise.all(notifications);
    return res.json({ message: 'Notifications sent to all admins.' });

  } catch (err) {
    console.error('Error sending admin notifications:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
