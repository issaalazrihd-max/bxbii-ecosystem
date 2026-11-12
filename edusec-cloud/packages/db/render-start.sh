#!/bin/sh
# Start command for the API on Render: apply migrations, run the idempotent
# seed, then start the server.
set -e
cd /repo/packages/db
node_modules/.bin/prisma migrate deploy
node_modules/.bin/tsx src/seed.ts || echo "seed skipped"
cd /repo
exec node apps/api/dist/main.js
