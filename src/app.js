import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import transactionRoutes from "./routes/transaction.js";
import webhookRoutes from "./routes/webhook.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/transaction", transactionRoutes);
app.use("/api/webhook", webhookRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
