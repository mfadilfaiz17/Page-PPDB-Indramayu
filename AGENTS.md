# PPDB Indramayu — Agent Guide

Monorepo: `ppdb-app/` (React 19 + Vite 8 + Tailwind 3, JS) + `ppdb-backend/` (Express + MySQL).

## Commands

| Package | Command | Note |
|---------|---------|------|
| Backend | `npm run dev` | nodemon on port 5000 |
| Backend | `npm run migrate:email` | Create email system tables |
| Backend | `npm start` | Production start |
| Frontend | `npm run dev` | Vite on port 5173 |
| Frontend | `npm run build` | Vite build |
| Frontend | `npm run lint` | ESLint (flat config) |
| DB init | `mysql -u root -p sistem_ppdb < ppdb-backend/database.sql` | Import schema + sample data |

## Setup order

1. `cp .env.example .env` (in `ppdb-backend/`)
2. Import database SQL
3. `npm run migrate:email` (adds `email_tokens` table)
4. `npm run dev` in backend then frontend

## Quirks

- **Module systems**: Backend is CommonJS (`require` / `module.exports`). Frontend is ESM (`import` / `export`). Don't mix them.
- **CORS hardcoded**: `origin: "http://localhost:5173"` in `server.js:14`. Must change for production.
- **Root `package.json` = backend**: The root package installs backend deps. Frontend has its own at `ppdb-app/package.json`.
- **Client-side routing**: Manual `halaman` state in `App.jsx` — not React Router (despite `react-router-dom` being installed).
- **Admin auth**: Static token `admin-token-2025` checked in middleware (`requireAdmin`). Not JWT. Duplicated in 3 route files (`pendaftaran.js`, `master.js`, `hasilSeleksi.js`).
- **Admin passwords**: Some in DB may be plaintext; code detects hashed via `$2` prefix.
- **Email route dead code**: `routes/emailAuth.js` exists with full verification/reset logic but is NOT mounted in `server.js`. Useless until added.
- **Email rate limiting**: In-memory `Map` — resets on server restart. Not suitable for multi-process.
- **No test framework** — neither package has tests configured.
- **File uploads**: Multer, max 2MB, allowed: PDF/JPG/PNG. Stored in `ppdb-backend/uploads/`.
- **LocalStorage keys**: `ppdb_token` (student JWT), `ppdb_admin_token`, `ppdb_siswa` (student data), `ppdb_admin`.
- **ID generation**: Custom `getNextId(prefix, table, column)` — SQL `MAX(CAST(SUBSTRING(...)))+1`. Not UUID. SQL injection vector + race condition. Duplicated in 5 files.
- **`.env.example` reference**: `ppdb-backend/.env.example` lists all required vars (DB, JWT_SECRET, GMAIL_USER/PASSWORD, FRONTEND_URL).

## Production Audit (May 2026)

Items verified against actual code. Parentheses = location.

### 🔴 Critical — Blocking production
- **SQL injection + race condition**: `getNextId` interpolates table/column names into query string; `MAX(...)+1` is non-atomic. Duplicated in 5 files. Replace with UUID or `AUTO_INCREMENT`.
- **Static admin token**: `admin-token-2025` hardcoded in `requireAdmin()` (3 files). Any leak = full admin access. Use JWT like student auth.
- **Dead route**: `routes/emailAuth.js` has full verification/reset logic but is NOT mounted in `server.js`. Useless until added.
- **No auth rate limiting**: `/api/auth/login`, `/register`, `/admin-login` unprotected against brute force. Add `express-rate-limit`.
- **No security headers**: `helmet` not installed. No CSP, XFO, HSTS.
- **Plaintext passwords in sample data**: `database.sql:70-73` (A02–A05).
- **CORS hardcoded**: `origin: "http://localhost:5173"` at `server.js:14`. Breaks on any other origin.

### 🟠 Database schema — Redesign needed
- **Wrong FKs**: `sekolah_tujuan`, `jalur_ppdb`, `periode_ppdb` each have FK to `siswa`. Schools, jalur, and periods should be **independent master tables**, not per-student rows. Each appears once per student in sample data — redundant storage.
- **`password` is MySQL reserved word** (`database.sql:59`). Rename to `password_hash`.
- **Missing indexes**: `akun_ppdb.email`, `siswa.nisn`, FK columns in referencing tables.
- **`usia` is derived data**: Stored redundantly in `siswa`, will go stale. Remove column, calculate from `tanggal_lahir`.
- **NISN as `INT(10)`**: Should be `VARCHAR` to preserve leading zeros.

### 🟡 Code quality — Duplication & gaps
- **`requireAdmin`** duplicated in `routes/pendaftaran.js`, `routes/master.js`, `routes/hasilSeleksi.js`. Extract to `middleware/`.
- **`getNextId`** duplicated in 5 route files (`auth.js`, `pendaftaran.js`, `master.js`, `hasilSeleksi.js`, `dokumen.js`). Extract to `utils/`.
- **No validation library**: Manual if-statements scattered. Add `zod` or `express-validator`.
- **No centralized error handler**: Every route has its own try/catch + `res.status(500)`.
- **In-memory state**: Email rate limiter (`middleware/emailRateLimit.js`) and email logs (`services/emailService.js`) reset on restart. Not suitable for multi-process.

### 🔵 Frontend — Config & UX
- **`BASE_URL` hardcoded**: `"http://localhost:5000/api"` in `HalamanAuth.jsx:4` and `LoginAdmin.jsx:4`. Must use env var.
- **`localStorage.clear()` on logout** (`App.jsx:38`): Wipes all keys, not just app keys. Use targeted removal.
- **JWT in localStorage**: Vulnerable to XSS. Prefer httpOnly cookie pattern.
- **No server-side validation**: Frontend validates NISN=10 digits, NIK=16 digits, etc. Backend only checks existence. Add Zod validation on both sides.

### ⚪ Operational
- No test framework, no CI/CD, no health endpoint, no structured logging.
- Migration scripts are one-off files with `process.exit()`. No `migrations` tracking table.
