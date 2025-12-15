import express from "express";
import { createTransactionController } from "../controllers/transactionController.js";

const router = express.Router();
router.post("/", createTransactionController);

export default router;
