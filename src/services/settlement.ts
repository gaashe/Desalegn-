/**
 * Bet Settlement Service
 * Polls for completed events and settles outstanding bets.
 *
 * Settlement logic:
 * 1. Find events that have ended (start_time + ~2hrs in the past)
 * 2. Fetch final scores from The Odds API
 * 3. Determine winners (home/draw/away)
 * 4. Update all pending bets atomically: won bets credit user balance
 */

import pool from "../db/pool";

const API_BASE = "https://api.the-odds-api.com/v4";
const API_KEY = process.env.ODDS_API_KEY || "";

interface ScoreResult {
  id: string;
  home_team: string;
  away_team: string;
  scores: Array<{ name: string; score: string }> | null;
  completed: boolean;
}

/**
 * Fetches scores for completed events from The Odds API.
 */
async function fetchScores(sport: string = "soccer_epl"): Promise<ScoreResult[]> {
  if (!API_KEY) {
    return [];
  }

  const url = `${API_BASE}/sports/${sport}/scores/?apiKey=${API_KEY}&daysFrom=1`;
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Scores API error: ${response.status}`);
    return [];
  }

  return (await response.json()) as ScoreResult[];
}

/**
 * Determines the match result from scores.
 */
function determineResult(scores: Array<{ name: string; score: string }>, homeTeam: string): "home" | "draw" | "away" {
  const homeScore = scores.find((s) => s.name === homeTeam);
  const awayScore = scores.find((s) => s.name !== homeTeam);

  if (!homeScore || !awayScore) return "draw";

  const h = parseInt(homeScore.score, 10);
  const a = parseInt(awayScore.score, 10);

  if (h > a) return "home";
  if (a > h) return "away";
  return "draw";
}

/**
 * Settles all pending bets for a completed event.
 * Atomic transaction: update event, settle bets, credit winners.
 */
async function settleEvent(eventId: string, result: "home" | "draw" | "away", score: string): Promise<number> {
  const client = await pool.connect();
  let settled = 0;

  try {
    await client.query("BEGIN");

    // Mark event as completed
    await client.query(
      `UPDATE events SET status = 'completed', score = $1, updated_at = NOW() WHERE id = $2`,
      [JSON.stringify({ result, score }), eventId]
    );

    // Get all pending bets for this event
    const betsResult = await client.query(
      `SELECT id, user_id, selection, stake, odds, potential_payout
       FROM bets
       WHERE event_id = $1 AND status = 'pending'
       FOR UPDATE`,
      [eventId]
    );

    for (const bet of betsResult.rows) {
      const won = bet.selection === result;
      const newStatus = won ? "won" : "lost";

      // Update bet status
      await client.query(
        `UPDATE bets SET status = $1, event_result = $2, settled_at = NOW() WHERE id = $3`,
        [newStatus, result, bet.id]
      );

      // Credit winnings to user balance
      if (won) {
        await client.query(
          `UPDATE users SET balance = balance + $1, updated_at = NOW() WHERE id = $2`,
          [parseFloat(bet.potential_payout), bet.user_id]
        );
      }

      settled++;
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(`Settlement failed for event ${eventId}:`, error);
    throw error;
  } finally {
    client.release();
  }

  return settled;
}

/**
 * Main settlement loop - checks for events that should be settled.
 * Called periodically (e.g., every 5 minutes via setInterval).
 */
export async function runSettlement(): Promise<{ eventsSettled: number; betsSettled: number }> {
  let eventsSettled = 0;
  let betsSettled = 0;

  // Method 1: Use API scores for events with external_id
  const scores = await fetchScores();
  for (const scoreResult of scores) {
    if (!scoreResult.completed || !scoreResult.scores) continue;

    const eventResult = await pool.query(
      `SELECT id FROM events WHERE external_id = $1 AND status != 'completed'`,
      [scoreResult.id]
    );

    if (eventResult.rows.length === 0) continue;

    const result = determineResult(scoreResult.scores, scoreResult.home_team);
    const scoreStr = scoreResult.scores.map((s) => `${s.name}: ${s.score}`).join(", ");

    const settled = await settleEvent(eventResult.rows[0].id, result, scoreStr);
    eventsSettled++;
    betsSettled += settled;
  }

  // Method 2: Auto-settle demo events that are >2 hours past start_time
  const overdueEvents = await pool.query(
    `SELECT id FROM events
     WHERE status IN ('upcoming', 'live')
       AND external_id LIKE 'demo_%'
       AND start_time < NOW() - INTERVAL '2 hours'`
  );

  for (const event of overdueEvents.rows) {
    const results: Array<"home" | "draw" | "away"> = ["home", "draw", "away"];
    const randomResult = results[Math.floor(Math.random() * results.length)];
    const settled = await settleEvent(event.id, randomResult, "Demo result");
    eventsSettled++;
    betsSettled += settled;
  }

  if (eventsSettled > 0) {
    console.error(`Settlement complete: ${eventsSettled} events, ${betsSettled} bets settled`);
  }

  return { eventsSettled, betsSettled };
}

/**
 * Starts the settlement polling loop.
 */
export function startSettlementWorker(intervalMs: number = 300000): NodeJS.Timeout {
  console.error(`Settlement worker started (polling every ${intervalMs / 1000}s)`);
  // Run immediately on start
  runSettlement().catch((err) => console.error("Settlement error:", err));
  // Then poll periodically
  return setInterval(() => {
    runSettlement().catch((err) => console.error("Settlement error:", err));
  }, intervalMs);
}
