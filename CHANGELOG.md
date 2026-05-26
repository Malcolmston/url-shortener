# Changelog

All notable changes to **Snip** (the URL shortener) are documented here.
This file follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) conventions.

---

## [Unreleased] — 2026-05-26

### 🚀 Summary

Ten feature branches were merged into `main`, delivering a complete full-stack URL
shortener with authentication, file hosting, analytics, and a React dashboard.

---

### ✨ Added

#### PR #1 — Project Foundation & DevOps (`setup/foundation-and-vercel`)
- `app.js` — Express server scaffold with dotenv, morgan, express-session, helmet, multer
- `vercel.json` — Serverless deployment config routing all traffic to `app.js`
- `Dockerfile` — Multi-stage Docker build (node:20-alpine) for containerised deploys
- `.github/workflows/deploy.yml` — Vercel production/preview deploy workflow
- `short/` — React (Vite/Create React App) frontend scaffold with Tailwind CSS
- `.env.example` — Reference file for all required environment variables

#### PR #2 — Critical Bug Fixes & Security Hardening (`fix/critical-bugs`)
- Helmet CSP middleware (default-src, style-src, font-src, script-src, img-src)
- Express-rate-limit: `authLimiter` (20 req/15 min), `uploadLimiter` (100 req/hr), `apiLimiter` (60 req/min)
- `database/User.ts` — Sequelize model with `beforeCreate` bcrypt hook, `isValidPassword()`, `isSoftDeleted()`, paranoid soft-delete
- `database/File.ts` — File model with UUID, buffer storage, visibility toggle, paranoid soft-delete
- `database/model.ts` — Sequelize connection reading `DB_HOST`/`DB_PORT` from env (not hardcoded)
- `database/associations.ts` — User ↔ File associations
- `/health/live`, `/health/ready`, `/health/version` — health check endpoints
- `utils/slugify.js` — `generateSlug()`, `validateSlug()`, `validateUrl()` helpers
- `.github/workflows/ci.yml` — 4-job CI pipeline: lint/typecheck → build → backend smoke test (MySQL) → Docker build

#### PR #3 — URL Shortener Core (`feature/url-shortener-core`)
- `database/Link.ts` — Link model: slug, originalUrl, userId, redirectType (301/302/307), hasPreview, isPasswordProtected, passwordHash, expiresAt, isActive, clicks counter; `isExpired()` instance method; paranoid soft-delete; unique slug index
- `GET /api/links/slug-check/:slug` — real-time slug availability checker
- `POST /api/links` — create short link with auto-generated or custom slug, optional expiry, optional password, redirect type choice
- `GET /api/links` — list authenticated user's links (including soft-deleted)
- `PUT /api/links/:id` — update link URL, expiry, redirect type, preview flag, active state
- `DELETE /api/links/:id` — soft-delete a link
- `POST /api/links/:id/restore` — restore a soft-deleted link
- `GET /:slug` — slug redirect handler with expiry check, password gate, preview interstitial; placed after all named routes to prevent shadowing

#### PR #4 — Design System (`feature/design-system`)
- `short/src/components/ui/Button.jsx` — polymorphic button (`type="button"` default, variant/size props)
- `short/src/components/ui/Card.jsx` — card container with header/body/footer slots
- `short/src/components/ui/Modal.jsx` — accessible modal with focus trap and keyboard dismiss
- `short/src/components/ui/Toast.jsx` — notification toast with auto-dismiss
- Tailwind CSS design tokens: colour palette, spacing scale, typography, dark-mode support

#### PR #5 — App Shell & Navigation (`feature/app-shell`)
- `short/src/components/layout/AppShell.jsx` — authenticated layout with collapsible sidebar
- `short/src/components/layout/Sidebar.jsx` — navigation sidebar with active-link highlighting
- `short/src/components/layout/TopBar.jsx` — top navigation bar with user menu
- `short/src/pages/Dashboard.jsx` — dashboard landing page with stats cards
- `short/src/hooks/useTheme.js` — dark/light theme hook persisting to localStorage
- React Router setup with protected routes and auth redirect

