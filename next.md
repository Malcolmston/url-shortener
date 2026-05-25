# URL Shortener — Git Branch Roadmap

> **Scope:** 70 development branches · 350+ planned features  
> **Stack baseline:** Express · Sequelize · MySQL · React · Tailwind  
> **Review date:** 2026-05-25

---

## Codebase Review Summary

### Strengths
- Clean Sequelize models with soft-delete support on both `User` and `File`
- Bcrypt password hashing via model hooks (pre-save)
- UUID generation for file identity, keeping internal IDs private
- Comprehensive MIME-type mapping in `Mime.jsx` (400+ types)
- Drag-and-drop upload with progress bar and file-type preview in `Upload.jsx`
- Granular file actions (visibility toggle, rename, soft-delete, restore)

### Issues Found
1. **`/change` endpoint** (`app.js`) builds an update object but never calls `.save()` — profile edits silently no-op.
2. **Soft-delete signup race** (`app.js` lines 123-128) — calls `.isSoftDeleted()` on a query result that may be `null`, crashing the server.
3. **JWT referenced but unused** — `uploads/:name` imports a JWT check that is never wired up; private-file enforcement is incomplete.
4. **Files stored as MySQL BLOBs** — not scalable; large files will degrade DB performance significantly.
5. **No rate limiting** — auth endpoints (`/signup`, `/login`) are open to brute-force.
6. **No CSRF protection** — session cookies are vulnerable without a CSRF token strategy.
7. **`package.json` absent** from repo root — dependency installation is non-deterministic.
8. **Zero test coverage** — no unit, integration, or e2e tests exist.
9. **`tsconfig.json` targets CommonJS but source uses `import/export`** — may cause compilation issues.
10. **No environment variable validation** — missing vars silently produce `undefined`, causing obscure runtime failures.

---

## Branch Roadmap

Each branch entry lists: branch name → description → **5+ pre-branch tasks**.

---

### 1. `fix/profile-update-save`
**Fix the silent no-op in the `/change` profile endpoint.**
- [ ] Locate and confirm the missing `.save()` / `.update()` call in `app.js`
- [ ] Add `await user.save()` after building the update payload
- [ ] Return only safe fields (no password hash) in the JSON response
- [ ] Add server-side validation for `firstname`, `lastname`, `username` matching User model constraints
- [ ] Write a manual smoke-test plan for editing username and verifying DB persistence

---

### 2. `fix/signup-null-guard`
**Eliminate the crash when `user` is `null` during soft-delete check on signup.**
- [ ] Audit the soft-delete path in the signup handler
- [ ] Wrap the `.isSoftDeleted()` call in an explicit null check
- [ ] Add a regression test case: attempt signup with a username that was previously soft-deleted
- [ ] Verify the re-activation path restores all user fields correctly
- [ ] Document expected behavior in code comments

---

### 3. `fix/jwt-private-file-access`
**Wire up the existing JWT import to enforce private file visibility.**
- [ ] Remove or replace the dead JWT import with the session-based auth middleware
- [ ] Enforce that `GET /uploads/:name` for private files requires an authenticated session owning that file
- [ ] Return `403` (not `404`) for unauthorized private file access to avoid info leakage
- [ ] Add tests covering: public file (unauthenticated), private file (owner), private file (non-owner)
- [ ] Update API documentation to reflect access control behavior

---

### 4. `fix/env-validation`
**Validate required environment variables at startup.**
- [ ] Enumerate all required env vars (`SESSION`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `PORT`)
- [ ] Add a startup validation function that throws a descriptive error for each missing var
- [ ] Create a `.env.example` file listing all variables with placeholder values
- [ ] Add `dotenv-safe` or equivalent to enforce the schema
- [ ] Document environment setup in `README.md`

---

### 5. `fix/package-json`
**Add `package.json` to root and lock dependencies.**
- [ ] Run `npm init` and capture all existing dependencies from `app.js` imports
- [ ] Add all backend dependencies: `express`, `sequelize`, `mysql2`, `multer`, `morgan`, `bcrypt`, `express-session`, `dotenv`, `uuid`
- [ ] Add all dev dependencies: `typescript`, `ts-node`, `@types/node`, `@types/express`
- [ ] Commit `package-lock.json` to ensure reproducible installs
- [ ] Update `Dockerfile` to rely on the lockfile (`npm ci`)

---

