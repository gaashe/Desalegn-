-- ============================================================
-- EthioBet: PostgreSQL Database Schema
-- Bilingual Sports Betting Platform for Ethiopian Market
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number    VARCHAR(15) NOT NULL UNIQUE,
    balance         NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
    language_pref   VARCHAR(5) NOT NULL DEFAULT 'am'
                    CHECK (language_pref IN ('en', 'am')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Prevent negative wallet balances (ACID-compliant)
    CONSTRAINT chk_balance_non_negative CHECK (balance >= 0)
);

-- Index for phone number lookups (login/auth)
CREATE INDEX idx_users_phone ON users (phone_number);

-- ============================================================
-- EVENTS TABLE
-- ============================================================
CREATE TABLE events (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title           JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- Example: {"en": "Arsenal vs Chelsea", "am": "አርሰናል vs ቼልሲ"}
    sport_type      VARCHAR(50) NOT NULL DEFAULT 'football',
    start_time      TIMESTAMPTZ NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'upcoming'
                    CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')),
    metadata        JSONB DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Ensure title has at least English key
    CONSTRAINT chk_title_has_en CHECK (title ? 'en')
);

-- Index for querying upcoming/live events
CREATE INDEX idx_events_status_start ON events (status, start_time);

-- ============================================================
-- DEPOSITS TABLE
-- ============================================================
CREATE TABLE deposits (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    amount          NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    out_trade_no    VARCHAR(64) NOT NULL UNIQUE,
    -- Telebirr transaction reference
    telebirr_ref    VARCHAR(128),
    status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'success', 'failed', 'expired')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for webhook idempotency checks
CREATE INDEX idx_deposits_out_trade_no ON deposits (out_trade_no);
CREATE INDEX idx_deposits_user_status ON deposits (user_id, status);

-- ============================================================
-- BETS TABLE
-- ============================================================
CREATE TABLE bets (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    event_id            UUID NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
    market_description  JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- Example: {"en": "Match Winner - Arsenal", "am": "የጨዋታ አሸናፊ - አርሰናል"}
    stake               NUMERIC(12, 2) NOT NULL CHECK (stake > 0),
    odds                NUMERIC(8, 4) NOT NULL CHECK (odds > 1.0),
    potential_payout    NUMERIC(14, 2) GENERATED ALWAYS AS (stake * odds) STORED,
    status              VARCHAR(20) NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'won', 'lost', 'void', 'cashout')),
    settled_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Ensure market_description has at least English key
    CONSTRAINT chk_market_desc_has_en CHECK (market_description ? 'en')
);

-- Index for user bet history
CREATE INDEX idx_bets_user_status ON bets (user_id, status);
CREATE INDEX idx_bets_event ON bets (event_id);

-- ============================================================
-- AUDIT: Updated_at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_deposits_updated_at
    BEFORE UPDATE ON deposits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
