/**
 * Auth Service - Phone number OTP authentication.
 *
 * Flow:
 * 1. User requests OTP → code generated, stored in DB, sent via SMS
 * 2. User submits code → verified against DB → session token returned
 *
 * SMS provider: Africa's Talking API (when configured).
 * Falls back to logging the OTP code for development.
 */

import crypto from "crypto";
import pool from "../db/pool";

const OTP_EXPIRY_MINUTES = 5;
const SESSION_EXPIRY_HOURS = 24 * 7; // 1 week

const AT_API_KEY = process.env.AFRICASTALKING_API_KEY || "";
const AT_USERNAME = process.env.AFRICASTALKING_USERNAME || "";
const AT_SENDER_ID = process.env.AFRICASTALKING_SENDER_ID || "EthioBet";

/**
 * Generate a 6-digit OTP code.
 */
function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Generate a secure session token.
 */
function generateToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

/**
 * Sends OTP via Africa's Talking SMS API.
 * Falls back to console logging in development.
 */
async function sendSMS(phone: string, message: string): Promise<boolean> {
  if (!AT_API_KEY || !AT_USERNAME) {
    console.error(`[DEV] SMS to ${phone}: ${message}`);
    return true;
  }

  try {
    const url = "https://api.africastalking.com/version1/messaging";
    const body = new URLSearchParams({
      username: AT_USERNAME,
      to: phone,
      message: message,
      from: AT_SENDER_ID,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        apiKey: AT_API_KEY,
      },
      body: body.toString(),
    });

    if (!response.ok) {
      console.error(`SMS API error: ${response.status}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error("SMS send failed:", error);
    return false;
  }
}

/**
 * Requests an OTP for a phone number.
 * Creates the user if they don't exist.
 */
export async function requestOTP(phoneNumber: string): Promise<{ success: boolean; message: string }> {
  // Normalize phone number (ensure +251 prefix)
  const phone = normalizePhone(phoneNumber);

  // Rate limit: max 3 active OTPs per phone
  const activeCount = await pool.query(
    `SELECT COUNT(*) FROM otp_codes WHERE phone_number = $1 AND used = FALSE AND expires_at > NOW()`,
    [phone]
  );
  if (parseInt(activeCount.rows[0].count, 10) >= 3) {
    return { success: false, message: "Too many OTP requests. Please wait before trying again." };
  }

  const code = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Store OTP
  await pool.query(
    `INSERT INTO otp_codes (phone_number, code, expires_at) VALUES ($1, $2, $3)`,
    [phone, code, expiresAt]
  );

  // Send SMS
  const message = `Your EthioBet verification code is: ${code}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`;
  await sendSMS(phone, message);

  return { success: true, message: "OTP sent successfully" };
}

/**
 * Verifies an OTP code and returns a session token.
 */
export async function verifyOTP(
  phoneNumber: string,
  code: string
): Promise<{ success: boolean; token?: string; user?: { id: string; phone: string; balance: number }; message: string }> {
  const phone = normalizePhone(phoneNumber);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Find valid OTP
    const otpResult = await client.query(
      `SELECT id FROM otp_codes
       WHERE phone_number = $1 AND code = $2 AND used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1
       FOR UPDATE`,
      [phone, code]
    );

    if (otpResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return { success: false, message: "Invalid or expired OTP code" };
    }

    // Mark OTP as used
    await client.query(`UPDATE otp_codes SET used = TRUE WHERE id = $1`, [otpResult.rows[0].id]);

    // Upsert user (create if first login)
    const userResult = await client.query(
      `INSERT INTO users (phone_number, is_verified, balance)
       VALUES ($1, TRUE, 500.00)
       ON CONFLICT (phone_number) DO UPDATE SET is_verified = TRUE, updated_at = NOW()
       RETURNING id, phone_number, balance`,
      [phone]
    );

    const user = userResult.rows[0];

    // Create session
    const token = generateToken();
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY_HOURS * 3600 * 1000);

    await client.query(
      `INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)`,
      [user.id, token, expiresAt]
    );

    await client.query("COMMIT");

    return {
      success: true,
      token,
      user: {
        id: user.id,
        phone: user.phone_number,
        balance: parseFloat(user.balance),
      },
      message: "Login successful",
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Validates a session token and returns the user.
 */
export async function validateSession(
  token: string
): Promise<{ valid: boolean; userId?: string; phone?: string } | null> {
  const result = await pool.query(
    `SELECT s.user_id, u.phone_number
     FROM sessions s
     JOIN users u ON s.user_id = u.id
     WHERE s.token = $1 AND s.expires_at > NOW()`,
    [token]
  );

  if (result.rows.length === 0) return null;

  return {
    valid: true,
    userId: result.rows[0].user_id,
    phone: result.rows[0].phone_number,
  };
}

/**
 * Normalize Ethiopian phone numbers to +251 format.
 */
function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/\s+/g, "").replace(/-/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "+251" + cleaned.substring(1);
  } else if (cleaned.startsWith("251") && !cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  } else if (!cleaned.startsWith("+")) {
    cleaned = "+251" + cleaned;
  }
  return cleaned;
}