### 6. `feature/url-shortener-core`
**Implement the foundational URL shortening functionality (the app's core namesake).**
- [ ] Create a `Link` Sequelize model with fields: `id`, `slug` (unique), `originalUrl`, `userId` (FK), `clicks` (counter), `createdAt`, `deletedAt`
- [ ] Add `POST /shorten` endpoint accepting `{ url, customSlug? }` and returning the short URL
- [ ] Add `GET /:slug` redirect endpoint with click counter increment
- [ ] Validate URLs on input (must be valid `http/https` with `is-url` or similar)
- [ ] Generate cryptographically random slugs (6 chars, base62) when no custom slug is provided
- [ ] Return `301` for permanent and `302` for temporary redirects based on a link flag

---

### 7. `feature/custom-slugs`
**Allow users to choose their own short codes.**
- [ ] Add `customSlug` field to the Link model with uniqueness constraint
- [ ] Validate slug format: 3–50 alphanumeric + hyphen + underscore characters
- [ ] Block reserved slugs (list: `api`, `dashboard`, `login`, `signup`, `admin`, `static`, `uploads`)
- [ ] Show real-time slug availability feedback in the frontend (debounced `GET /slug/check/:slug`)
- [ ] Enforce per-user slug quota (max 50 custom slugs on free tier) with 429 response

---

### 8. `feature/link-expiry`
**Let users set expiration dates on shortened links.**
- [ ] Add `expiresAt` (nullable DATETIME) column to the `Link` model
- [ ] Add `expired` boolean getter on the model
- [ ] Return `410 Gone` (not 404) when a visitor hits an expired link
- [ ] Display expiry countdown in the link management UI
- [ ] Send an email notification 24 hours before a link expires (queued job)
- [ ] Allow users to extend or remove expiry from the dashboard

---

### 9. `feature/link-passwords`
**Password-protect individual short links.**
- [ ] Add `passwordHash` (nullable STRING) to the `Link` model
- [ ] Add a password entry page served at `/:slug` when a link is protected
- [ ] Use bcrypt to verify the entered password against the stored hash
- [ ] Issue a short-lived signed cookie on success to prevent re-prompting within a session
- [ ] Allow the link owner to set, change, or remove the password from the dashboard

---

### 10. `feature/bulk-url-operations`
**Manage many links at once.**
- [ ] Add multi-select checkboxes to the links table in the UI
- [ ] Implement `POST /links/bulk/delete` accepting an array of link IDs
- [ ] Implement `POST /links/bulk/archive` to soft-delete multiple links
- [ ] Implement `POST /links/bulk/export` returning a CSV of selected links and their stats
- [ ] Add confirmation dialog showing the count of affected links before destructive bulk actions

---

### 11. `feature/url-redirect-types`
**Support different HTTP redirect strategies per link.**
- [ ] Add `redirectType` ENUM field (`301`, `302`, `307`, `308`) to the `Link` model
- [ ] Respect the `redirectType` when issuing the redirect response
- [ ] Provide a UI selector with tooltips explaining each redirect type
- [ ] Default new links to `302` (temporary) to preserve click tracking flexibility
- [ ] Allow users to change redirect type post-creation

---

### 12. `feature/url-preview`
**Show a preview card before following a short link (bot-safe interstitial).**
- [ ] Add `preview` boolean flag to the `Link` model — when true, show an interstitial
- [ ] Build a preview page component showing: destination URL, page title, og:image, and a "Continue" button
- [ ] Fetch OG metadata server-side at link-creation time using `open-graph-scraper`
- [ ] Cache OG metadata in a new `LinkMeta` table (title, description, imageUrl)
- [ ] Respect `noindex` / privacy signals: don't cache metadata for private-link pages

---

### 13. `feature/qr-codes`
**Generate QR codes for every short link.**
- [ ] Install `qrcode` npm package on the backend
- [ ] Add `GET /links/:id/qr` endpoint returning a PNG QR code image
- [ ] Add a "Download QR" button on each link card in the dashboard
- [ ] Support SVG output as an alternative format via query param `?format=svg`
- [ ] Allow users to customize QR foreground/background colors
- [ ] Embed the short URL as center-text within the QR code image

---

### 14. `feature/click-analytics`
**Track every click on a short link.**
- [ ] Create a `Click` model: `id`, `linkId` (FK), `ipHash` (SHA-256 of IP for privacy), `userAgent`, `referrer`, `country`, `city`, `timestamp`
- [ ] Record a click entry on every `GET /:slug` hit in a non-blocking async call
- [ ] Add `GET /links/:id/analytics` endpoint returning click counts by day/week/month
- [ ] Display a click count badge on each link card in the dashboard
- [ ] Add a sparkline chart showing clicks over the last 30 days per link

---

### 15. `feature/geo-analytics`
**Break down clicks by geographic location.**
- [ ] Integrate `geoip-lite` (or MaxMind GeoLite2) to resolve IP → country/city at click time
- [ ] Store `country` (ISO2) and `city` on the `Click` model
- [ ] Add an analytics tab with a world choropleth map (using `react-simple-maps`)
- [ ] Provide a sortable table of top countries and cities by click volume
- [ ] Anonymize IPs: store only the hashed IP, never raw; add a privacy notice

---

### 16. `feature/device-analytics`
**Track device, OS, and browser breakdown per link.**
- [ ] Parse `User-Agent` with `ua-parser-js` at click recording time
- [ ] Store `device` (desktop/mobile/tablet), `os`, `browser` on the `Click` model
- [ ] Build a doughnut chart showing device type breakdown
- [ ] Build bar charts for top browsers and top operating systems
- [ ] Surface a "Bot traffic" percentage estimate using common bot UA signatures

---

### 17. `feature/referrer-analytics`
**Show where traffic is coming from.**
- [ ] Store the `Referer` HTTP header on the `Click` model
- [ ] Parse and normalize referrers (e.g., group `t.co/*` → Twitter)
- [ ] Build a ranked referrer list with percentage share in the analytics UI
- [ ] Differentiate "direct" (empty referrer) from "unknown"
- [ ] Allow filtering the main analytics view by referrer source

---

### 18. `feature/analytics-dashboard`
**Unified analytics overview across all links.**
- [ ] Build a top-level `/analytics` page showing aggregate stats for the account
- [ ] Display: total links, total clicks today/week/month, top 5 links by clicks
- [ ] Add a time-range selector (7d / 30d / 90d / custom) that refreshes all charts
- [ ] Make each chart responsive and render correctly on mobile
- [ ] Add a "Compare links" view that overlays two links' click timelines on one chart

---

### 19. `feature/export-analytics`
**Download analytics data.**
- [ ] Add `GET /analytics/export` endpoint accepting `format=csv|json` and a date range
- [ ] Export columns: slug, originalUrl, date, clicks, countries, devices
- [ ] Show an export modal in the UI with format selector and date pickers
- [ ] Rate-limit exports to prevent abuse (max 10 exports/hour per user)
- [ ] Email the export file to the user for large datasets (>10k rows) instead of streaming

---

### 20. `feature/file-versioning`
**Track version history for uploaded files.**
- [ ] Create a `FileVersion` model: `id`, `fileId` (FK), `versionNumber`, `blob`, `size`, `createdAt`
- [ ] On re-upload to an existing file UUID, create a new version instead of overwriting
- [ ] Add `GET /files/:id/versions` to list all versions with size and date
- [ ] Allow restoring any previous version as the current file
- [ ] Add a "Version history" panel in the file detail UI

---

### 21. `feature/file-sharing`
**Share files with other users or via public link.**
- [ ] Create a `FileShare` model: `id`, `fileId`, `sharedWithUserId` (nullable), `token` (UUID), `expiresAt`, `maxDownloads`
- [ ] Add `POST /files/:id/share` to generate a share link with optional constraints
- [ ] Add `GET /share/:token` endpoint for public download without authentication
- [ ] Show a "Shared with" list on each file's detail page
- [ ] Allow revoking share links, which immediately invalidates the token

---

### 22. `feature/file-organization`
**Folders and tags for files.**
- [ ] Create a `Folder` model: `id`, `userId`, `name`, `parentId` (self-FK for nesting)
- [ ] Add `folderId` FK to the `File` model
- [ ] Create a `Tag` model and `FileTag` junction table
- [ ] Implement drag-and-drop file-to-folder assignment in the UI
- [ ] Add a folder tree sidebar in the files view
- [ ] Add a tag filter bar with multi-select above the file grid

---

### 23. `feature/file-search`
**Full-text search across file names, tags, and metadata.**
- [ ] Add a MySQL FULLTEXT index on `File.name`
- [ ] Add `GET /files/search?q=` endpoint using `MATCH ... AGAINST` queries
- [ ] Extend search to tag names and folder names
- [ ] Build a global search bar in the header with keyboard shortcut (⌘/Ctrl + K)
- [ ] Show search results grouped by type (files, folders, links) in a command-palette overlay

---

### 24. `feature/bulk-file-operations`
**Select and act on multiple files at once.**
- [ ] Add multi-select mode to the file grid with shift-click range selection
- [ ] Implement `POST /files/bulk/delete` for soft-deleting multiple files
- [ ] Implement `POST /files/bulk/restore` for restoring multiple files
- [ ] Implement `POST /files/bulk/move` for moving files to a folder
- [ ] Add a bulk tag-assign action

---

### 25. `feature/file-compression`
**Compress files on upload and serve compressed assets.**
- [ ] Compress image uploads with `sharp` (resize to max 4096px, convert to WebP)
- [ ] Zip multi-file downloads server-side using `archiver`
- [ ] Add a "Download all as ZIP" button to folder views
- [ ] Store original + compressed versions; serve compressed by default
- [ ] Show compression ratio on the file detail card

---

### 26. `feature/cloud-storage`
**Migrate file storage from MySQL BLOBs to object storage.**
- [ ] Add `storageKey` and `storageBackend` columns to the `File` model
- [ ] Implement an `S3StorageAdapter` using `@aws-sdk/client-s3`
- [ ] Implement a `LocalStorageAdapter` for development/fallback
- [ ] Write a migration script that reads existing BLOBs and pushes them to S3
- [ ] Update upload, download, and delete routes to use the adapter interface
- [ ] Remove `file` BLOB column from `File` model after migration

---

### 27. `feature/file-encryption`
**Encrypt files at rest.**
- [ ] Generate a per-user AES-256 encryption key derived from a server secret + userId
- [ ] Encrypt file data before writing to storage (BLOB or S3)
- [ ] Decrypt transparently on download
- [ ] Display an encrypted badge on file cards
- [ ] Provide a key rotation utility for server secret changes

---

### 28. `feature/file-metadata`
**Store and display extended file metadata.**
- [ ] Add a `FileMeta` table: `fileId`, `width`, `height`, `duration`, `colorProfile`, `exif` (JSON)
- [ ] Extract image EXIF data with `exifr` on upload
- [ ] Extract video/audio duration with `ffprobe` on upload
- [ ] Show metadata in a collapsible panel on the file preview modal
- [ ] Index `width`, `height`, `duration` for filter queries (e.g., filter images > 1920px)

---

### 29. `feature/file-preview-improvements`
**Enhance the in-browser preview experience.**
- [ ] Add syntax-highlighted code preview using `highlight.js` (all languages)
- [ ] Add a 3D model viewer for `.obj` / `.stl` files with `three.js`
- [ ] Add a spreadsheet viewer for `.csv` / `.xlsx` with `react-data-grid`
- [ ] Add a Markdown renderer for `.md` files
- [ ] Add a font preview page for `.ttf` / `.woff` / `.woff2` files showing the alphabet
- [ ] Add a DICOM viewer stub for `.dcm` files with a placeholder

---

### 30. `feature/oauth-providers`
**Social login via OAuth2.**
- [ ] Install and configure `passport.js` with `passport-google-oauth20`
- [ ] Add GitHub OAuth2 strategy (`passport-github2`)
- [ ] Add `oauthProvider` and `oauthId` fields to the `User` model
- [ ] Handle account linking: if the email already exists, merge OAuth identity
- [ ] Add Google and GitHub login buttons to the signup and login pages

---

### 31. `feature/two-factor-auth`
**Time-based OTP (TOTP) 2FA.**
- [ ] Add `totpSecret` (nullable, encrypted) and `totpEnabled` columns to `User`
- [ ] Add `POST /auth/2fa/setup` to generate a TOTP secret and QR code
- [ ] Add `POST /auth/2fa/verify` to confirm setup with a 6-digit code
- [ ] Require TOTP code after password check on login when enabled
- [ ] Provide 8 single-use backup codes on setup; store hashed
- [ ] Add 2FA management page under account settings

---

### 32. `feature/password-reset`
**Secure password reset via email.**
- [ ] Create a `PasswordResetToken` model: `userId`, `token` (UUID), `expiresAt`, `usedAt`
- [ ] Add `POST /auth/forgot-password` accepting email/username and sending a reset email
- [ ] Add `POST /auth/reset-password` validating the token and updating the hash
- [ ] Expire tokens after 1 hour; mark them used on first consumption
- [ ] Build a reset password form with password strength meter

---

### 33. `feature/role-based-access`
**User roles and permission levels.**
- [ ] Add `role` ENUM (`user`, `moderator`, `admin`) to `User` model, default `user`
- [ ] Create a `requireRole(role)` middleware factory
- [ ] Protect admin-only routes (user management, analytics aggregates) with `requireRole('admin')`
- [ ] Build an admin panel listing all users with ability to promote/suspend
- [ ] Log all role changes to an audit log table

---

### 34. `feature/session-management`
**Advanced session controls.**
- [ ] Migrate sessions from in-memory to `express-session` with `connect-redis` store
- [ ] Record each session: `id`, `userId`, `ipAddress`, `userAgent`, `createdAt`, `lastActivityAt`
- [ ] Add a "Devices & Sessions" page listing active sessions with IP and browser info
- [ ] Allow users to revoke any individual session remotely
- [ ] Add "sign out all other devices" button

---

### 35. `feature/user-profile-extended`
**Richer user profiles.**
- [ ] Add `bio` (TEXT), `website` (URL), `location` (STRING), `pronouns` to `User` model
- [ ] Add `email` (UNIQUE, validated) field with confirmation flow
- [ ] Build an extended profile edit form with validation for each new field
- [ ] Add a public profile page at `/u/:username` showing public files and links
- [ ] Validate `website` URL format on the model level

---

### 36. `feature/avatar-upload`
**Profile picture upload and management.**
- [ ] Add `avatarUrl` column to `User` model
- [ ] Add `POST /user/avatar` endpoint accepting an image, resizing to 256×256 WebP with `sharp`
- [ ] Store avatars in a dedicated S3 bucket prefix or local `uploads/avatars/` directory
- [ ] Show the avatar in the navbar, account page, and public profile
- [ ] Add avatar removal endpoint that reverts to a generated initials avatar

---

### 37. `feature/user-preferences`
**Per-user application settings.**
- [ ] Create a `UserPreferences` model: `userId`, `theme` (light/dark/system), `defaultLinkExpiry`, `emailNotifications`, `timezone`
- [ ] Add `GET /user/preferences` and `PUT /user/preferences` endpoints
- [ ] Apply `theme` preference on page load (avoid flash with a `<script>` in `<head>`)
- [ ] Use `timezone` for displaying all dates in the user's local timezone
- [ ] Add a Preferences tab under account settings

---

### 38. `feature/account-deletion`
**GDPR-compliant account and data deletion.**
- [ ] Add `DELETE /user` endpoint protected by password re-confirmation
- [ ] Soft-delete the user and anonymize PII (name, email → `[deleted]`)
- [ ] Hard-delete all associated files and links after a 30-day grace period (scheduled job)
- [ ] Send a confirmation email with a cancellation link (cancel within 30 days)
- [ ] Build a deletion confirmation modal showing what will be lost

---

### 39. `feature/notifications`
**In-app notification system.**
- [ ] Create a `Notification` model: `id`, `userId`, `type`, `message`, `readAt`, `createdAt`
- [ ] Add `GET /notifications` (unread count + list) and `PUT /notifications/:id/read` endpoints
- [ ] Create notification triggers: file shared with you, link near expiry, export ready
- [ ] Show a notification bell in the navbar with unread badge
- [ ] Add real-time delivery via Server-Sent Events (SSE) on `GET /notifications/stream`

---

### 40. `feature/rest-api-v2`
**Versioned, documented REST API.**
- [ ] Namespace all existing routes under `/api/v1/`
- [ ] Add `/api/v2/` with improved response envelopes: `{ data, meta, errors }`
- [ ] Generate OpenAPI 3.1 spec with `swagger-jsdoc`
- [ ] Serve interactive docs at `/api/docs` with `swagger-ui-express`
- [ ] Add `Accept-Version` header support for content negotiation
- [ ] Write an API changelog documenting v1 → v2 breaking changes

---

### 41. `feature/graphql-api`
**GraphQL endpoint alongside the REST API.**
- [ ] Install `apollo-server-express` and `graphql`
- [ ] Define schema types for `User`, `Link`, `File`, `Click`, `Notification`
- [ ] Implement resolvers for all existing read endpoints
- [ ] Add mutations for link creation, file upload, profile update
- [ ] Protect resolvers with a `@auth` directive
- [ ] Enable GraphQL Playground at `/graphql` in development only

---

### 42. `feature/api-keys`
**API key authentication for programmatic access.**
- [ ] Create an `ApiKey` model: `id`, `userId`, `keyHash`, `label`, `scopes` (JSON), `lastUsedAt`, `expiresAt`
- [ ] Add `POST /api-keys` to generate and return a key (shown once)
- [ ] Add `DELETE /api-keys/:id` to revoke a key
- [ ] Implement an `apiKeyAuth` middleware that checks `Authorization: Bearer <key>` header
- [ ] List active API keys (label, scopes, last used) in the account security settings page

---

### 43. `feature/rate-limiting`
**Protect all endpoints from abuse.**
- [ ] Install `express-rate-limit` with `rate-limit-redis` store
- [ ] Apply strict limits on auth endpoints: 10 requests/15 min per IP on `/login`, `/signup`
- [ ] Apply per-user limits on file upload: 100 uploads/hour
- [ ] Apply global API rate limit: 1000 requests/hour per API key
- [ ] Return `Retry-After` header on 429 responses
- [ ] Add rate limit status headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`) to all responses

---

### 44. `feature/webhooks`
**Outbound webhooks for link and file events.**
- [ ] Create a `Webhook` model: `id`, `userId`, `url`, `secret`, `events` (JSON array), `active`
- [ ] Add CRUD endpoints at `/webhooks`
- [ ] Implement a webhook dispatcher that signs payloads with HMAC-SHA256 using the secret
- [ ] Retry failed webhooks with exponential backoff (up to 5 attempts)
- [ ] Build a webhook log UI showing recent deliveries and their response status

---

### 45. `feature/caching-layer`
**Redis caching for hot data.**
- [ ] Add `ioredis` and configure a Redis client from env vars
- [ ] Cache `GET /links/:slug` redirect targets (TTL 5 min, invalidate on link update)
- [ ] Cache user session data to reduce DB reads on every authenticated request
- [ ] Cache OG metadata for link previews (TTL 24h)
- [ ] Add a cache-status header (`X-Cache: HIT|MISS`) in development mode
- [ ] Create a `CacheService` abstraction so the backing store can be swapped

---

### 46. `feature/background-jobs`
**Async job processing with BullMQ.**
- [ ] Install `bullmq` and configure a job queue backed by Redis
- [ ] Move file upload processing (compression, EXIF extraction) to a background job
- [ ] Move email sending to an async job with retry on failure
- [ ] Move analytics aggregation (daily rollups) to a scheduled cron job
- [ ] Add a worker health-check endpoint that reports queue depth and failed job count
- [ ] Build a simple admin queue monitor page using Bull Board

---

### 47. `feature/email-service`
**Transactional email notifications.**
- [ ] Install `nodemailer` and configure SMTP via env vars (supports SendGrid, Mailgun, SES)
- [ ] Create email templates (HTML + text) for: welcome, password reset, file shared, link expiry warning
- [ ] Add `POST /email/test` (admin only) for testing the email connection
- [ ] Queue all email sends through BullMQ for reliability
- [ ] Implement unsubscribe tokens that disable email notifications without requiring login

---

### 48. `feature/audit-logging`
**Comprehensive audit trail for user and admin actions.**
- [ ] Create an `AuditLog` model: `id`, `userId`, `action`, `resourceType`, `resourceId`, `metadata` (JSON), `ipAddress`, `createdAt`
- [ ] Log all write operations: login, signup, file upload/delete, link create/delete, role change
- [ ] Add `GET /admin/audit-logs` with filtering by user, action type, and date range
- [ ] Export audit logs as CSV
- [ ] Purge logs older than 1 year with a scheduled job (configurable retention)

---

### 49. `feature/dark-mode`
**Full dark / light / system theme support.**
- [ ] Add `data-theme` attribute switching on `<html>` element
- [ ] Convert all hardcoded Tailwind color classes to semantic CSS variables (`--bg-primary`, etc.)
- [ ] Respect `prefers-color-scheme` media query on first visit
- [ ] Persist user theme preference in `localStorage` and sync with user preferences API
- [ ] Add a theme toggle button in the navbar with smooth transition animation
- [ ] Test all components in both themes for contrast ratio (WCAG AA)

---

### 50. `feature/dashboard-redesign`
**Modernise the main dashboard layout.**
- [ ] Design a sidebar navigation with icons and collapsible labels
- [ ] Add a top stats bar: total files, total links, total clicks today, storage used
- [ ] Build a "Recent Activity" feed showing latest uploads and link hits
- [ ] Add a quick-action floating button (upload file / shorten URL)
- [ ] Make the layout a CSS Grid with adjustable panel sizes

---

### 51. `feature/mobile-responsive`
**Mobile-first responsive redesign.**
- [ ] Audit all pages with Chrome DevTools mobile simulation at 375px and 768px
- [ ] Replace fixed-width containers with responsive Tailwind breakpoints
- [ ] Convert the file grid from fixed columns to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- [ ] Add a hamburger menu for the sidebar on mobile
- [ ] Fix touch targets: all interactive elements ≥ 44×44px
- [ ] Test drag-and-drop upload on iOS Safari and Android Chrome

---

### 52. `feature/drag-drop-improvements`
**Enhance drag-and-drop across the app.**
- [ ] Support dropping files anywhere on the page (not just the upload zone)
- [ ] Support dragging files between folders in the file tree
- [ ] Show a full-page drop overlay when dragging files from the OS
- [ ] Allow reordering files within a folder via drag-and-drop
- [ ] Add keyboard-accessible equivalents for all drag actions

---

### 53. `feature/onboarding-flow`
**Guide new users through the app's core features.**
- [ ] Build a 4-step welcome wizard shown on first login: profile setup → upload first file → create first link → enable 2FA
- [ ] Track onboarding step completion in `UserPreferences`
- [ ] Add tooltip-based product tours using `driver.js`
- [ ] Send a "getting started" email 1 hour after signup
- [ ] Add a "skip tour" option that can be re-triggered from account settings

---

### 54. `feature/keyboard-shortcuts`
**Power-user keyboard navigation.**
- [ ] Add a global shortcut reference modal toggled by `?`
- [ ] `⌘/Ctrl + U` opens the upload dialog
- [ ] `⌘/Ctrl + K` opens the command palette / search
- [ ] `⌘/Ctrl + N` opens the new link dialog
- [ ] Arrow keys navigate between items in the file grid
- [ ] `Del` soft-deletes the focused file after confirmation

---

### 55. `feature/accessibility`
**WCAG 2.1 AA compliance.**
- [ ] Run `axe-core` audit on all pages and document violations
- [ ] Add `aria-label` and `role` attributes to all icon-only buttons
- [ ] Ensure all form inputs have associated `<label>` elements
- [ ] Fix focus trap in all modals (keyboard users must not escape modal focus)
- [ ] Ensure skip-to-content link is the first focusable element on every page
- [ ] Achieve 4.5:1 contrast ratio for all text/background combinations

---

### 56. `feature/search-ui`
**Global search command palette.**
- [ ] Build a `CommandPalette` component rendered in a portal at the document root
- [ ] Implement fuzzy search across files, links, folders, and settings pages
- [ ] Show keyboard shortcut hints next to each result
- [ ] Support action commands (e.g., "Upload file", "New link", "Settings")
- [ ] Persist recent searches in `localStorage`

---

### 57. `feature/pagination`
**Scalable list views with pagination or infinite scroll.**
- [ ] Add cursor-based pagination to `GET /files` (`?cursor=&limit=`)
- [ ] Add cursor-based pagination to `GET /links`
- [ ] Implement an `IntersectionObserver`-based infinite scroll on the file grid
- [ ] Add a "jump to page" input for power users who prefer page-based nav
- [ ] Show total item count and current range in the list header

---

### 58. `feature/csrf-protection`
**CSRF token protection for all state-changing requests.**
- [ ] Install `csurf` middleware
- [ ] Inject the CSRF token into all HTML pages as a `<meta>` tag
- [ ] Set the token in a cookie readable by the React frontend
- [ ] Add the token as a default header in all `fetch` calls via a central API client
- [ ] Test that requests without a valid token receive `403 Forbidden`

---

### 59. `feature/content-security-policy`
**HTTP security headers via Helmet.js.**
- [ ] Install `helmet` and enable all default protections
- [ ] Configure a strict `Content-Security-Policy` that allows only app origins
- [ ] Add `Permissions-Policy` header disabling microphone, camera, geolocation
- [ ] Add `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] Run Mozilla Observatory scan and achieve A+ grade

