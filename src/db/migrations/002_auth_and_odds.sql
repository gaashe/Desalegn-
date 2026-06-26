-- ============================================================
-- Migration 002: Auth (OTP) + External Odds Integration
-- ============================================================

-- OTP codes for phone authentication
CREATE TABLE IF NOT EXISTS otp_codes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number    VARCHAR(15) NOT NULL,
    code            VARCHAR(6) NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    used            BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_codes (phone_number, used, expires_at);

-- Sessions for authenticated users
CREATE TABLE IF NOT EXISTS sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token           VARCHAR(128) NOT NULL UNIQUE,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions (token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id);

-- Add external API fields to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS external_id VARCHAR(64);
ALTER TABLE events ADD COLUMN IF NOT EXISTS home_team JSONB DEFAULT '{}'::jsonb;
ALTER TABLE events ADD COLUMN IF NOT EXISTS away_team JSONB DEFAULT '{}'::jsonb;
ALTER TABLE events ADD COLUMN IF NOT EXISTS odds JSONB DEFAULT '{}'::jsonb;
ALTER TABLE events ADD COLUMN IF NOT EXISTS league VARCHAR(100);
ALTER TABLE events ADD COLUMN IF NOT EXISTS score JSONB DEFAULT '{}'::jsonb;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_events_external_id'
  ) THEN
    ALTER TABLE events ADD CONSTRAINT uq_events_external_id UNIQUE (external_id);
  END IF;
END $$;

-- Add selection field to bets (home/draw/away)
ALTER TABLE bets ADD COLUMN IF NOT EXISTS selection VARCHAR(20);
ALTER TABLE bets ADD COLUMN IF NOT EXISTS event_result VARCHAR(20);
