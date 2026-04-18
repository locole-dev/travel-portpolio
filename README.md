# TwentyNine Homestay Portfolio

Full-stack content-managed portfolio for a local guide and homestay host.

## Stack

- React + TypeScript + Vite + Tailwind CSS
- Express + TypeScript + Prisma
- PostgreSQL
- JWT auth via HTTP-only cookie

## Apps

- `apps/web`: public website and admin dashboard
- `apps/api`: REST API, auth, uploads, and content management

## Setup

1. Copy `apps/api/.env.example` to `apps/api/.env`.
2. Copy `apps/web/.env.example` to `apps/web/.env`.
3. Use the root `.env.example` as a combined reference sheet if you want one place to review all keys.
4. Create a PostgreSQL database matching `DATABASE_URL`.
5. Install dependencies with `npm.cmd install`.
6. Run Prisma migration and seed commands from the root scripts.

## Commands

- `npm.cmd run dev:web`
- `npm.cmd run dev:api`
- `npm.cmd run build`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run smoke:api`

## Docker Deploy

1. Copy `.env.docker.example` to `.env`.
2. Set real secrets and database values.
3. Run `docker compose up --build -d`.
4. Run `docker compose exec api npm run smoke` after the stack is healthy.

Default Docker URLs:

- Web: `http://localhost:8080`
- API: `http://localhost:4001`
- PostgreSQL: `localhost:5433`
