# Premium Field Service App – Backend

## Quickstart

1. Copy `.env.example` to `.env` and fill in any secrets.
2. Run `docker-compose up --build`
3. In another terminal: `docker-compose exec api npx prisma migrate dev`
4. Visit `http://localhost:4000/health` to check the API is running.

## Structure

- `api/` — Node.js backend (Express), Prisma ORM
- `api/prisma/schema.prisma` — Database schema
- `docker-compose.yml` — Orchestrates API, Postgres, and MinIO

## Environment

See `.env.example` for required environment variables.

## Next Steps

- Implement routes for authentication, work orders, etc.
- Add seed scripts for demo data.
- Expand README with API usage and local dev notes.