---

### 60. `feature/virus-scanning`
**Scan uploaded files for malware.**
- [ ] Integrate ClamAV via `clamscan` npm package
- [ ] Scan files in a background job immediately after upload
- [ ] Quarantine flagged files (set a `quarantined` flag, remove from public access)
- [ ] Notify the uploader by email if a file is quarantined
- [ ] Add an admin quarantine review page

---

### 61. `feature/input-sanitization`
**Prevent XSS and injection attacks.**
- [ ] Sanitize all user-supplied string inputs with `DOMPurify` on the frontend
- [ ] Sanitize all text stored to DB with `xss` package on the backend
- [ ] Use parameterized Sequelize queries everywhere (audit for raw SQL strings)
- [ ] Validate and strip unexpected fields from request bodies with `joi` or `zod`
- [ ] Add an integration test that posts a `<script>alert(1)</script>` payload and confirms it's neutralized

---

### 62. `feature/database-migrations`
**Formal migration system for schema changes.**
- [ ] Install `sequelize-cli` and initialize migrations directory
- [ ] Write a migration for the current schema (users + files tables)
- [ ] Write seeds for a demo dataset (3 users, 10 files, 10 links)
- [ ] Document migration commands in `README.md`
- [ ] Add a pre-start check that fails if pending migrations exist

