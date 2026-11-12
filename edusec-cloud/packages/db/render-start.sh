#!/bin/sh
# Start command for the API on Render: apply migrations, run the idempotent
# seed, then start the server.
set -e
cd /repo/packages/db
# Clear a failed attempt of this migration (fresh DB only) before retrying it.
node_modules/.bin/prisma migrate resolve --rolled-back 20260917100000_seed_physical_ai_semiconductor_catalog 2>/dev/null || true
node_modules/.bin/prisma migrate deploy
node_modules/.bin/tsx src/seed.ts || echo "seed skipped"
cd /repo
exec node apps/api/dist/main.js
