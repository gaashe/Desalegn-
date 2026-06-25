/**
 * Telebirr Payment Client
 * Handles creating payment requests and processing callbacks.
 */

import { signPayload, encryptWithPublicKey, generateOutTradeNo } from "./telebirr-crypto";

export interface CreatePaymentRequest {
  userId: string;
  amount: number;
  subject: string;
}

export interface TelebirrPaymentPayload {
  appId: string;
  appKey: string;
  outTradeNo: string;
  subject: string;
  totalAmount: string;
  shortCode: string;
  notifyUrl: string;
  receiveName: string;
  returnUrl: string;
  timeoutExpress: string;
  nonce: string;
  timestamp: string;
}

export interface CreatePaymentResponse {
  outTradeNo: string;
  signedRequest: {
    appid: string;
    sign: string;
    ussd: string;
  };
}

/**
 * Creates a signed Telebirr payment request.
 * The flow:
 * 1. Generate unique trade number
 * 2. Build payload with required fields
 * 3. Sign the serialized payload with our private key
 * 4. Encrypt the payload with Telebirr's public key
 * 5. Return the signed request for client submission
 */
export function createPaymentRequest(
  request: CreatePaymentRequest
): CreatePaymentResponse {
  const appId = process.env.TELEBIRR_APP_ID!;
  const appKey = process.env.TELEBIRR_APP_KEY!;
  const shortCode = process.env.TELEBIRR_SHORT_CODE!;
  const notifyUrl = process.env.TELEBIRR_NOTIFY_URL!;

  const outTradeNo = generateOutTradeNo();
  const timestamp = Date.now().toString();
  const nonce = Math.random().toString(36).substring(2, 15);

  const payload: TelebirrPaymentPayload = {
    appId,
    appKey,
    outTradeNo,
    subject: request.subject,
    totalAmount: request.amount.toFixed(2),
    shortCode,
    notifyUrl,
    receiveName: "EthioBet",
    returnUrl: `${process.env.FRONTEND_URL || ""}/wallet/status`,
    timeoutExpress: "30", // 30 minutes
    nonce,
    timestamp,
  };

  // Sort keys alphabetically and serialize for signing
  const sortedKeys = Object.keys(payload).sort() as Array<keyof TelebirrPaymentPayload>;
  const signString = sortedKeys
    .map((key) => `${key}=${payload[key]}`)
    .join("&");

  // Sign the payload
  const signature = signPayload(signString);

  // Encrypt the full payload for transmission
  const encryptedPayload = encryptWithPublicKey(JSON.stringify(payload));

  return {
    outTradeNo,
    signedRequest: {
      appid: appId,
      sign: signature,
      ussd: encryptedPayload,
    },
  };
}
