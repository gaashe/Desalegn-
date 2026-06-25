/**
 * Betting API Router
 * POST /api/bets/place - Places a bet using atomic database transaction.
 *
 * Transaction Flow:
 * 1. Validate input (event_id, stake, odds, market_description)
 * 2. BEGIN transaction
 * 3. Lock user row (SELECT ... FOR UPDATE) to prevent race conditions
 * 4. Verify sufficient balance
 * 5. Deduct stake from user balance
 * 6. Insert bet record
 * 7. COMMIT (or ROLLBACK on any failure)
 */

import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import pool from "../db/pool";
import { validateBody } from "../middleware/validate";
import { LocalizedField } from "../i18n";

const router = Router();

// Input validation schema
const placeBetSchema = z.object({
  user_id: z.string().uuid("Invalid user ID format"),
  event_id: z.string().uuid("Invalid event ID format"),
  market_description: z.object({
    en: z.string().min(1, "English market description required"),
    am: z.string().optional(),
  }),
  stake: z
    .number()
    .positive("Stake must be positive")
    .max(100000, "Maximum stake is 100,000 ETB"),
  odds: z.number().gt(1.0, "Odds must be greater than 1.0"),
});

type PlaceBetInput = z.infer<typeof placeBetSchema>;

/**
 * POST /api/bets/place
 * Atomically deducts balance and records a bet.
 */
router.post(
  "/place",
  validateBody(placeBetSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { user_id, event_id, market_description, stake, odds } =
      req.body as PlaceBetInput;

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Step 1: Lock user row and check balance
      const userResult = await client.query(
        `SELECT id, balance, is_verified
         FROM users
         WHERE id = $1
         FOR UPDATE`,
        [user_id]
      );

      if (userResult.rows.length === 0) {
        await client.query("ROLLBACK");
        res.status(404).json({ error: "User not found" });
        return;
      }

      const user = userResult.rows[0];

      // Verify user account
      if (!user.is_verified) {
        await client.query("ROLLBACK");
        res.status(403).json({ error: "Account not verified" });
        return;
      }

      // Check sufficient balance
      const currentBalance = parseFloat(user.balance);
      if (currentBalance < stake) {
        await client.query("ROLLBACK");
        res.status(400).json({
          error: "Insufficient balance",
          available: currentBalance,
          required: stake,
        });
        return;
      }

      // Step 2: Verify event exists and is open for betting
      const eventResult = await client.query(
        `SELECT id, status, start_time
         FROM events
         WHERE id = $1`,
        [event_id]
      );

      if (eventResult.rows.length === 0) {
        await client.query("ROLLBACK");
        res.status(404).json({ error: "Event not found" });
        return;
      }

      const event = eventResult.rows[0];
      if (event.status !== "upcoming" && event.status !== "live") {
        await client.query("ROLLBACK");
        res.status(400).json({ error: "Event is not open for betting" });
        return;
      }

      // Step 3: Deduct stake from user balance
      // The CHECK constraint (balance >= 0) provides an additional safety net
      await client.query(
        `UPDATE users
         SET balance = balance - $1, updated_at = NOW()
         WHERE id = $2`,
        [stake, user_id]
      );

      // Step 4: Insert bet record
      const betResult = await client.query(
        `INSERT INTO bets (user_id, event_id, market_description, stake, odds, status)
         VALUES ($1, $2, $3, $4, $5, 'pending')
         RETURNING id, stake, odds, potential_payout, status, created_at`,
        [user_id, event_id, JSON.stringify(market_description), stake, odds]
      );

      // Step 5: Commit transaction
      await client.query("COMMIT");

      const bet = betResult.rows[0];
      res.status(201).json({
        success: true,
        bet: {
          id: bet.id,
          event_id,
          market_description: market_description as LocalizedField,
          stake: parseFloat(bet.stake),
          odds: parseFloat(bet.odds),
          potential_payout: parseFloat(bet.potential_payout),
          status: bet.status,
          created_at: bet.created_at,
        },
        remaining_balance: currentBalance - stake,
      });
    } catch (error) {
      // Rollback on any unexpected error
      await client.query("ROLLBACK");
      next(error);
    } finally {
      client.release();
    }
  }
);

export default router;
