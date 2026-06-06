# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Yoga/naturopathy website for **Dr. Vishwa Hiremath – Trupti Yoga and Nature Cure**. Users sign up, submit payment proof, and get approved by the admin to access Google Meet session links. Three daily live sessions: 6 AM, 8 AM, 11 AM IST.

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
npm run dev
# Runs on http://localhost:5173
```

Other frontend commands:
```powershell
npm run build    # production build
npm run lint     # ESLint
npm run preview  # preview production build
```

## Architecture

### Backend (`backend/`)
- `main.py` — all FastAPI routes
- `models.py` — SQLite schema + `get_connection()` / `init_db()`
- Database: `backend/enrollments.db` (SQLite, auto-created on startup)
- Auth: in-memory token dicts (`active_tokens`, `admin_tokens`) — tokens are lost on server restart
- Passwords: SHA256 via `hashlib`
- Admin credentials are hardcoded constants in `main.py`: `ADMIN_EMAIL` / `ADMIN_PASSWORD`

**DB tables:** `users`, `payments`, `settings`  
The `settings` table stores global Google Meet links (`meet_6am`, `meet_8am`, `meet_11am`) — not per-payment. All approved users read from there.

### Frontend (`src/`)
- `App.jsx` — React Router routes
- `pages/` — full page components (Home, ClassPage, Login, Signup, Payment, Dashboard, AdminPanel)
- `components/` — Navbar, Footer, ClassCard

**Key frontend logic:**
- `Dashboard.jsx`: computes IST time client-side (`UTC + 5.5h`) to determine which session Join button is active. Window: **5 min before** to **15 min after** each session. Auto-refreshes every 30 seconds via `setInterval`.
- `AdminPanel.jsx`: React state-based navigation (`view` state: `'home' | 'users' | 'user-detail' | 'links'`). No React Router — all views render in one component.
- Session data (emoji, tagline, description, colors) is duplicated across `ClassCard.jsx`, `ClassPage.jsx`, and `Dashboard.jsx` — update all three when changing session info.

### API base URL
Hardcoded as `http://localhost:8000` in all frontend pages. Change all occurrences if deploying.

### Plans and amounts
Hardcoded in `main.py` (`PLAN_AMOUNTS`) and displayed in `ClassPage.jsx` and `Payment.jsx`:
- 1 Month → ₹1,000
- 6 Months → ₹5,000  
- 1 Year → ₹10,000

## Session timing constants

In `Dashboard.jsx`:
```js
const WINDOW_BEFORE = 5   // minutes before session start
const WINDOW_AFTER  = 15  // minutes after session start
```

Sessions: `{ h: 6, m: 0 }`, `{ h: 8, m: 0 }`, `{ h: 11, m: 0 }` all IST.
