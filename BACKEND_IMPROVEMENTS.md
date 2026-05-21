# PPDB Backend Improvements Plan

**Last Updated:** May 21, 2026

## Overview

PPDB backend (Express + MySQL) has **20 improvement items** across 4 priority levels. Critical issues block production; others improve security, performance, and maintainability.

---

## 🟠 PPDB-SPECIFIC (High Priority)

These items are critical for government education systems (compliance, operations, security).

### P1. Add Audit Logging
- **Impact:** Required for government compliance + transparency
- **Details:** Log all admin actions (login, submit results, verify docs, update master) and student actions (register, submit form, upload docs)
- **Solution:** Create `middleware/auditLog.js` + `services/auditLogger.js`. Store in `audit_logs` table.
- **Fields:** `timestamp`, `user_id`, `user_type` (student/admin), `action`, `resource`, `old_value`, `new_value`, `ip_address`
- **Effort:** Medium (logging middleware + service layer)

### P2. Encrypt PII at Rest
- **Impact:** Required by data protection regulations (GDPR-like, local laws)
- **Details:** NISN, NIK, nama siswa should be encrypted in database
- **Solution:** Use MySQL `AES_ENCRYPT()` or application-level encryption with `crypto` module
- **Fields to encrypt:** `nisn`, `nik`, `nama_lengkap`, `no_hp`, `email`
- **Effort:** High (data migration + update all queries)

### P3. Implement Role-Based Access Control (RBAC)
- **Impact:** Better access control than binary admin/student
- **Details:** Current setup: all admins have full access. Should have: Super Admin, Verifikator, Operator Hasil, Operator Master
- **Solution:** Create `roles` table + `permissions` table + `middleware/authorize.js`
- **Roles:**
  - Super Admin: Full access
  - Verifikator: Verify documents only
  - Operator Hasil: Input selection results only
  - Operator Master: Manage schools/jalur/periods only
- **Effort:** Medium (permission matrix + middleware + routes update)

### P4. Add Health Check Endpoint
- **Impact:** Enables uptime monitoring, helps ops team
- **Details:** Endpoint at `/health` or `/api/health` to check system status
- **Solution:** Create `routes/health.js` or add to `routes/auth.js`
- **Checks:** Database connection, file storage space, optional email service status
- **Response:** HTTP 200 if healthy, detailed status JSON
- **Effort:** Low (simple endpoint)

### P5. Batch Import for Selection Results
- **Impact:** Operational efficiency, reduces manual errors
- **Details:** Admin uploads CSV file with selection results → validate → preview → confirm
- **Solution:** Create `services/batchImport.js` + new route `POST /api/hasil-seleksi/import`
- **Features:** CSV parser, validation rules, preview UI, import transaction (all-or-nothing)
- **Effort:** Medium (CSV parsing + validation + preview endpoint)

### P6. Define Data Retention & Archiving Policy
- **Impact:** Legal compliance, storage optimization
- **Details:** How long to keep rejected student data? Archive old years?
- **Solution:** Add `config/retentionPolicy.js`, create archive tables, scheduled job for cleanup
- **Examples:** Keep current year + 2 previous years; archive rejected students after 1 year
- **Effort:** Low (policy docs + cronjob script)

### P7. Generate Reports (CSV/PDF Export)
- **Impact:** Better transparency for admin, easier analysis
- **Details:** Admin generate stats/reports on registrations, results, per school/jalur
- **Solution:** Create `services/reportGenerator.js` + new routes `GET /api/reports/*`
- **Reports:**
  - Registration summary (by jalur, by school, by gender, by status)
  - Selection results with pass/fail breakdown
  - Document verification status
- **Effort:** Medium (reporting queries + export format)

### P8. Handle Peak Traffic During Registration Rush
- **Impact:** Better performance during high-traffic periods (last day, result announcement)
- **Details:** PPDB has predictable traffic spikes; need caching & optimization
- **Solution:**
  - Cache master data (schools, jalur, periods) with 1-hour TTL
  - Add response caching middleware for GET endpoints
  - Monitor response times during peak hours
- **Effort:** Low (caching middleware + monitoring)

---

## 🔴 CRITICAL (Production Blockers)

### 1. Fix SQL Injection in getNextId
- **Impact:** Blocks production. SQL injection vulnerability + ID collision risk.
- **Details:** `getNextId()` interpolates table/column names into query string. `MAX(...)+1` is non-atomic.
- **Duplicated in:** `auth.js`, `pendaftaran.js`, `master.js`, `hasilSeleksi.js`, `dokumen.js` (5 files)
- **Solution:** Replace with UUID (uuid package) or MySQL AUTO_INCREMENT
- **Effort:** Medium (refactor 5 files + database schema change)

