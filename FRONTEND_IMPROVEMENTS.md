# PPDB Frontend Improvements Plan

**Last Updated:** May 21, 2026

## Overview

PPDB frontend (React 19 + Vite + Tailwind) has **20 improvement items** across 4 priority levels. Critical issues prevent deployment; others improve UX, maintainability, and user accessibility.

---

## 🔴 CRITICAL (Deployment Blockers)

### 1. Move API BASE_URL to Environment Variable
- **Impact:** Cannot deploy to different servers without recompile
- **Details:** Hardcoded `http://localhost:5000/api` in 3 files:
  - `src/pages/siswa/HalamanAuth.jsx:4`
  - `src/pages/siswa/FormPendaftaran.jsx:8`
  - `src/pages/admin/LoginAdmin.jsx:4`
- **Solution:** Use Vite env variable `VITE_API_URL` in all files, create `ppdb-app/.env.example`
- **Effort:** Low (1 hour)

### 2. Remove Hardcoded Admin Token Fallback
- **Impact:** Security breach if fallback ever used in production
- **Details:** `src/pages/admin/VerifikasiDokumen.jsx:26` has fallback `"admin-token-2025"`
  ```javascript
  const token = localStorage.getItem("ppdb_admin_token") || "admin-token-2025";
  ```
- **Solution:** Remove fallback, throw error if token missing
- **Effort:** Low (5 minutes)

---

## 🟠 HIGH (Before Production)

### 3. Replace localStorage.clear() with Targeted Removal
- **Impact:** Breaks other site data if localStorage shared
- **Details:** `src/App.jsx:38` logout handler clears ALL keys indiscriminately
- **Solution:** Remove only app-specific keys:
  ```javascript
  const keysToRemove = ["ppdb_token", "ppdb_siswa", "ppdb_admin_token", "ppdb_admin"];
  keysToRemove.forEach(k => localStorage.removeItem(k));
  ```
- **Effort:** Low (10 minutes)

### 4. Implement React Router Instead of Manual State Routing
- **Impact:** No browser back/forward; not scalable as features grow
- **Details:** `src/App.jsx` uses manual `halaman` state + switch statement for routing
- **Solution:** Use React Router v7 (already in dependencies)
  - Create `src/router.jsx` with route definitions
  - Use `<BrowserRouter>`, `<Routes>`, `<Route>`
  - Preserve layout structure (student vs admin)
- **Effort:** Medium (2-3 hours, refactor all pages)

### 5. Create HTTP Interceptor for Auth Headers
- **Impact:** Code duplication, inconsistent error handling
- **Details:** Every fetch call manually builds auth header + error handling
- **Solution:** Create `src/services/api.js` or `src/utils/httpClient.js`
  ```javascript
  // Auto-inject Authorization header
  // Auto-handle 401 (redirect to login)
  // Consistent error responses
  ```
- **Effort:** Medium (2 hours)

### 6. Add Form Validation Library (React Hook Form + Zod)
- **Impact:** Poor UX, data inconsistency with backend
- **Details:** Manual if-checks scattered; no real-time validation; errors not typed
- **Solution:**
  - Install `react-hook-form` and `zod`
  - Create validation schemas for: register, login, form pendaftaran
  - Use `useForm` hook in components
  - Show field-level errors
- **Effort:** High (4-5 hours, update all forms)

### 7. Implement React Error Boundaries
- **Impact:** One component crash = whole app blank (white screen)
- **Solution:** Create `src/components/ErrorBoundary.jsx`
  - Wrap App or route-level
  - Show user-friendly error UI
  - Log errors for debugging
- **Effort:** Low (1 hour)

### 8. Implement Centralized State Management
- **Impact:** Hard to maintain, state conflicts, heavy prop drilling
- **Details:** Auth state, user data, navigation scattered in App.jsx props
- **Solution:** Use Context API + custom hook OR Zustand
  - Create `src/context/AuthContext.jsx` (auth, user, loading, errors)
  - Create `src/context/UIContext.jsx` (current page, sidebar open, etc)
  - Reduce prop drilling
