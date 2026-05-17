# TBDFit Trainer + PWA Client App

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

## Push Notifications

The platform sends push notifications to trainers (iOS/Android via FCM) and clients (PWA via Web Push) when new chat messages arrive.

### Environment variables

Add these to your `.env` and to Vercel's environment variables:

```bash
# Firebase Admin SDK — send FCM notifications to iOS/Android
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=       # paste the full key including \n characters, on one line

# Web Push VAPID — send notifications to the client PWA
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:your@email.com
```

Generate VAPID keys once:
```bash
npx web-push generate-vapid-keys
```

Get Firebase credentials from Firebase Console → Project Settings → Service accounts → Generate new private key.

### Firebase + APNs setup (iOS)

**Critical gotchas learned in production — follow exactly:**

1. **Create a universal APNs key** — in [Apple Developer Portal](https://developer.apple.com) → Keys → +, check Apple Push Notifications service (APNs) and leave topic restrictions empty. Do NOT use a "Topic specific" key; Firebase has known delivery issues with those.

2. **Upload to Firebase** — Firebase Console → Project Settings → Cloud Messaging → Upload APNs Auth Key. Enter your Key ID and Team ID exactly.

3. **Both environments must be Production** — when creating the Apple key, select **Production**. When uploading to Firebase, also select **Production**. This applies even for TestFlight testing.

4. **Test via TestFlight, not Xcode** — Xcode debug builds use the APNs sandbox endpoint, which FCM does not route to correctly. Push notifications will appear to send (Firebase returns success) but never arrive on device. Always test FCM delivery via a TestFlight build.

5. **FIREBASE_PRIVATE_KEY format** — paste the private key as a single line with literal `\n` sequences, exactly as it appears in the downloaded service account JSON. Vercel must not convert these to real newlines.

6. **Notification dispatch must be awaited** — on Vercel serverless, fire-and-forget (`void`) async calls are killed when the function returns. `notifyRecipients()` is called with `await` in `createMessage()` for this reason.

### PWA push notifications (client portal)

- Clients must **add the portal to their home screen** (iOS Safari) for push notifications to work — Apple only allows background wake-up for installed PWAs.
- The permission prompt appears automatically after the client sends their first message.
- The service worker (`public/sw.js`) suppresses the notification banner if the client already has the chat tab open and focused.

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
