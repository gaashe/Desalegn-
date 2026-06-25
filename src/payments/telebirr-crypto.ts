/**
 * Telebirr RSA-2048 Cryptography Module
 * Handles signing outgoing requests and verifying incoming webhooks.
 *
 * Security Notes:
 * - Private key is used to sign outgoing payment requests.
 * - Telebirr's public key is used to verify incoming webhook signatures.
 * - Keys are loaded from environment variables (base64-encoded PEM).
 */

import crypto from "crypto";

const ALGORITHM = "SHA256";
const PADDING = crypto.constants.RSA_PKCS1_PADDING;

/**
 * Loads and decodes a base64-encoded PEM key from environment variables.
 */
function loadKey(envVar: string): string {
  const base64Key = process.env[envVar];
  if (!base64Key) {
    throw new Error(`Missing environment variable: ${envVar}`);
  }
  return Buffer.from(base64Key, "base64").toString("utf-8");
}

/**
 * Signs a payload string using our RSA-2048 private key.
 * Used for outgoing payment requests to Telebirr.
 */
export function signPayload(payload: string): string {
  const privateKey = loadKey("TELEBIRR_PRIVATE_KEY");

  const signer = crypto.createSign(ALGORITHM);
  signer.update(payload, "utf-8");
  signer.end();

  return signer.sign(
    {
      key: privateKey,
      padding: PADDING,
    },
    "base64"
  );
}

/**
 * Verifies an incoming webhook signature from Telebirr.
 * Returns true if the signature is valid.
 */
export function verifySignature(payload: string, signature: string): boolean {
  const publicKey = loadKey("TELEBIRR_PUBLIC_KEY");

  const verifier = crypto.createVerify(ALGORITHM);
  verifier.update(payload, "utf-8");
  verifier.end();

  try {
    return verifier.verify(
      {
        key: publicKey,
        padding: PADDING,
      },
      signature,
      "base64"
    );
  } catch {
    return false;
  }
}

/**
 * Encrypts a payload using Telebirr's public key (for sensitive data in requests).
 */
export function encryptWithPublicKey(plaintext: string): string {
  const publicKey = loadKey("TELEBIRR_PUBLIC_KEY");

  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(plaintext, "utf-8")
  );

  return encrypted.toString("base64");
}

/**
 * Generates a unique trade number for payment tracking.
 */
export function generateOutTradeNo(): string {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(4).toString("hex");
  return `EB${timestamp}${random}`;
}
