/**
 * Events API Routes
 * GET  /api/events         — List upcoming/live events with odds
 * GET  /api/events/:id     — Get single event details
 * POST /api/events/sync    — Trigger odds sync from external API
 * GET  /api/events/results — Get settled events with results
 */

import { Router, Request, Response, NextFunction } from "express";
import pool from "../db/pool";
import { syncEvents } from "../services/odds";
import { runSettlement } from "../services/settlement";

const router = Router();

/**
 * GET /api/events
 * Returns all upcoming and live events with odds.
 */
router.get(
  "/",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lang = (req.query.lang as string) || "en";
      const status = (req.query.status as string) || "upcoming,live";
      const statusList = status.split(",").map((s) => s.trim());

      const result = await pool.query(
        `SELECT id, title, home_team, away_team, start_time, status, league, odds, sport_type, external_id
         FROM events
         WHERE status = ANY($1)
         ORDER BY start_time ASC
         LIMIT 50`,
        [statusList]
      );

      const events = result.rows.map((row) => ({
        id: row.id,
        title: resolveLocalized(row.title, lang),
        home_team: resolveLocalized(row.home_team, lang),
        away_team: resolveLocalized(row.away_team, lang),
        start_time: row.start_time,
        status: row.status,
        league: row.league,
        odds: row.odds,
        sport_type: row.sport_type,
      }));

      res.status(200).json({ events, count: events.length });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/events/:id
 * Returns a single event with full details.
 */
router.get(
  "/:id",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lang = (req.query.lang as string) || "en";
      const result = await pool.query(
        `SELECT id, title, home_team, away_team, start_time, status, league, odds, sport_type, score
         FROM events WHERE id = $1`,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: "Event not found" });
        return;
      }

      const row = result.rows[0];
      res.status(200).json({
        id: row.id,
        title: resolveLocalized(row.title, lang),
        home_team: resolveLocalized(row.home_team, lang),
        away_team: resolveLocalized(row.away_team, lang),
        start_time: row.start_time,
        status: row.status,
        league: row.league,
        odds: row.odds,
        sport_type: row.sport_type,
        score: row.score,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/events/sync
 * Triggers a sync of events from the odds API.
 */
router.post(
  "/sync",
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const synced = await syncEvents();
      res.status(200).json({ success: true, events_synced: synced });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/events/settle
 * Triggers settlement of completed events.
 */
router.post(
  "/settle",
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await runSettlement();
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/events/results
 * Returns recently completed events with results.
 */
router.get(
  "/results/list",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lang = (req.query.lang as string) || "en";
      const result = await pool.query(
        `SELECT id, title, home_team, away_team, start_time, status, league, score
         FROM events
         WHERE status = 'completed'
         ORDER BY updated_at DESC
         LIMIT 20`
      );

      const events = result.rows.map((row) => ({
        id: row.id,
        title: resolveLocalized(row.title, lang),
        home_team: resolveLocalized(row.home_team, lang),
        away_team: resolveLocalized(row.away_team, lang),
        start_time: row.start_time,
        league: row.league,
        score: row.score,
      }));

      res.status(200).json({ events });
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