---

### 63. `feature/query-optimization`
**Database performance improvements.**
- [ ] Add indexes on `File.userId`, `File.uuid`, `File.deletedAt`
- [ ] Add indexes on `Link.slug`, `Link.userId`, `Link.expiresAt`
- [ ] Add indexes on `Click.linkId`, `Click.timestamp`
- [ ] Enable Sequelize query logging in development and log slow queries (>100ms)
- [ ] Replace `findAll` + in-memory filter patterns with proper `WHERE` clauses

---

### 64. `feature/connection-pooling`
**Tune the Sequelize MySQL connection pool.**
- [ ] Set explicit `pool.max`, `pool.min`, `pool.acquire`, `pool.idle` from env vars
- [ ] Add `pool.evict` to clean up idle connections
- [ ] Log pool status (active, idle, waiting) via a `/health/db` endpoint
- [ ] Test pool behavior under 100 concurrent requests using `autocannon`
- [ ] Add graceful shutdown that drains the pool on `SIGTERM`

---

### 65. `feature/soft-delete-improvements`
**Harden and automate the soft-delete lifecycle.**
- [ ] Add a scheduled job (daily) that hard-deletes records soft-deleted > 30 days ago
- [ ] Add a `GET /trash` page in the UI listing all soft-deleted files and links
- [ ] Display days remaining before permanent deletion in the trash view
- [ ] Add an "Empty trash" button that immediately hard-deletes all trashed items
- [ ] Emit a `resource.trashed` webhook event when an item is soft-deleted

