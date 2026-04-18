#!/bin/sh
set -eu

if [ "${RUN_DB_PUSH:-true}" = "true" ]; then
  npx prisma db push --skip-generate
fi

if [ "${RUN_DB_SEED:-false}" = "true" ]; then
  npm run prisma:seed
fi

exec node dist/src/server.js