- **Effort:** High (3-4 hours, refactor all pages)

---

## 🟡 MEDIUM (Code Quality & UX)

### 9. Cache Master Data (Schools, Jalur) with TTL
- **Impact:** Unnecessary API calls, slower form load
- **Details:** `FormPendaftaran.jsx` fetches options every mount, no caching
- **Solution:** Create `src/services/cacheService.js`
  - Cache master data for 1 hour or per session
  - Use localStorage or in-memory cache
  - Invalidate on demand
- **Effort:** Medium (1.5 hours)

### 10. Remove Hardcoded Fallback Data
- **Impact:** Maintenance burden, confusion when data differs
- **Details:** `FormPendaftaran.jsx` has `SEKOLAH_FALLBACK` and `JALUR_FALLBACK`
- **Solution:** Remove fallbacks when API is reliable, replace with empty state message
- **Effort:** Low (30 minutes)

### 11. Implement Consistent Loading UI Component
- **Impact:** Poor UX during slow connections
- **Details:** No global loading indicator, inconsistent per-page loading
- **Solution:** Create `src/components/Loading.jsx` or `Spinner.jsx`
  - Global loading context (e.g., for API calls)
  - Consistent skeleton loaders
- **Effort:** Medium (1.5 hours)

### 12. Centralize API Error Handling
- **Impact:** Inconsistent UX
- **Details:** Some pages show alerts, some silent failures, no typed errors
- **Solution:** Create error types + error display component
  - `src/types/errors.ts` (or .js)
  - `src/components/ErrorAlert.jsx`
  - Consistent error responses from API interceptor
- **Effort:** Medium (1.5 hours)

### 13. Sanitize User Inputs to Prevent XSS
- **Impact:** Potential XSS if backend returns malicious data
- **Details:** Names, NISN, etc directly rendered without sanitization
- **Solution:** Use `DOMPurify` library or React's built-in escaping
  ```javascript
  import DOMPurify from 'dompurify';
  // Use on user-supplied data before rendering
  ```
- **Effort:** Low (1 hour)

### 14. Ensure Full Mobile Responsiveness
- **Impact:** Bad UX on mobile, excluding users
- **Details:** Desktop-first design, unclear if works on phone/tablet
- **Solution:**
  - Test on real devices or responsive breakpoints
  - Fix layout issues on small screens
  - Optimize touch targets (min 48px)
  - Fix Tailwind breakpoints if needed
- **Effort:** Medium (2-3 hours)

### 15. Add ARIA Labels and Keyboard Navigation
- **Impact:** Excludes blind/accessibility users
- **Details:** No accessibility attributes, not keyboard-navigable
- **Solution:**
  - Add `aria-label`, `aria-describedby`, `role` attributes
  - Ensure tab order is logical
  - Test with screen reader
- **Effort:** Medium (2-3 hours)

---

## 🔵 LOW (Nice-to-Have)

### 16. Add Unit & Integration Tests
- **Impact:** No confidence in refactors, hard to catch bugs
- **Details:** No tests configured
- **Solution:** Set up testing with Vitest + React Testing Library
  - Test forms, auth flows, API integration
  - Aim for 50%+ coverage initially
- **Effort:** High (5-6 hours initial setup)

### 17. Add Progressive Web App (PWA) Support
- **Impact:** Users can't use offline, worse mobile UX
- **Details:** No service workers, no installable manifest
- **Solution:**
  - Create `public/manifest.json`
  - Register service worker for offline support (if needed)
  - Optional: make installable on home screen
- **Effort:** Medium (2 hours)

### 18. Add Analytics/Telemetry
- **Impact:** Difficult to optimize, no usage data
- **Details:** No tracking of user flows, error rates, performance
- **Solution:** Integrate Google Analytics or Plausible
  - Track registration flow completion
  - Track errors/crashes
  - Track page performance
- **Effort:** Low (1 hour)

### 19. Add CI/CD for Frontend
- **Impact:** Quality regressions not caught
- **Details:** ESLint exists but not run in CI
- **Solution:** Add GitHub Actions workflow
  - Run ESLint
  - Run tests
  - Build check
  - Optional: Lighthouse audit
