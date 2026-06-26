/**
 * EthioBet Server Entry Point
 * Production-ready Express server with security middleware,
 * OTP authentication, live odds, and bet settlement.
 */

import express from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import betsRouter from "./api/bets";
import paymentsRouter from "./api/payments";
import authRouter from "./api/auth";
import eventsRouter from "./api/events";
import userRouter from "./api/user";
import { errorHandler } from "./middleware/error-handler";
import { startSettlementWorker } from "./services/settlement";
import { syncEvents } from "./services/odds";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

// Serve static frontend files in production
const frontendDist = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendDist));

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/events", eventsRouter);
app.use("/api/bets", betsRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/user", userRouter);

// SPA fallback — serve index.html for non-API routes
app.get("*", (_req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"), (err) => {
    if (err) {
      res.status(200).json({ status: "ok", message: "EthioBet API" });
    }
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.error(`EthioBet server running on port ${PORT}`);
  console.error(`Environment: ${process.env.NODE_ENV || "development"}`);

  // Sync events on startup (non-blocking)
  syncEvents().then((count) => {
    console.error(`Synced ${count} events on startup`);
  }).catch((err) => {
    console.error("Event sync error:", err);
  });

  // Start settlement worker (polls every 5 minutes)
  startSettlementWorker(300000);
});

export default app;
