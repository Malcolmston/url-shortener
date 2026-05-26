# Contributing to Snip

Thanks for helping make Snip better! This guide covers everything you need to go from zero to a working local environment and submit a pull request.

---

## Table of Contents

1. [Quick start](#quick-start)
2. [Project structure](#project-structure)
3. [Branch naming](#branch-naming)
4. [Commit conventions](#commit-conventions)
5. [Pull request checklist](#pull-request-checklist)
6. [Coding standards](#coding-standards)
7. [Environment variables](#environment-variables)

---

## Quick start

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 20 LTS |
| Docker + Docker Compose | latest |
| Git | ≥ 2.40 |

### 1 — Clone and bootstrap

```bash
git clone https://github.com/Malcolmston/url-shortener.git snip
cd snip
make install          # npm ci for root + short/
```

### 2 — Start the database

```bash
docker compose up -d mysql redis
# Wait for the health-check to pass (~10s), then:
make migrate          # sequelize sync
make seed             # optional demo data
```

### 3 — Run the app

```bash
# Terminal 1 — Express backend (port 3000)
make dev

# Terminal 2 — Vite dev server (port 5173, proxies /api → :3000)
cd short && npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Project structure

```
snip/
├── app.js                  ← Express entry point / Vercel serverless handler
├── vercel.json             ← Vercel routing config
├── database/
│   ├── model.ts            ← Sequelize instance
│   ├── associations.ts     ← FK wiring + barrel export
│   ├── User.ts
│   ├── File.ts
│   ├── Link.ts
│   ├── Click.ts
│   ├── ApiKey.ts
│   ├── PasswordResetToken.ts
│   └── UserSession.ts
├── utils/
│   ├── apiKey.js           ← generateApiKey / hashApiKey
│   ├── slugify.js          ← generateSlug / validateSlug / validateUrl
│   └── parseUA.js          ← UA parser, referrer normaliser, IP hasher
├── short/                  ← Vite + React 18 frontend
│   ├── src/
│   │   ├── App.jsx         ← Router + lazy routes
│   │   ├── components/
│   │   │   ├── layout/     ← AppShell, Sidebar, TopBar
│   │   │   └── ui/         ← Design system primitives
│   │   ├── hooks/
│   │   └── pages/
│   └── tailwind.config.js
├── .github/workflows/
│   ├── ci.yml              ← Lint → build → test → Docker
│   └── deploy.yml          ← Vercel production deploy on main push
└── docker-compose.yml
```

---

## Branch naming

Use the pattern `<type>/<short-description>`:

| Prefix | When to use |
|--------|------------|
| `feature/` | New feature or page |
| `fix/` | Bug fix |
| `refactor/` | Code quality, no behaviour change |
| `docs/` | Documentation only |
| `test/` | Tests only |
| `setup/` | Tooling, CI, infra |

**Examples:**
```
feature/qr-code-generation
fix/signup-null-guard
refactor/link-model-indexes
docs/api-reference
```

---

## Commit conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <imperative summary, ≤72 chars>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`, `ci`

**Examples:**
```
feat(links): add password-protected short URLs
fix(auth): null guard on soft-deleted user in signup
docs(api): add curl examples to README
test(analytics): add Click model unit tests
```

---

## Pull request checklist

- [ ] Branch is up-to-date with `main` (`git rebase origin/main`)
- [ ] All CI checks pass (lint, type-check, build, tests)
- [ ] New features have at least one happy-path test
- [ ] No `console.log` left in production code paths
- [ ] Sensitive data (keys, tokens) is not committed
- [ ] PR description explains *what* changed and *why*
- [ ] Related issues are linked (`Closes #123`)

---

## Coding standards

### Backend (Node.js / TypeScript)

- New database models must go in `database/<ModelName>.ts` and be exported from `database/associations.ts`
- Use `paranoid: true` on all user-owned data models (soft delete)
- Never store raw API keys or passwords — always hash before persisting
- All new routes must use the `userMil` middleware for authenticated endpoints
- Keep route handlers thin — extract business logic to helper functions in `utils/`

### Frontend (React / Tailwind)

- Use `@fortawesome/free-solid-svg-icons` and `@fortawesome/free-regular-svg-icons` (not Pro)
- Primary colour: `violet-600` — avoid `blue-*` in new UI
- Dark mode: use `dark:` Tailwind variants — test both themes
- Wrap authenticated pages in `<AppShell>` (handles auth redirect + layout)
- Skeletons instead of spinners for data loading states
- Keep page components in `short/src/pages/`, reusable UI in `short/src/components/ui/`

---

## Environment variables

Copy `.env.example` to `.env` and fill in the values:

| Variable | Required | Description |
|----------|----------|-------------|
| `SESSION` | ✅ | Express session secret (≥32 chars) |
| `DB_HOST` | ✅ | MySQL host (`127.0.0.1` for local Docker) |
| `DB_NAME` | ✅ | MySQL database name |
| `DB_USER` | ✅ | MySQL user |
| `DB_PASSWORD` | ✅ | MySQL password |
| `PORT` | ❌ | HTTP port (default: `3000`) |
| `SALT` | ❌ | bcrypt salt rounds (default: `10`) |
| `REDIS_URL` | ❌ | Redis connection string (future use) |

> **Never commit `.env`** — it is already in `.gitignore`.
