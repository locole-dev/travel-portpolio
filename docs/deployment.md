# Deployment

## Docker Compose Stack

The repository includes a Docker stack with **two services** (PostgreSQL is **not** included — use an existing database):

- **`api`**: Express + Prisma backend with optional boot-time schema push and seed
- **`web`**: Nginx serving the Vite build and proxying `/api` and `/uploads` to the API

Set **`DATABASE_URL`** in `.env` to your PostgreSQL instance (must be reachable from the `api` container — e.g. host IP, `host.docker.internal`, or the Docker bridge gateway, depending on your setup).

## Environment Setup

1. Copy `.env.docker.example` to `.env`.
2. Set **`DATABASE_URL`** (required).
3. Replace **`JWT_SECRET`** with a long random value.
4. If deploying to a real domain, set `APP_ORIGIN`, `APP_ORIGINS`, and keep `VITE_API_BASE_URL=/api/v1` for same-origin API via Nginx.
5. Set `COOKIE_SECURE=true` when running behind HTTPS.

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

- The API health endpoint checks database connectivity, so a healthy container implies PostgreSQL is reachable.
- The frontend container uses same-origin `/api/v1` calls through Nginx, which avoids browser-side CORS and cookie issues in deployment.
- Uploaded files persist through the bind mount at `apps/api/uploads`.
