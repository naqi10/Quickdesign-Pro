# Setup Guide
> See AGENTS.md or open an issue for help.

## Prerequisites
- Node.js 20+
- A Neon Postgres account (free): https://neon.tech
- An OpenAI API key
- (Optional) Google OAuth credentials for "Sign in with Google"

---

## 1. Install dependencies

```bash
npm install --legacy-peer-deps
```

The `postinstall` hook will auto-run `prisma generate`.

---

## 2. Set up Neon Postgres

1. Go to https://neon.tech → sign up (free tier is fine).
2. Create a new project. Pick the region closest to your users.
3. From the project dashboard, copy the **Pooled connection** string. It looks like:
   ```
   postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require
   ```

---

## 3. Set up Google OAuth (optional, recommended)

1. Visit https://console.cloud.google.com/apis/credentials
2. Create a new project (or pick an existing one).
3. **Create credentials → OAuth client ID → Web application**.
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://yourdomain.com/api/auth/callback/google` (prod, when deployed)
5. Copy the **Client ID** and **Client Secret**.

---

## 4. Configure environment

Copy `.env.example` to `.env.local` and fill in:

```
DATABASE_URL="postgresql://...neon.tech/dbname?sslmode=require"
AUTH_SECRET="<32+ random chars — generate with: openssl rand -base64 32>"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
OPENAI_API_KEY="sk-..."
```

> **Tip:** if you don't want Google OAuth, leave the two `GOOGLE_*` vars empty — email/password sign-up will still work.

---

## 5. Push the schema to your database

```bash
npm run db:push
```

This creates all the tables (User, Account, Session, Resume) directly on Neon — no migration files needed for first-time setup.

For production with version-controlled migrations, use:
```bash
npm run db:migrate
```

---

## 6. Run

```bash
npm run dev
```

Visit http://localhost:3000 → you'll be redirected to `/signin`.

---

## Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build (runs `prisma generate` first) |
| `npm run db:push` | Sync schema to DB (no migration files) |
| `npm run db:migrate` | Create + apply a migration |
| `npm run db:studio` | Open Prisma Studio at localhost:5555 to inspect data |

---

## Production checklist

- [ ] `AUTH_URL` set to your real HTTPS domain
- [ ] Production OAuth redirect URI added in Google Console
- [ ] `DATABASE_URL` uses pooled connection (not direct) — Neon's pooler handles serverless concurrency
- [ ] `OPENAI_API_KEY` has a usage limit set in OpenAI dashboard
- [ ] Run `npm run db:migrate deploy` on first prod deploy

