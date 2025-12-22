import express from "express";
import { notifyAdminsNewOrder, notifyOrderStatus } from "../controllers/notificationController.js";

const router = express.Router();

router.post('/order-status', notifyOrderStatus);
router.post('/order-new', notifyAdminsNewOrder);

export default router;
