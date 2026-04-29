# Trainer CRM

A coaching management platform for trainers to manage clients, log workouts, and share videos.

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/installation)
- [Docker](https://www.docker.com/) (for the local database)

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

Create a `.env` file at the project root with the following:

```bash
APP_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/trainer_crm

SESSION_SECRET=<random hex string>
CLIENT_TOKEN_SECRET=<64 hex chars — 32 bytes>

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

AWS_REGION=us-east-1
AWS_S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

**Generating secrets:**
```bash
node -e "const c=require('crypto'); console.log(c.randomBytes(32).toString('hex'))"
```

**Google OAuth:** In [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials, add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI.

### 3. Start the database

```bash
docker compose up -d
```

Starts Postgres 17 on port 5432. The default `DATABASE_URL` above matches these Docker credentials out of the box.

### 4. Run migrations

```bash
pnpm db:migrate
```

### 5. (Optional) Seed the database

```bash
pnpm db:seed
```

### 6. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Useful scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm db:migrate` | Run pending migrations |
| `pnpm db:generate` | Generate migrations from schema changes |
| `pnpm db:studio` | Open Drizzle Studio (DB browser) |
| `pnpm db:seed` | Seed the database |
| `pnpm db:reset` | Reset, migrate, and re-seed |
| `pnpm lint` | Lint with Biome |
| `pnpm lint:fix` | Auto-fix lint issues |
