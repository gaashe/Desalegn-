/**
 * Payments API Router
 * POST /api/payments/telebirr-webhook - Handles Telebirr payment callbacks.
 *
 * Security Flow:
 * 1. Extract signature from request
 * 2. Verify RSA-2048 signature against Telebirr's public key
 * 3. Validate payload structure
 * 4. Process payment idempotently within atomic transaction
 * 5. Return appropriate response to Telebirr
 */

import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import pool from "../db/pool";
import { validateBody } from "../middleware/validate";
import {
  TelebirrWebhookPayload,
  verifyWebhookSignature,
  processWebhookPayment,
} from "../payments/telebirr-webhook";
import { createPaymentRequest } from "../payments/telebirr-client";

const router = Router();

// Webhook payload validation schema
const webhookSchema = z.object({
  msisdn: z.string().min(1),
  outTradeNo: z.string().min(1),
  transactionNo: z.string().min(1),
  totalAmount: z.string().min(1),
  tradeStatus: z.enum(["SUCCESS", "FAILED", "PENDING"]),
  tradeNo: z.string().min(1),
  timestamp: z.string().min(1),
});

// Deposit initiation schema
const initiateDepositSchema = z.object({
  user_id: z.string().uuid("Invalid user ID"),
  amount: z
    .number()
    .min(10, "Minimum deposit is 10 ETB")
    .max(50000, "Maximum deposit is 50,000 ETB"),
});

/**
 * POST /api/payments/initiate
 * Creates a new deposit record and returns signed Telebirr payment request.
 */
router.post(
  "/initiate",
  validateBody(initiateDepositSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { user_id, amount } = req.body as { user_id: string; amount: number };

    const client = await pool.connect();
    try {
      // Verify user exists
      const userResult = await client.query(
        "SELECT id, is_verified FROM users WHERE id = $1",
        [user_id]
      );

      if (userResult.rows.length === 0) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      if (!userResult.rows[0].is_verified) {
        res.status(403).json({ error: "Account not verified" });
        return;
      }

      // Create signed payment request
      const paymentRequest = createPaymentRequest({
        userId: user_id,
        amount,
        subject: "EthioBet Deposit",
      });

      // Record the pending deposit
      await client.query(
        `INSERT INTO deposits (user_id, amount, out_trade_no, status)
         VALUES ($1, $2, $3, 'pending')`,
        [user_id, amount, paymentRequest.outTradeNo]
      );

      res.status(200).json({
        success: true,
        outTradeNo: paymentRequest.outTradeNo,
        paymentData: paymentRequest.signedRequest,
      });
    } catch (error) {
      next(error);
    } finally {
      client.release();
    }
  }
);

/**
 * POST /api/payments/telebirr-webhook
 * Handles incoming Telebirr payment notifications.
 *
 * Implementation Details:
 * - Signature verification prevents forged requests
 * - Atomic transaction ensures consistency
 * - Idempotency check prevents double-funding
 * - Only SUCCESS status triggers balance credit
 */
router.post(
  "/telebirr-webhook",
  validateBody(webhookSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const payload = req.body as TelebirrWebhookPayload;

    // Step 1: Extract signature from request headers
    const signature =
      (req.headers["x-telebirr-signature"] as string) ||
      (req.headers["sign"] as string) ||
      "";

    if (!signature) {
      console.error("Webhook received without signature");
      res.status(401).json({ code: "SIGNATURE_MISSING" });
      return;
    }

    // Step 2: Verify the RSA signature
    const isValid = verifyWebhookSignature(payload, signature);
    if (!isValid) {
      console.error(
        `Invalid webhook signature for outTradeNo: ${payload.outTradeNo}`
      );
      res.status(401).json({ code: "SIGNATURE_INVALID" });
      return;
    }

    // Step 3: Process payment in atomic transaction
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const result = await processWebhookPayment(client, payload);

      if (!result.success) {
        await client.query("ROLLBACK");
        console.error(`Webhook processing failed: ${result.message}`);
        res.status(400).json({ code: "PROCESSING_FAILED", message: result.message });
        return;
      }

      await client.query("COMMIT");

      // Telebirr expects a specific success response format
      res.status(200).json({
        code: 0,
        msg: "success",
        ...(result.alreadyProcessed && { note: "Already processed" }),
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Webhook transaction failed:", error);
      next(error);
    } finally {
      client.release();
    }
  }
);

export default router;
