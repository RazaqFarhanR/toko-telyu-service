import express from "express";
import { notifyAdminsNewOrder, notifyOrderStatus } from "../controllers/notificationController.js";

const router = express.Router();

router.post('/ordertatus', notifyOrderStatus);
router.post('/order-new', notifyAdminsNewOrder);

export default router;
