---
name: testing-ethiobet-api
description: Test the EthioBet sports betting API endpoints end-to-end. Use when verifying bet placement, Telebirr webhook, or payment flow changes.
---

# Testing EthioBet API

## Prerequisites

- PostgreSQL 14+ running locally
- Node.js 18+
- RSA-2048 test keys for Telebirr signature testing

## Environment Setup

1. Install and start PostgreSQL:
```bash
sudo apt-get install -y postgresql postgresql-client
sudo pg_ctlcluster 14 main start
```

2. Create test database and user:
```bash
sudo -u postgres createuser -s ubuntu
sudo -u postgres createdb ethiobet
sudo -u postgres psql -c "ALTER USER ubuntu WITH PASSWORD 'testpass123';"
```

3. Apply schema:
```bash
cd /home/ubuntu/repos/Desalegn-
psql -d ethiobet -f src/db/schema.sql
```

4. Generate RSA test keys:
```bash
openssl genrsa -out /tmp/test_private.pem 2048
openssl rsa -in /tmp/test_private.pem -pubout -out /tmp/test_public.pem
```

5. Create `.env` file with:
```
DATABASE_URL=postgresql://ubuntu:testpass123@localhost:5432/ethiobet
TELEBIRR_PUBLIC_KEY=<base64 of /tmp/test_public.pem>
TELEBIRR_PRIVATE_KEY=<base64 of /tmp/test_private.pem>
TELEBIRR_APP_ID=test_app_id
TELEBIRR_APP_KEY=test_app_key
TELEBIRR_SHORT_CODE=test_short_code
TELEBIRR_NOTIFY_URL=http://localhost:3000/api/payments/telebirr-webhook
PORT=3000
NODE_ENV=development
```

6. Install deps and start server:
```bash
npm install
npx ts-node-dev --respawn src/server.ts
```

## Key Notes

- The `ts-node` migration script (`npm run migrate`) may have path resolution issues with `__dirname`. Use `psql -f src/db/schema.sql` directly as a reliable alternative.
- PostgreSQL peer auth might not work over TCP. Always set a password for the DB user and include it in DATABASE_URL.
- Webhook signature testing requires generating the signature with the same private key that corresponds to the TELEBIRR_PUBLIC_KEY in `.env`.

## Test Approach

All testing is shell-based (curl + psql). No GUI/browser recording needed.

### Core Test Flows

1. **Bet Placement** (`POST /api/bets/place`):
   - Seed users (verified with balance, zero-balance, unverified) and events (upcoming, completed)
   - Test happy path: verify 201 response, `potential_payout` math, `remaining_balance`, and DB state
   - Test guards: insufficient balance (400), unverified user (403), completed event (400), invalid input (400)

2. **Telebirr Webhook** (`POST /api/payments/telebirr-webhook`):
   - Seed a pending deposit record
   - Generate valid RSA signature using Node.js crypto (sign sorted key=value pairs with SHA256)
   - Test valid webhook: verify 200 response, deposit status updated, balance credited
   - Test idempotency: resend same outTradeNo, verify balance unchanged
   - Test security: send with invalid/missing signature, verify 401 rejection

### Signing a Webhook Payload (Node.js)

```javascript
const crypto = require("crypto");
const fs = require("fs");

const privateKey = fs.readFileSync("/tmp/test_private.pem", "utf-8");
const payload = { msisdn, outTradeNo, totalAmount, tradeNo, tradeStatus, transactionNo, timestamp };

const sortedKeys = Object.keys(payload).sort();
const signString = sortedKeys.map(k => `${k}=${payload[k]}`).join("&");

const signer = crypto.createSign("SHA256");
signer.update(signString, "utf-8");
const signature = signer.sign({ key: privateKey, padding: crypto.constants.RSA_PKCS1_PADDING }, "base64");
```

Send as `x-telebirr-signature` header.

## Devin Secrets Needed

None required for local testing. RSA keys are generated on the fly.
For production/staging testing, would need:
- `TELEBIRR_PUBLIC_KEY` (Telebirr's actual public key, base64)
- `TELEBIRR_PRIVATE_KEY` (merchant private key, base64)
