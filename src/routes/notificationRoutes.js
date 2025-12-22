import express from "express";
import { notifyAdminsNewOrder, notifyOrderStatus } from "../controllers/notificationController.js";

const router = express.Router();

router.post('/status', notifyOrderStatus);
router.post('/new', notifyAdminsNewOrder);

export default router;