### 2. Replace Static Admin Token with JWT
- **Impact:** Blocks production. Any leaked token = full admin access.
- **Details:** Token `admin-token-2025` hardcoded in `requireAdmin()` middleware
- **Files:** `pendaftaran.js`, `master.js`, `hasilSeleksi.js` (3 files)
- **Solution:** Use JWT like student auth (routes/auth.js already has JWT pattern)
- **Effort:** Low (extract middleware, use JWT pattern from student auth)

### 3. Make CORS Origin Configurable
- **Impact:** Cannot deploy to production without code change.
- **Details:** CORS origin hardcoded to `http://localhost:5173` in `server.js:14`
- **Solution:** Use `.env` variable with development fallback
- **Effort:** Low (1 line change in server.js)

### 4. Add Rate Limiting to Auth Routes
- **Impact:** Open to credential brute force attacks
- **Details:** `/api/auth/login`, `/register`, `/admin-login` unprotected
- **Solution:** Install `express-rate-limit`, apply to auth routes (5 attempts per 15 min per IP)
- **Effort:** Low (middleware + npm install)

### 5. Add Security Headers (Helmet)
- **Impact:** Vulnerable to XSS, clickjacking, MIME sniffing
- **Details:** Missing CSP, X-Frame-Options, HSTS, X-Content-Type-Options
- **Solution:** Install `helmet`, use in server.js before routes
- **Effort:** Low (npm install + middleware)

### 6. Fix Database Schema Foreign Keys
- **Impact:** Wasteful, difficult to scale, denormalized
- **Details:** `sekolah_tujuan`, `jalur_ppdb`, `periode_ppdb` each have FK to `siswa`. Should be independent master tables (one row per school/jalur/period, not per student)
- **Solution:** Redesign schema: remove `id_siswa` FK from master tables, use junction tables if needed
- **Effort:** High (schema migration, update routes/queries)

### 7. Mount emailAuth.js Route or Remove
- **Impact:** Dead code, confusing for maintainers
- **Details:** `routes/emailAuth.js` has full verification/reset logic but NOT mounted in `server.js`
- **Solution:** Either wire it up (mount in server.js) or delete if not needed
- **Effort:** Low (add route or delete file)

---

## 🟠 HIGH (Before Production)

### 8. Replace Plaintext Admin Passwords in Sample Data
- **Impact:** Sample data leaks credentials
- **Details:** `database.sql:70-73` contains plaintext passwords (A02–A05)
- **Solution:** Generate bcrypt hashes, replace in SQL file
- **Effort:** Low (script to generate hashes, update SQL)

### 9. Rename `password` Column to `password_hash`
- **Impact:** Potential query parsing errors
- **Details:** `password` is MySQL reserved word (`database.sql:59`)
- **Solution:** ALTER TABLE, update all queries with backticks or rename
- **Effort:** Medium (schema change + update routes)

### 10. Add Missing Database Indexes
- **Impact:** Slow queries on large datasets
- **Details:** Missing indexes on: `akun_ppdb.email`, `siswa.nisn`, FK columns
- **Solution:** ALTER TABLE ADD INDEX on these columns
- **Effort:** Low (SQL migration script)

### 11. Change NISN Column from INT(10) to VARCHAR
- **Impact:** Data corruption — loses leading zeros
- **Details:** NISN is currently INT(10)
- **Solution:** ALTER TABLE, convert to VARCHAR(10), update routes
- **Effort:** Medium (schema change + update routes)

### 12. Remove `usia` Column from siswa Table
- **Impact:** Stale data, normalization violation
- **Details:** `usia` is derived data (calculated from `tanggal_lahir`), stored redundantly
- **Solution:** ALTER TABLE DROP COLUMN `usia`, calculate on-the-fly in queries
- **Effort:** Medium (schema change + update calculations)

---

## 🟡 MEDIUM (Code Quality & Maintainability)

### 13. Extract `requireAdmin` Middleware to Shared File
- **Impact:** Code duplication, maintenance burden
- **Details:** Duplicated in `pendaftaran.js`, `master.js`, `hasilSeleksi.js`
- **Solution:** Create `middleware/requireAdmin.js`, import in routes
- **Effort:** Low (refactor 3 files)

### 14. Extract `getNextId` Helper to Utils
- **Impact:** Code duplication, no single source of truth
- **Details:** Duplicated in 5 route files
- **Solution:** Create `utils/idGenerator.js`, import in all routes
- **Effort:** Low (refactor 5 files)

