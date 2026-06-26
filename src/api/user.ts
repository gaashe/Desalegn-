/**
 * User API Routes
 * GET /api/user/balance — Get user balance
 * GET /api/user/bets    — Get user bet history
 */

import { Router, Request, Response, NextFunction } from "express";
import pool from "../db/pool";

const router = Router();

/**
 * GET /api/user/:id/balance
 */
router.get(
  "/:id/balance",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await pool.query(
        `SELECT id, balance, phone_number FROM users WHERE id = $1`,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.status(200).json({
        balance: parseFloat(result.rows[0].balance),
        phone: result.rows[0].phone_number,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/user/:id/bets
 */
router.get(
  "/:id/bets",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lang = (req.query.lang as string) || "en";
      const result = await pool.query(
        `SELECT b.id, b.event_id, b.market_description, b.stake, b.odds,
                b.potential_payout, b.status, b.selection, b.event_result,
                b.settled_at, b.created_at,
                e.title as event_title, e.home_team, e.away_team
         FROM bets b
         LEFT JOIN events e ON b.event_id = e.id
         WHERE b.user_id = $1
         ORDER BY b.created_at DESC
         LIMIT 50`,
        [req.params.id]
      );

      const bets = result.rows.map((row) => ({
        id: row.id,
        event_id: row.event_id,
        event_title: resolveLocalized(row.event_title, lang),
        home_team: resolveLocalized(row.home_team, lang),
        away_team: resolveLocalized(row.away_team, lang),
        market_description: resolveLocalized(row.market_description, lang),
        stake: parseFloat(row.stake),
        odds: parseFloat(row.odds),
        potential_payout: parseFloat(row.potential_payout),
        status: row.status,
        selection: row.selection,
        event_result: row.event_result,
        settled_at: row.settled_at,
        created_at: row.created_at,
      }));

      res.status(200).json({ bets, count: bets.length });
    } catch (error) {
      next(error);
    }
  }
);

function resolveLocalized(field: Record<string, string> | null, lang: string): string {
  if (!field) return "";
  return field[lang] || field["en"] || Object.values(field)[0] || "";
}

export default router;
