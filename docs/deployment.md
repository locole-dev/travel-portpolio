# Deployment

## Docker Compose Stack

The repository now includes a self-hosted Docker stack with three services:

- `postgres`: PostgreSQL 15 with a named volume for database persistence
- `api`: Express + Prisma backend with optional boot-time schema push and seed
- `web`: Nginx serving the Vite build and proxying `/api` and `/uploads` to the API

## Environment Setup

1. Copy `.env.docker.example` to `.env`.
2. Replace `POSTGRES_PASSWORD` and `JWT_SECRET`.
3. If deploying to a real domain, set `APP_ORIGIN`, `APP_ORIGINS`, and `VITE_API_BASE_URL=/api/v1`.
4. Set `COOKIE_SECURE=true` when running behind HTTPS.

## Run

```bash
docker compose up --build -d
```

## Verify

```bash
docker compose ps
docker compose logs api --tail 100
docker compose exec api npm run smoke
```

Expected endpoints:

- Web: `http://localhost:8080`
- API health: `http://localhost:4001/health`
- Proxied API: `http://localhost:8080/api/v1/public/site-content`

## Notes

- The API health endpoint now checks database connectivity, so a healthy container implies PostgreSQL is reachable.
- The frontend container uses same-origin `/api/v1` calls through Nginx, which avoids browser-side CORS and cookie issues in deployment.
- Uploaded files persist through the bind mount at `apps/api/uploads`.