#### PR #6 — Links UI (`feature/links-ui`)
- `short/src/pages/Links.jsx` — links management page with filter bar (all/active/expired/deleted), stats summary, empty state
- `short/src/components/links/NewLinkModal.jsx` — create link modal: URL input, custom slug with real-time availability check (AbortController cancels stale requests), expiry picker, redirect type selector
- `short/src/components/links/LinkCard.jsx` — link card with copy-to-clipboard, edit, delete, restore actions
- `isExpiredFn` helper to consistently derive expiry from both `isExpired` flag and `expiresAt` date

#### PR #7 — Files UI v2 & Account Settings (`feature/files-ui-v2`)
- `short/src/account.jsx` — full account settings page with tabbed navigation (Profile, Files, Security, API Keys, Sessions)
  - Reads active tab from `?tab=` query parameter
  - Profile editing: username, first/last name with inline save/cancel
  - Account statistics: total files, member-since date, last-updated date
- Theme selector with `data-theme` attribute + `dark` CSS class toggle, persisted to `localStorage` under key `snip-theme`

#### PR #8 — Auth Improvements (`feature/auth-improvements`)
- `database/PasswordResetToken.ts` — time-limited password reset tokens (24 hr expiry)
- `database/ApiKey.ts` — API key model: hashed key, name, permissions array, expiry, last-used tracking; `isExpired()` instance method
- `database/UserSession.ts` — session tracking: sessionId, IP address, user agent, lastActivityAt
- `utils/apiKey.js` — `generateApiKey()` (prefixed `sk_snp_…`), `hashApiKey()` (SHA-256)
- `POST /api/auth/forgot-password` — generate & store password reset token (email stub)
- `POST /api/auth/reset-password` — validate token, update password, invalidate token
- `GET /api/keys` — list user's API keys
- `POST /api/keys` — create a named API key
- `DELETE /api/keys/:id` — revoke an API key
- `GET /api/sessions` — list active sessions
- `DELETE /api/sessions/:id` — revoke a specific session
- `apiKeyAuth` middleware — Bearer token auth via `Authorization: Bearer sk_snp_…`
- Session activity tracker middleware — non-blocking `UserSession.upsert` on every authenticated request

#### PR #10 — Passport.js & Versioned API Routes (`feature/passport-auth-v1-routes`)
- `utils/passport.js` — Passport LocalStrategy: username/password verification, soft-delete check, `serializeUser`/`deserializeUser`
- `passport.initialize()` + `passport.session()` integrated into the middleware chain
- **Versioned API routes:**
  - `routes/v1/auth.js` — `POST /api/v1/login` (Passport), `POST /api/v1/signup`, `POST /api/v1/logout`, `GET /api/v1/me`, `GET /api/v1/check-username/:username`
  - `routes/v1/files.js` — full CRUD for files + `serveFile()` handler
  - `routes/v1/user.js` — `GET/PUT /api/v1/user` (profile)
  - `routes/v2/files.js` — paginated file list with richer metadata
  - `routes/v2/user.js` — user profile including stats (file count, link count)
- Morgan logging: `dev` format in development, `combined` (Apache) format in production

