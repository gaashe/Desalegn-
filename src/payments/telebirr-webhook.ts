/**
 * Telebirr Webhook Handler
 * Processes payment callbacks with signature verification and idempotency.
 *
 * Security Flow:
 * 1. Receive webhook POST from Telebirr
 * 2. Extract signature from headers/body
 * 3. Verify signature using Telebirr's public key
 * 4. Check idempotency (prevent double-funding)
 * 5. Update deposit status and user balance in atomic transaction
 */

import { PoolClient } from "pg";
import { verifySignature } from "./telebirr-crypto";

export interface TelebirrWebhookPayload {
  msisdn: string;
  outTradeNo: string;
  transactionNo: string;
  totalAmount: string;
  tradeStatus: "SUCCESS" | "FAILED" | "PENDING";
  tradeNo: string;
  timestamp: string;
}

export interface WebhookProcessResult {
  success: boolean;
  message: string;
  alreadyProcessed?: boolean;
}

/**
 * Verifies the Telebirr webhook signature.
 * Extracts the relevant fields, sorts them, and verifies against the signature.
 */
export function verifyWebhookSignature(
  body: TelebirrWebhookPayload,
  signature: string
): boolean {
  // Reconstruct the signed string from the payload
  const fields: Record<string, string> = {
    msisdn: body.msisdn,
    outTradeNo: body.outTradeNo,
    totalAmount: body.totalAmount,
    tradeNo: body.tradeNo,
    tradeStatus: body.tradeStatus,
    transactionNo: body.transactionNo,
    timestamp: body.timestamp,
  };

  const sortedKeys = Object.keys(fields).sort();
  const signString = sortedKeys
    .map((key) => `${key}=${fields[key]}`)
    .join("&");

  return verifySignature(signString, signature);
}

/**
 * Processes a verified Telebirr webhook within an atomic transaction.
 * Implements idempotency: if the deposit is already processed, returns early.
 *
 * Transaction steps:
 * 1. Lock the deposit row (SELECT ... FOR UPDATE)
 * 2. Check current status (idempotency guard)
 * 3. Update deposit status
 * 4. Credit user balance (only on SUCCESS)
 * 5. Commit or rollback
 */
export async function processWebhookPayment(
  client: PoolClient,
  payload: TelebirrWebhookPayload
): Promise<WebhookProcessResult> {
  // Step 1: Lock the deposit row to prevent race conditions
  const depositResult = await client.query(
    `SELECT id, user_id, amount, status
     FROM deposits
     WHERE out_trade_no = $1
     FOR UPDATE`,
    [payload.outTradeNo]
  );

  if (depositResult.rows.length === 0) {
    return {
      success: false,
      message: `No deposit found for outTradeNo: ${payload.outTradeNo}`,
    };
  }

  const deposit = depositResult.rows[0];

  // Step 2: Idempotency check - prevent double-funding
  if (deposit.status !== "pending") {
    return {
      success: true,
      message: `Deposit already processed with status: ${deposit.status}`,
      alreadyProcessed: true,
    };
  }

  // Step 3: Map Telebirr status to our status
  const newStatus = payload.tradeStatus === "SUCCESS" ? "success" : "failed";

  // Step 4: Update deposit status
  await client.query(
    `UPDATE deposits
     SET status = $1, telebirr_ref = $2, updated_at = NOW()
     WHERE id = $3`,
    [newStatus, payload.transactionNo, deposit.id]
  );

  // Step 5: Credit user balance ONLY on success
  if (payload.tradeStatus === "SUCCESS") {
    const amount = parseFloat(payload.totalAmount);

    if (isNaN(amount) || amount <= 0) {
      return {
        success: false,
        message: `Invalid amount in webhook: ${payload.totalAmount}`,
      };
    }

    await client.query(
      `UPDATE users
       SET balance = balance + $1, updated_at = NOW()
       WHERE id = $2`,
      [amount, deposit.user_id]
    );
  }

  return {
    success: true,
    message: `Deposit ${payload.outTradeNo} updated to ${newStatus}`,
  };
}