---

### 66. `feature/ci-cd-pipeline`
**GitHub Actions for automated testing and deployment.**
- [ ] Create `.github/workflows/ci.yml` that runs on every push and PR
- [ ] CI steps: install → lint (`eslint`) → type-check (`tsc --noEmit`) → unit tests → integration tests
- [ ] Add a `deploy.yml` workflow that pushes Docker image to GHCR on merge to `main`
- [ ] Add branch protection rules requiring CI green before merge
- [ ] Add CodeQL security scanning workflow

---

### 67. `feature/docker-compose`
**Local development environment via Docker Compose.**
- [ ] Create `docker-compose.yml` with services: `app`, `mysql`, `redis`, `mailhog` (SMTP sink)
- [ ] Create `docker-compose.override.yml` for dev-only volume mounts and hot reload
- [ ] Add a `healthcheck` for the MySQL container that the app service depends on
- [ ] Document `docker compose up` workflow in `README.md`
- [ ] Add a `Makefile` with targets: `dev`, `test`, `build`, `migrate`, `seed`

---

### 68. `feature/health-checks`
**Operational readiness and liveness endpoints.**
- [ ] Add `GET /health/live` returning `200 OK` if the process is running
- [ ] Add `GET /health/ready` returning `200` only if DB and Redis connections are healthy
- [ ] Add `GET /health/version` returning `{ version, commit, buildDate }`
- [ ] Integrate health checks into the Docker `HEALTHCHECK` instruction
- [ ] Expose Prometheus-compatible metrics at `GET /metrics` (using `prom-client`)