- **Effort:** Low (1 hour)

### 20. Optimize Vite Build
- **Impact:** Slower initial load time
- **Details:** Bundle size not optimized, no code splitting
- **Solution:**
  - Add dynamic imports for route components (lazy loading)
  - Configure chunk splitting
  - Minify CSS/JS (already default in Vite)
  - Analyze bundle size with `rollup-plugin-visualizer`
- **Effort:** Medium (1.5 hours)

---

## Priority Order for Implementation

**Phase 1: Critical Deployment (ASAP) — 1 day**
1. Move BASE_URL to env var (#1)
2. Remove hardcoded admin token fallback (#2)
3. Fix localStorage.clear() (#3)

**Phase 2: Stability & UX (Before Production) — 2-3 days**
4. Implement React Router (#4) — Large refactor
5. Create HTTP interceptor (#5)
6. Add Error Boundaries (#7)
7. Implement state management (#8) — Can do alongside #4

**Phase 3: Forms & Data (Week 2)**
8. Add form validation (React Hook Form + Zod) (#6)
9. Cache master data (#9)
10. Centralize error handling (#12)
11. Sanitize inputs (#13)

**Phase 4: Polish & Nice-to-Have (Week 3+)**
12. Consistent loading UI (#11)
13. Remove fallback data (#10)
14. Mobile responsiveness (#14)
15. Accessibility (#15)
16. Tests (#16)
17. PWA (#17)
18. Analytics (#18)
19. CI/CD (#19)
20. Build optimization (#20)

---

## Integration with Backend Improvements

**Frontend depends on backend improvements:**

| Frontend | Requires Backend | Notes |
|----------|------------------|-------|
| #1 BASE_URL env | Backend deployed (any server) | Can use env fallback |
| #5 HTTP interceptor | Backend auth pattern | Already works with JWT |
| #6 Form validation | Backend validation (P15) | Should match Zod schemas |
| #9 Cache master data | Backend GET endpoints | FormPendaftaran.jsx already fetches `/pendaftaran/opsi` |
| #12 Error handling | Backend error format | Backend should return consistent `{ code, message }` |
| #13 XSS sanitization | Backend PII encryption (P2) | Encrypted data safe, but sanitize anyway |

**Backend should implement first:**
- Backend #2 (JWT admin auth) — frontend #2 depends on it
- Backend #4 (rate limiting) — frontend should show better errors
- Backend P3 (RBAC) — frontend can then show role-based UI
- Backend P1 (audit logging) — frontend should log user actions

---

## Decision Points

- **State management:** Context API (simpler, no dependencies) vs Zustand (more powerful)?
- **Form library:** React Hook Form (minimal) vs Formik (heavier)?
- **Validation:** Zod (modern, TypeScript) vs Yup (established)?
- **Testing framework:** Vitest (fast) vs Jest (familiar)?
- **PWA:** Essential or nice-to-have for PPDB? (Depends on requirements)
- **Analytics:** Google Analytics (free, privacy concerns) vs Plausible (privacy-first)?

---

## Estimated Timeline

- **Phase 1:** 1 day (critical fixes)
- **Phase 2:** 2-3 days (major refactors)
- **Phase 3:** 1-2 days (forms + data)
- **Phase 4:** 5-6 days (polish + optional)

**Total: 9-12 days** for full implementation (assuming 1 developer, 8 hours/day)

---

## Current Tech Stack

- React 19.2.4
- Vite 8.0.0
- Tailwind CSS 3.4.19
- React Router DOM 7.14.2 (installed but not used)
- Heroicons React 2.2.0
- ESLint 9.39.4 (configured, not in npm scripts)

## Recommended Additions

- `react-hook-form` (forms)
- `zod` (validation)
- `zustand` or React Context (state)
- `dompurify` (XSS prevention)
- `axios` or keep `fetch` (HTTP client)
- `vitest` + `@testing-library/react` (testing)
- `rollup-plugin-visualizer` (bundle analysis)