#### PR #9 — Analytics & DevOps (`feature/analytics-and-devops`)
- `database/Click.ts` — click-event model: linkId, ipHash (HMAC-SHA256, never raw IP), country, city, device, OS, browser, referrer; indexes on `(linkId, createdAt)` and `ipHash`
- `utils/parseUA.js` — `parseUserAgent()` (device/OS/browser detection, no external deps), `normalizeReferrer()` (strips path/query, skips same-origin), `hashIp()` (HMAC-SHA256 pseudonymisation using SESSION secret)
- `GET /api/analytics/links/:id` — per-link analytics: total clicks, unique visitors, clicks/day chart, top devices/OS/browsers/referrers (last 30 days, ownership-checked)
- `GET /api/analytics` — account-level aggregate: total clicks, clicks/day (last 30 days, scoped to authenticated user's links)
- `recordClick()` helper — non-blocking click capture integrated into the `/:slug` redirect handler
- `CONTRIBUTING.md` — quick start, project structure, branch naming, commit conventions, PR checklist, coding standards, environment variable reference

---

### 🔒 Security

- Passwords hashed with **bcrypt** (rounds from `SALT` env var, default 10) via `User.ts` `beforeCreate` hook — passwords are never stored in plaintext
- IP addresses are **never stored** — only a one-way HMAC-SHA256 hash (keyed on `SESSION` secret) for unique-visitor counting
- API keys stored as **SHA-256 hashes** only; raw key shown once on creation
- Password reset tokens are single-use and expire after 24 hours
- Helmet sets restrictive Content Security Policy headers
- Rate limiting on auth (20/15 min) and upload (100/hr) endpoints
- Session cookies: `httpOnly: true`, `sameSite: strict/lax`

---

### 🗄️ Database Models

| Model | Table | Key Features |
|---|---|---|
| `User` | `users` | bcrypt hook, soft-delete, `isValidPassword()` |
| `File` | `files` | Buffer storage, UUID, visibility, soft-delete |
| `Link` | `links` | Slug (unique), redirect types, expiry, password protection, click counter, soft-delete |
| `Click` | `clicks` | Analytics events, IP-hash pseudonymisation |
| `PasswordResetToken` | `password_reset_tokens` | 24 hr expiry, single-use |
| `ApiKey` | `api_keys` | Hashed key, permissions, expiry |
| `UserSession` | `user_sessions` | Session tracking, IP, user agent |

---

### 📡 API Reference

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health/live` | None | Liveness probe |
| `GET` | `/health/ready` | None | Readiness probe (DB ping) |
| `GET` | `/health/version` | None | Package version + Node version |
| `POST` | `/signup` | None | Register new account |
| `POST` | `/login` | None | Log in (rate-limited) |
| `POST` | `/logout` | Session | Log out, destroy session |
| `GET` | `/user` | Session | Get own profile + files |
| `PUT` | `/change` | Session | Update profile (username, names) |
| `POST` | `/upload` | Session | Upload files (multipart, max 50 MB each) |
| `GET` | `/files` | Session | List own files |
| `POST` | `/action/:type/:id` | Session | File actions: visibility, rename, delete, recover |
| `GET` | `/uploads/:name` | Session/Public | Serve file (visibility-aware) |
| `GET` | `/api/links/slug-check/:slug` | None | Check slug availability |
| `POST` | `/api/links` | Session | Create short link |
| `GET` | `/api/links` | Session | List own links |
| `PUT` | `/api/links/:id` | Session | Update link |
| `DELETE` | `/api/links/:id` | Session | Soft-delete link |
| `POST` | `/api/links/:id/restore` | Session | Restore soft-deleted link |
| `GET` | `/api/analytics/links/:id` | Session | Per-link analytics |
| `GET` | `/api/analytics` | Session | Account-level analytics |
| `POST` | `/api/auth/forgot-password` | None | Request password reset token |
| `POST` | `/api/auth/reset-password` | None | Reset password with token |
| `GET` | `/api/keys` | Session | List API keys |
| `POST` | `/api/keys` | Session | Create API key |
| `DELETE` | `/api/keys/:id` | Session | Revoke API key |
| `GET` | `/api/sessions` | Session | List active sessions |
| `DELETE` | `/api/sessions/:id` | Session | Revoke session |
| `GET` | `/:slug` | None | Redirect to original URL |

---

[Unreleased]: https://github.com/malcolmston/url-shortener/compare/HEAD
