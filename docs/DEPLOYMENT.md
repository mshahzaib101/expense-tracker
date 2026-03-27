# Expense Tracker — Deployment

## Architecture

```
Browser → Vercel (Next.js) → /api/* rewrites → Railway (NestJS) → PostgreSQL
                ↑                                       ↑
         First-party cookies                   Managed database
         Route protection via middleware        JWT auth guards
```

All API requests are proxied through Next.js rewrites so cookies remain first-party, avoiding third-party cookie restrictions in modern browsers.

---

## Services

| Component | Platform | URL |
| --- | --- | --- |
| Frontend | Vercel (Free) | `https://expense-tracker-lyart-sigma.vercel.app` |
| Backend | Railway (Hobby $5/mo) | `https://expense-tracker-production-6afe.up.railway.app` |
| Database | Railway PostgreSQL | Internal connection via `DATABASE_URL` |

---

## Vercel (Frontend)

### Setup

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new)
2. Set **Root Directory** to `frontend`
3. Framework is auto-detected as Next.js

### Environment Variables

| Variable | Value | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `/api` | Relative path — requests go through Next.js rewrites |
| `BACKEND_URL` | `https://expense-tracker-production-6afe.up.railway.app` | Server-side only, used by `next.config.ts` rewrites |

### How It Works

- `NEXT_PUBLIC_API_URL=/api` is baked into the client bundle at build time
- The browser makes requests to `/api/auth/me`, `/api/expenses`, etc. (same origin)
- `next.config.ts` rewrites `/api/:path*` to `${BACKEND_URL}/:path*` on the server
- Cookies are set on the Vercel domain (first-party), so Next.js middleware can read them
- Auto-deploys on every push to `main`

---

## Railway (Backend + Database)

### Setup

1. Create a new project at [railway.app](https://railway.app)
2. Add a **PostgreSQL** service (one click)
3. Add a service from the GitHub repo, set **Root Directory** to `backend`
4. Clear any custom Build Command and Start Command (Railway auto-detects from `package.json`)
5. Set **Custom Start Command** to: `npx prisma migrate deploy && npx nest start`
6. Under **Networking**, click **Generate Domain** for a public URL

### Environment Variables

| Variable | Value | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Use Railway's **Add Reference** to inject from Postgres service | Auto-managed |
| `JWT_SECRET` | A random 32+ character string | Keep secret |
| `JWT_EXPIRATION` | `7d` | Token lifetime |
| `FRONTEND_URL` | `https://expense-tracker-lyart-sigma.vercel.app` | Used for CORS and origin verification |
| `PORT` | `3001` | Server port |
| `NODE_ENV` | `production` | Enables secure cookies |

### How It Works

- `postinstall` script in `package.json` runs `prisma generate` after `npm ci`
- Railway runs `npm run build` (`nest build`) to compile TypeScript
- On startup, `prisma migrate deploy` applies any pending migrations, then `nest start` compiles and runs the app
- Auto-deploys on every push to `main`

---

## Cookie Configuration

In production (`NODE_ENV=production`), cookies are set with:

| Property | Value | Reason |
| --- | --- | --- |
| `httpOnly` | `true` | JavaScript cannot access the token |
| `secure` | `true` | Only sent over HTTPS |
| `sameSite` | `none` | Allows cross-site sending (fallback for direct API access) |
| `path` | `/` | Available on all routes |

With the proxy setup, cookies are effectively first-party (set on the Vercel domain), so `sameSite=none` is a permissive fallback rather than a requirement.

---

## Key Deployment Decisions

| Decision | Rationale |
| --- | --- |
| API proxy through Next.js rewrites | Avoids third-party cookie blocking in incognito and Safari |
| `NEXT_PUBLIC_API_URL=/api` in production | All fetch calls go to same origin, proxied server-side |
| `sameSite=none` in production cookies | Keeps flexibility for direct API access if needed |
| Middleware skips cookie check when API is cross-domain | Graceful fallback — client-side AuthProvider handles protection |
| `prisma migrate deploy` in start command | Migrations run automatically on every deploy |
| `postinstall: prisma generate` | Ensures Prisma client types exist before TypeScript build |

---

## Updating the Deployment

### Code changes

Push to `main` — both Vercel and Railway auto-deploy.

### Environment variable changes

- **Vercel**: Project Settings → Environment Variables → edit → redeploy (required for `NEXT_PUBLIC_*` changes since they're baked into the build)
- **Railway**: Service → Variables → edit (auto-redeploys)

### Database schema changes

Add a new Prisma migration locally, commit, and push:

```bash
cd backend
npx prisma migrate dev --name describe_the_change
git add -A && git commit -m "feat: add migration" && git push
```

Railway's start command runs `prisma migrate deploy` automatically.
