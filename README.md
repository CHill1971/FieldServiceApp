## Premium Field Service App (MVP)

Monorepo with API (Node/Express + TypeScript), PostgreSQL, MinIO, and Docker Compose. Web admin and additional services follow.

### Quick start

1. Copy envs:

```bash
cp .env.example .env
```

2. Start stack:

```bash
docker compose up --build
```

3. API health check: `http://localhost:4000/health`

### Services (current)
- API: `http://localhost:4000`
- Postgres: `localhost:5432`
- MinIO: S3 `http://localhost:9000`, Console `http://localhost:9001` (minioadmin/minioadmin)

### Next steps
- Add Prisma schema + migrations and connect API to DB
- Implement endpoints from PRD
- Add web admin (Next.js) and Nginx reverse proxy