---

### 69. `feature/unit-tests`
**Unit test suite for backend logic.**
- [ ] Set up `jest` + `ts-jest` and configure `jest.config.ts`
- [ ] Unit test User model: validation rules (regex, length), password hashing hook
- [ ] Unit test File model: UUID generation, soft delete, visibility toggle
- [ ] Unit test slug generation: uniqueness, reserved-word rejection, base62 charset
- [ ] Unit test analytics aggregation helpers
- [ ] Achieve ≥ 80% branch coverage on all model and utility files

---

### 70. `feature/e2e-tests`
**End-to-end test suite using Playwright.**
- [ ] Set up `@playwright/test` and configure a test project targeting localhost
- [ ] E2E test: complete signup flow → verify user is logged in → land on dashboard
- [ ] E2E test: upload a file → verify it appears in the file list → download and verify contents
- [ ] E2E test: create a short link → follow the short link → verify redirect destination
- [ ] E2E test: toggle file visibility → verify public file is accessible without auth, private is not
- [ ] Run E2E tests in CI against a Docker Compose environment

---

## Branch Count Summary

| Category | Branches | Features |
|---|---|---|
| Bug Fixes | 5 | 25 |
| URL Shortening Core | 8 | 48 |
| Click & Analytics | 6 | 33 |
| File Management | 10 | 57 |
| Auth & Users | 9 | 48 |
| API & Backend | 9 | 48 |
| Frontend UI/UX | 9 | 49 |
| Security | 4 | 20 |
| Database & Performance | 5 | 25 |
| DevOps & Infrastructure | 5 | 25 |
| **Totals** | **70** | **378** |

