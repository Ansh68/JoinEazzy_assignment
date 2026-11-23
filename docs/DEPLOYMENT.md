# Deployment Guide

The app is deployed as three pieces:

| Piece | Host | What it serves |
|---|---|---|
| Frontend (React) | **Vercel** | the website |
| Backend (Express API) | **Render** | `/api/...` |
| Database (PostgreSQL) | **Supabase** | already set up |

```
Browser ──► Vercel (static React app)
   │
   └──────► Render (Express API) ──► Supabase (PostgreSQL)
```

Deploy in this order: **Render first** (you need its URL), then **Vercel**, then go back to Render once to allow the Vercel URL.

---

## Before you start

- The code is pushed to GitHub (you do this yourself).
- Your Supabase project already has the tables (`npm run migrate` was run) and the demo users (`npm run seed`). The deployed API uses the **same** database, so nothing more to set up there.
- Have these two values from Supabase (**Project Settings → API**) ready:
  - **Project URL**, like `https://abcdefgh.supabase.co`
  - **service_role** key (the secret one, not `anon`)

> Tip: create the Render service in the **same region as your Supabase project** (Supabase → Project Settings → General shows it). Each database call then takes a few milliseconds instead of a few hundred, and every page loads noticeably faster.

---

## Step 1: Backend on Render

### Option A: Blueprint (fastest)

1. Render dashboard → **New → Blueprint** → connect your GitHub repo.
2. Render reads [`render.yaml`](../render.yaml) and proposes a web service called `joineazy-api`.
3. Fill in the three values it asks for:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CLIENT_URL`: put `https://placeholder.vercel.app` for now. You fix it in Step 3.
4. **Apply**. `JWT_SECRET` is generated for you.

### Option B: Manual

1. Render dashboard → **New → Web Service** → pick the repo.
2. Settings:

   | Field | Value |
   |---|---|
   | Root Directory | `backend` |
   | Runtime | Node |
   | Build Command | `npm ci --omit=dev` |
   | Start Command | `npm start` |
   | Health Check Path | `/api/health` |
   | Instance Type | Free |

3. Add environment variables:

   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `NODE_VERSION` | `22` |
   | `SUPABASE_URL` | your Supabase Project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | your service_role key |
   | `JWT_SECRET` | a random string of **32+ characters** (e.g. run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) |
   | `JWT_EXPIRES_IN` | `1d` |
   | `CLIENT_URL` | `https://placeholder.vercel.app` for now |

### Check it worked

When the deploy finishes, open `https://<your-service>.onrender.com/api/health`. You should see:

```json
{"success":true,"status":"ok"}
```

Copy the service URL. You need it in Step 2.

> `DATABASE_URL` is **not** needed on Render. It is only used by `npm run migrate` on your own computer.

---

## Step 2: Frontend on Vercel

1. Vercel dashboard → **Add New → Project** → import the same repo.
2. Settings:

   | Field | Value |
   |---|---|
   | Root Directory | `frontend` |
   | Framework Preset | Vite (detected automatically) |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |

3. Environment variable:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://<your-service>.onrender.com/api` (note the `/api` at the end) |

4. **Deploy**, then copy your Vercel URL, like `https://joineazy-xyz.vercel.app`.

[`frontend/vercel.json`](../frontend/vercel.json) is already in the repo. It makes page refreshes on routes like `/admin/assignments` work (otherwise they would 404) and adds basic security headers.

> `VITE_API_URL` is baked into the app **when it is built**. If you change it later, you must **redeploy** the frontend (Deployments → ⋯ → Redeploy).

---

## Step 3: Allow the frontend on the backend (CORS)

The API only accepts requests from the URL listed in `CLIENT_URL`.

1. Render → your service → **Environment** → edit `CLIENT_URL` to your real Vercel URL, e.g. `https://joineazy-xyz.vercel.app`.
2. Save. Render redeploys automatically.

You can list several origins separated by commas, e.g. `https://joineazy-xyz.vercel.app,http://localhost:5173` to keep local development working too. A trailing `/` is fine.

---

## Step 4: Smoke test

Open your Vercel URL and check:

1. The login page loads. A refresh on any page does not 404.
2. **Professor demo** logs in and lands on the dashboard.
3. Create an assignment, log out, then log in as **Student demo**, create a group, and confirm a submission through both steps.
4. Back as the professor, the tracking page and analytics show the confirmation.

Demo accounts (created by `npm run seed`): `admin@joineazy.com` / `Admin@123` and `aarav@student.com` / `Student@123`.

---

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| "Cannot reach the server" everywhere | `VITE_API_URL` is wrong or missing. Check it ends with `/api`, then **redeploy** Vercel. Test the Render `/api/health` URL directly in the browser. |
| Browser console says *blocked by CORS policy* | `CLIENT_URL` on Render does not match the Vercel URL exactly (check `https`, spelling, and that it is the production URL rather than a preview URL). Fix it and let Render redeploy. |
| The first request takes up to a minute | Render's free tier puts idle services to sleep. The first request wakes it. The app shows a "server may be waking up" hint. Optional: a free uptime monitor (e.g. UptimeRobot) pinging `/api/health` every 5 minutes keeps it awake. |
| Render deploy fails with *JWT_SECRET must be at least 32 characters* | Use a longer secret (see the command above). |
| Render deploy fails with *CLIENT_URL must be set in production* | Add the `CLIENT_URL` variable. |
| Logged out right after logging in | `JWT_SECRET` changed between deploys (old tokens become invalid), or the browser blocks `localStorage`. Log in again. |
| Vercel preview deployments cannot log in | Each preview has its own URL that is not in `CLIENT_URL`. Add it to `CLIENT_URL` (comma-separated) or use the production URL. |

---

## Notes and decisions

- **One database for everything.** Local development and the deployed app share one Supabase project, so demo data created locally also shows up online. For a real launch, use a separate Supabase project for production and run `npm run migrate` against it.
- **The service_role key is secret.** It bypasses row-level security. It lives only in Render's environment, never in the frontend or in git.
- **Free tiers** are enough for a demo. Render's free instance sleeps when idle and Supabase pauses projects after a week without activity.
- **Rolling back.** Both Render and Vercel keep previous deploys: redeploy an older one from their dashboards if something breaks.
