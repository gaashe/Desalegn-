/**
 * EthioBet Server Entry Point
 * Production-ready Express server with security middleware.
 */

import express from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";

import betsRouter from "./api/bets";
import paymentsRouter from "./api/payments";
import { errorHandler } from "./middleware/error-handler";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/bets", betsRouter);
app.use("/api/payments", paymentsRouter);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.error(`EthioBet server running on port ${PORT}`);
  console.error(`Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