---

## Suggested Branch Ordering (by dependency)

```
Phase 1 — Foundation (do first)
  fix/package-json
  fix/env-validation
  feature/database-migrations
  feature/ci-cd-pipeline
  feature/docker-compose

Phase 2 — Bug Fixes
  fix/profile-update-save
  fix/signup-null-guard
  fix/jwt-private-file-access

Phase 3 — Core Feature (URL Shortening)
  feature/url-shortener-core
  feature/custom-slugs
  feature/link-expiry
  feature/url-redirect-types

Phase 4 — Security Hardening
  feature/rate-limiting
  feature/csrf-protection
  feature/content-security-policy
  feature/input-sanitization

Phase 5 — Auth Expansion
  feature/password-reset
  feature/oauth-providers
  feature/two-factor-auth
  feature/role-based-access
  feature/api-keys

Phase 6 — Storage & Files
  feature/cloud-storage         ← prerequisite for large-scale file features
  feature/file-organization
  feature/file-versioning
  feature/file-sharing

Phase 7 — Analytics
  feature/click-analytics       ← prerequisite for all analytics branches
  feature/geo-analytics
  feature/device-analytics
  feature/referrer-analytics
  feature/analytics-dashboard
  feature/export-analytics

Phase 8 — Performance & Ops
  feature/caching-layer
  feature/connection-pooling
  feature/background-jobs
  feature/health-checks
  feature/query-optimization

Phase 9 — UX Polish
  feature/dark-mode
  feature/dashboard-redesign
  feature/mobile-responsive
  feature/accessibility
  feature/keyboard-shortcuts
  feature/onboarding-flow

Phase 10 — Testing
  feature/unit-tests
  feature/e2e-tests
```

---

*Generated by code review on 2026-05-25. Update this file as branches land and features are checked off.*
