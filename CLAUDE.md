# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Yoga/naturopathy website for **Dr. Vishwa Hiremath – Trupti Yoga and Nature Cure**. Users sign up, submit payment proof (or pay via PayPal), and get approved by the admin to access Google Meet session links. Three daily live sessions: 6 AM, 8 AM, 11 AM IST. One-to-One private session plans also available with a separate scheduling flow.

## Running the project

Two processes must run simultaneously:

**Backend (FastAPI)**
```powershell
cd backend
.\.venv\Scripts\activate
uvicorn main:app --reload
# Runs on http://localhost:8000
```

**Frontend (Vite + React)**
```powershell
npm run dev        # http://localhost:5173
npm run build      # production build
npm run lint       # ESLint
npm run test       # vitest (watch mode)
npm run test:run   # vitest (single run)
```

## Environment variables

**Backend** — set in shell or `.env` (loaded via python-dotenv if present):
- `DATABASE_URL` — PostgreSQL connection string (Neon in production, required)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — admin login (defaults to `Truptiyoganaturecure@gmail.com` / `Trupti_yoga`)
- `JWT_SECRET` — signs user + admin JWTs (default is insecure dev value)
- `FRONTEND_URL` — used for CORS and email links (default `http://localhost:5173`)
- `SMTP_EMAIL` / `SMTP_PASSWORD` — Gmail + App Password for transactional email; emails are silently skipped when unset

**Frontend** — `.env` / Vercel env vars:
- `VITE_API_URL` — backend URL (falls back to `http://localhost:8000`)
- `VITE_PAYPAL_CLIENT_ID` — PayPal SDK client ID; PayPal button hidden when unset

## Architecture

### Backend (`backend/`)
- `main.py` — all FastAPI routes
- `models.py` — PostgreSQL schema + `get_connection()` / `init_db()` (runs on startup via `@app.on_event("startup")`)
- `email_utils.py` — HTML transactional emails sent asynchronously via Gmail SMTP
- Database: PostgreSQL (Neon). `init_db()` creates tables with `CREATE TABLE IF NOT EXISTS` so it is safe to re-run. Queries use `%s` placeholders (psycopg2 style).
- Auth: **JWT** (`PyJWT`). User tokens carry `sub=<user_id>`; admin tokens carry `sub="admin", role="admin"`. Tokens expire in 7 days (users) / 1 day (admin).
- Passwords: SHA256 via `hashlib`

**DB tables:** `users`, `payments`, `settings`, `schedules`
- `settings` stores global group Meet links (`meet_6am`, `meet_8am`, `meet_11am`) — shared by all approved group-plan users
- `payments.client_meet_link` stores per-user Meet link for 1-to-1 plans
- `schedules` manages session proposal/confirmation between admin and 1-to-1 clients (`proposed_by: 'client' | 'admin'`, `status: 'pending' | 'confirmed' | 'declined' | 'rejected'`)

**Payment flow:**
- INR (Indian): user submits transaction ID → status `pending` → admin approves/rejects manually
- USD (international): PayPal order ID submitted → status auto-set to `approved` immediately
- Expiry is computed in `calc_expiry()` at query time, not stored

**Plans:**
- Categories: `individual`, `couple`, `family`, `1to1`
- Durations: `1m`, `3m`, `6m`, `12m` (1to1 excludes `12m`)
- Plan key format: `{category}_{duration}` e.g. `individual_3m`, `1to1_6m`
- Prices defined in `PLAN_AMOUNTS_INR`, `PLAN_AMOUNTS_USD`, `PLAN_DAYS` in `main.py` and mirrored in `Payment.jsx`

### Frontend (`src/`)
- `App.jsx` — React Router routes
- `pages/` — full page components (Home, ClassPage, Login, Signup, Payment, Dashboard, AdminPanel)
- `components/` — Navbar, Footer, ClassCard
- `utils/api.js` — exports `API_URL` (reads `VITE_API_URL` env var)
- `utils/sessionUtils.js` — shared session timing constants and helpers used by Dashboard and other components

**Key frontend logic:**
- `Dashboard.jsx`: imports `SESSION_INFO`, `WINDOW_BEFORE`, `getISTMinutes`, `sessionStatus`, `getSessionBanner` from `utils/sessionUtils.js`. Auto-refreshes IST clock every 30 seconds. Join window: **5 min before** to **15 min after** each session.
- `Payment.jsx`: detects user country via `https://ipapi.co/json/` to show INR vs USD pricing. PayPal integration uses `@paypal/react-paypal-js`. Pass `?preview=intl` or `?preview=in` in URL to force a currency view during development.
- `AdminPanel.jsx`: React state-based navigation (`view` state: `'home' | 'users' | 'user-detail' | 'links'`). No React Router — all views render in one component. Stores admin JWT in `localStorage` as `adminToken`.
- Session data (emoji, tagline, description, colors) is centralised in `utils/sessionUtils.js`; `ClassCard.jsx` and `ClassPage.jsx` have their own copies — update all when changing session info.

## Session timing constants

In `src/utils/sessionUtils.js`:
```js
export const WINDOW_BEFORE = 5   // minutes before session start
export const WINDOW_AFTER  = 15  // minutes after session start

export const SESSION_INFO = [
  { key: 'meet_6am',  h: 6,  m: 0  },
  { key: 'meet_8am',  h: 8,  m: 0  },
  { key: 'meet_11am', h: 11, m: 0  },
]
```