### 15. Add Validation Library (Zod or express-validator)
- **Impact:** Inconsistent validation, harder to maintain
- **Details:** Manual if-statements scattered in routes
- **Solution:** Install `zod` or `express-validator`, create validation schemas, apply to routes
- **Effort:** Medium (schema creation + route updates)

### 16. Implement Centralized Error Handler
- **Impact:** Inconsistent error messages, harder to debug
- **Details:** Every route has its own try/catch + `res.status(500)`
- **Solution:** Create `middleware/errorHandler.js`, use in all routes
- **Effort:** Medium (middleware + route refactoring)

### 17. Persist Email Rate Limiter to Database
- **Impact:** State lost on restart, multi-process incompatible
- **Details:** In-memory Map in `middleware/emailRateLimit.js` and `services/emailService.js`
- **Solution:** Move to Redis or database table, or use npm package with persistence
- **Effort:** Medium (database table + emailService refactor)

---

## 🔵 LOW (Long-term Security)

### 18. Move Frontend BASE_URL to Environment Variable
- **Impact:** Must recompile for production
- **Details:** Hardcoded `http://localhost:5000/api` in `HalamanAuth.jsx:4` and `LoginAdmin.jsx:4`
- **Solution:** Use Vite env variable (`VITE_API_URL`)
- **Effort:** Low (frontend .env + vite.config.js)

### 19. Replace localStorage.clear() with Targeted Removal
- **Impact:** Overkill, breaks other features if shared storage
- **Details:** `App.jsx:38` clears all keys on logout
- **Solution:** Remove only `ppdb_token`, `ppdb_siswa`, `ppdb_admin_token`, `ppdb_admin`
- **Effort:** Low (App.jsx logout handler)

### 20. Migrate JWT from localStorage to httpOnly Cookies
- **Impact:** XSS vulnerability
- **Details:** JWT in localStorage vulnerable to XSS
- **Solution:** Use httpOnly cookies + CSRF tokens (requires backend changes)
- **Effort:** High (large refactor, backend + frontend)

---

## Priority Order for Implementation

**Phase 1: Security & Compliance (Critical) — Week 1**
1. Add rate limiting (#4)
2. Add security headers (#5)
3. Make CORS configurable (#3)
4. Replace static admin token (#2)
5. Add audit logging (P1) — government compliance
6. Add /health endpoint (P4) — ops requirement

**Phase 2: Critical Infrastructure — Week 2**
7. Fix SQL injection (#1) — largest change
8. Fix DB schema FK (#6)
9. Implement RBAC (P3) — operations improvement

**Phase 3: Data & Quality — Week 3**
10. Database schema changes (#9, #11, #12, #8)
11. Add indexes (#10)
12. Extract duplicates (#13, #14)
13. Encrypt PII at rest (P2) — data protection

**Phase 4: Operational & Nice-to-Have — After Release**
14. Batch import for results (P5)
15. Data retention policy (P6)
16. Report generation (P7)
17. Peak traffic handling (P8)
18. Validation library (#15)
19. Centralized error handler (#16)
20. Email state persistence (#17)
21. Frontend improvements (#18, #19, #20)

---

## Decision Points

- **UUID vs AUTO_INCREMENT:** Auto_increment is simpler, UUID allows distributed generation
- **Validation library:** Zod (modern, TypeScript-friendly) vs express-validator (simpler)
- **Email route:** Mount with verification flow or delete dead code?
- **localStorage → cookies:** Large refactor; might defer to future release
- **Audit storage:** Database table vs separate log file vs syslog?
- **PII encryption:** MySQL `AES_ENCRYPT()` vs application-level encryption? (app-level is more portable)
- **RBAC complexity:** Start with 4 roles or keep simpler? (4 recommended for PPDB workflow)
- **Batch import format:** CSV only or support Excel? (CSV is simplest)

---

## Total Items Summary

- **Critical (7):** SQL injection, admin auth, CORS, rate limit, security headers, DB schema, email route
- **High (6):** Plaintext passwords, password column name, indexes, NISN type, usia removal, schema updates
- **PPDB-Specific (8):** Audit logging, PII encryption, RBAC, health endpoint, batch import, retention policy, reports, traffic handling
- **Medium (6):** Code extraction, validation library, error handler, email persistence
- **Low (1):** localStorage → cookies

**Total: 28 improvement items** (20 standard + 8 PPDB-specific)

---

## Estimated Timeline

- **Phase 1:** 3-4 days (security + compliance fundamentals)
- **Phase 2:** 5-6 days (critical infrastructure, largest effort)
- **Phase 3:** 4-5 days (data & quality)
- **Phase 4:** 6-8 days (operational features, lower priority)

**Total: 4-5 weeks** for full implementation (assuming 1 developer, 8 hours/day)
