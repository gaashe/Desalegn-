/**
 * Auth API Routes
 * POST /api/auth/request-otp — Send OTP to phone number
 * POST /api/auth/verify-otp  — Verify OTP and get session token
 * GET  /api/auth/me           — Get current user info
 * POST /api/auth/logout        — Invalidate session
 */

import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validateBody } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import { requestOTP, verifyOTP } from "../services/auth";
import pool from "../db/pool";

const router = Router();

const requestOtpSchema = z.object({
  phone_number: z
    .string()
    .min(9, "Phone number too short")
    .max(15, "Phone number too long")
    .regex(/^[+0-9]+$/, "Invalid phone number format"),
});

const verifyOtpSchema = z.object({
  phone_number: z
    .string()
    .min(9, "Phone number too short")
    .max(15, "Phone number too long"),
  code: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must be 6 digits"),
});

/**
 * POST /api/auth/request-otp
 * Sends a 6-digit OTP to the given phone number.
 */
router.post(
  "/request-otp",
  validateBody(requestOtpSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { phone_number } = req.body as { phone_number: string };
      const result = await requestOTP(phone_number);

      if (!result.success) {
        res.status(429).json({ error: result.message });
        return;
      }

      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/verify-otp
 * Verifies OTP code and returns session token + user info.
 */
router.post(
  "/verify-otp",
  validateBody(verifyOtpSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { phone_number, code } = req.body as { phone_number: string; code: string };
      const result = await verifyOTP(phone_number, code);

      if (!result.success) {
        res.status(401).json({ error: result.message });
        return;
      }

      res.status(200).json({
        success: true,
        token: result.token,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/auth/me
 * Returns current authenticated user info.
 */
router.get(
  "/me",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await pool.query(
        `SELECT id, phone_number, balance, is_verified, language_pref, created_at
         FROM users WHERE id = $1`,
        [req.userId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const user = result.rows[0];
      res.status(200).json({
        id: user.id,
        phone: user.phone_number,
        balance: parseFloat(user.balance),
        is_verified: user.is_verified,
        language_pref: user.language_pref,
        created_at: user.created_at,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/logout
 * Invalidates the current session token.
 */
router.post(
  "/logout",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.headers.authorization?.substring(7);
      await pool.query(`DELETE FROM sessions WHERE token = $1`, [token]);
      res.status(200).json({ success: true, message: "Logged out" });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
