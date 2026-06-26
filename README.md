# EthioBet - Bilingual Sports Betting Platform

Production-ready, bilingual (English/Amharic) sports betting platform for the Ethiopian market with Telebirr payment integration.

## Architecture

```
src/
├── api/
│   ├── bets.ts              # POST /api/bets/place (atomic bet placement)
│   └── payments.ts          # POST /api/payments/telebirr-webhook
├── db/
│   ├── schema.sql           # PostgreSQL schema (users, events, deposits, bets)
│   ├── pool.ts              # Connection pool configuration
│   └── migrate.ts           # Database migration runner
├── i18n/
│   ├── index.ts             # Localization utilities (JSONB field resolution)
│   └── locales/
│       ├── en/common.json   # English translations
│       └── am/common.json   # Amharic translations
├── middleware/
│   ├── validate.ts          # Zod-based request validation
│   └── error-handler.ts     # Global error handling
├── payments/
│   ├── telebirr-crypto.ts   # RSA-2048 signing & verification
│   ├── telebirr-client.ts   # Payment request builder
│   └── telebirr-webhook.ts  # Webhook processor with idempotency
└── server.ts                # Express app entry point

frontend/
├── src/
│   ├── i18n.ts              # i18next configuration for React/Next.js
│   ├── styles/fonts.css     # Noto Sans Ethiopic font setup
│   ├── components/
│   │   └── LanguageSwitcher.tsx
│   └── locales/             # Frontend translation files
└── public/fonts/            # Self-hosted font files (optional)
```

## Quick Start

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14
- Telebirr merchant account (for payment integration)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your database and Telebirr credentials

# 3. Run database migrations
npm run migrate

# 4. Start development server
npm run dev
```

### Generate RSA Keys (for Telebirr integration)

```bash
# Generate private key
openssl genrsa -out private_key.pem 2048

# Extract public key
openssl rsa -in private_key.pem -pubout -out public_key.pem

# Base64 encode for environment variables
cat private_key.pem | base64 -w 0 > private_key.b64
cat public_key.pem | base64 -w 0 > public_key.b64
```

## API Endpoints

### Place Bet
```
POST /api/bets/place
Content-Type: application/json

{
  "user_id": "uuid",
  "event_id": "uuid",
  "market_description": {
    "en": "Match Winner - Arsenal",
    "am": "የጨዋታ አሸናፊ - አርሰናል"
  },
  "stake": 100.00,
  "odds": 2.50
}
```

**Transaction Flow:**
1. Validates input with Zod schema
2. Locks user row with `SELECT ... FOR UPDATE`
3. Checks balance >= stake
4. Deducts stake atomically
5. Inserts bet record
6. Commits or rolls back entirely

### Telebirr Webhook
```
POST /api/payments/telebirr-webhook
Headers: x-telebirr-signature: <RSA_SIGNATURE>

{
  "msisdn": "251911234567",
  "outTradeNo": "EB17012345678abcdef",
  "transactionNo": "TXN123456",
  "totalAmount": "100.00",
  "tradeStatus": "SUCCESS",
  "tradeNo": "TRADE123",
  "timestamp": "1701234567890"
}
```

**Security Flow:**
1. Verifies RSA-2048 signature (rejects forged requests)
2. Locks deposit row (`FOR UPDATE`)
3. Checks idempotency (skips already-processed deposits)
4. Updates deposit status
5. Credits user balance (only on `SUCCESS`)

## i18n Setup (Frontend - Next.js/React)

### Install
```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

### Configure
Import `frontend/src/i18n.ts` in your app entry point.

### Font Setup
Add Noto Sans Ethiopic for proper Amharic rendering:
```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic:wght@400;500;600;700&display=swap');
```

### Usage
```tsx
import { useTranslation } from 'react-i18next';

function BetSlip() {
  const { t } = useTranslation();
  return <button>{t('betting.placeBet')}</button>;
  // Renders "Place Bet" or "ውርርድ አስቀምጥ"
}
```

## Database JSONB Schema

Bilingual fields use JSONB with a required `en` key:
```sql
-- Events table
title JSONB NOT NULL DEFAULT '{}'::jsonb
-- Stored as: {"en": "Arsenal vs Chelsea", "am": "አርሰናል vs ቼልሲ"}

-- Bets table
market_description JSONB NOT NULL DEFAULT '{}'::jsonb
-- Stored as: {"en": "Match Winner", "am": "የጨዋታ አሸናፊ"}
```

Constraints enforce schema integrity:
```sql
CONSTRAINT chk_title_has_en CHECK (title ? 'en')
```

## Security Practices

- RSA-2048 for all Telebirr communication (sign outgoing, verify incoming)
- Environment variables for all secrets (never committed)
- Zod validation on all inputs
- `SELECT ... FOR UPDATE` row locking prevents race conditions
- `CHECK (balance >= 0)` DB-level constraint prevents negative balances
- Helmet.js for HTTP security headers
- CORS restricted to configured frontend origin
- Idempotent webhook processing prevents double-funding

## License

Proprietary - All rights reserved.
