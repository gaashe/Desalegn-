/**
 * Odds Service - Fetches live sports data from The Odds API.
 * Syncs events and odds into the local database.
 *
 * Free tier: 500 requests/month.
 * Docs: https://the-odds-api.com/liveapi/guides/v4/
 */

import pool from "../db/pool";

const API_BASE = "https://api.the-odds-api.com/v4";
const API_KEY = process.env.ODDS_API_KEY || "";

interface OddsApiEvent {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Array<{
    key: string;
    title: string;
    markets: Array<{
      key: string;
      outcomes: Array<{
        name: string;
        price: number;
      }>;
    }>;
  }>;
}

interface ParsedEvent {
  external_id: string;
  title: { en: string; am: string };
  home_team: { en: string; am: string };
  away_team: { en: string; am: string };
  start_time: string;
  league: string;
  odds: { home: number; draw: number; away: number };
}

/**
 * Fetches upcoming football events with odds.
 */
export async function fetchLiveOdds(sport: string = "soccer_epl"): Promise<ParsedEvent[]> {
  if (!API_KEY) {
    console.error("ODDS_API_KEY not configured, using demo data");
    return getDemoEvents();
  }

  const url = `${API_BASE}/sports/${sport}/odds/?apiKey=${API_KEY}&regions=eu&markets=h2h&oddsFormat=decimal`;

  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Odds API error: ${response.status} ${response.statusText}`);
    return getDemoEvents();
  }

  const events: OddsApiEvent[] = (await response.json()) as OddsApiEvent[];
  return events.map(parseEvent).filter((e): e is ParsedEvent => e !== null);
}

function parseEvent(event: OddsApiEvent): ParsedEvent | null {
  const bookmaker = event.bookmakers[0];
  if (!bookmaker) return null;

  const h2h = bookmaker.markets.find((m) => m.key === "h2h");
  if (!h2h) return null;

  const homeOutcome = h2h.outcomes.find((o) => o.name === event.home_team);
  const awayOutcome = h2h.outcomes.find((o) => o.name === event.away_team);
  const drawOutcome = h2h.outcomes.find((o) => o.name === "Draw");

  return {
    external_id: event.id,
    title: {
      en: `${event.home_team} vs ${event.away_team}`,
      am: `${event.home_team} vs ${event.away_team}`,
    },
    home_team: { en: event.home_team, am: event.home_team },
    away_team: { en: event.away_team, am: event.away_team },
    start_time: event.commence_time,
    league: event.sport_title,
    odds: {
      home: homeOutcome?.price || 2.0,
      draw: drawOutcome?.price || 3.5,
      away: awayOutcome?.price || 3.0,
    },
  };
}

/**
 * Syncs fetched events into the database (upsert by external_id).
 */
export async function syncEvents(sport?: string): Promise<number> {
  const events = await fetchLiveOdds(sport);
  let synced = 0;

  for (const event of events) {
    const startTime = new Date(event.start_time);
    const status = startTime > new Date() ? "upcoming" : "live";

    await pool.query(
      `INSERT INTO events (external_id, title, home_team, away_team, start_time, status, league, odds, sport_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'football')
       ON CONFLICT (external_id) DO UPDATE SET
         title = EXCLUDED.title,
         odds = EXCLUDED.odds,
         status = EXCLUDED.status,
         home_team = EXCLUDED.home_team,
         away_team = EXCLUDED.away_team,
         updated_at = NOW()`,
      [
        event.external_id,
        JSON.stringify(event.title),
        JSON.stringify(event.home_team),
        JSON.stringify(event.away_team),
        event.start_time,
        status,
        event.league,
        JSON.stringify(event.odds),
      ]
    );
    synced++;
  }

  return synced;
}

/**
 * Demo events for when no API key is configured.
 */
function getDemoEvents(): ParsedEvent[] {
  const now = Date.now();
  return [
    {
      external_id: "demo_epl_1",
      title: { en: "Arsenal vs Chelsea", am: "አርሰናል vs ቼልሲ" },
      home_team: { en: "Arsenal", am: "አርሰናል" },
      away_team: { en: "Chelsea", am: "ቼልሲ" },
      start_time: new Date(now + 7200000).toISOString(),
      league: "English Premier League",
      odds: { home: 2.1, draw: 3.4, away: 3.6 },
    },
    {
      external_id: "demo_epl_2",
      title: { en: "Man City vs Liverpool", am: "ማን ሲቲ vs ሊቨርፑል" },
      home_team: { en: "Man City", am: "ማን ሲቲ" },
      away_team: { en: "Liverpool", am: "ሊቨርፑል" },
      start_time: new Date(now + 3600000).toISOString(),
      league: "English Premier League",
      odds: { home: 1.85, draw: 3.6, away: 4.2 },
    },
    {
      external_id: "demo_epl_3",
      title: { en: "Barcelona vs Real Madrid", am: "ባርሴሎና vs ሪያል ማድሪድ" },
      home_team: { en: "Barcelona", am: "ባርሴሎና" },
      away_team: { en: "Real Madrid", am: "ሪያል ማድሪድ" },
      start_time: new Date(now + 86400000).toISOString(),
      league: "La Liga",
      odds: { home: 2.5, draw: 3.2, away: 2.8 },
    },
    {
      external_id: "demo_afcon_1",
      title: { en: "Ethiopia vs Kenya", am: "ኢትዮጵያ vs ኬንያ" },
      home_team: { en: "Ethiopia", am: "ኢትዮጵያ" },
      away_team: { en: "Kenya", am: "ኬንያ" },
      start_time: new Date(now + 172800000).toISOString(),
      league: "AFCON Qualifiers",
      odds: { home: 1.95, draw: 3.3, away: 4.0 },
    },
  ];
}
