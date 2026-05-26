# Snip — Claude Code Guide

> Short links. Big control.  
> Next.js 15 App Router · TypeScript · Sequelize · MySQL · Tailwind CSS · iron-session

---

## Architecture

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | Next.js 15 (App Router) | `app/` directory, React Server Components |
| Language | TypeScript 5 (strict) | `tsconfig.json` → `strict: true`, `moduleResolution: 'bundler'` |
| Styling | Tailwind CSS v3 | Brand violet palette; dark mode via `['class', '[data-theme="dark"]']` |
| Database | MySQL 8 via Sequelize 6 | Singleton in `lib/db.ts` using `global.__sequelize` |
| Auth | iron-session v8 | Cookie-based; session helpers in `lib/session.ts` |
| File uploads | Web API `formData()` | No multer — `request.formData()` → `File.arrayBuffer()` |

---

## Key files

```
app/                     Next.js App Router pages and API routes
app/(auth)/              Auth route group — wrapped in AuthShell (no sidebar)
app/(dashboard)/         Dashboard route group — Server Component checks auth, wraps in AppShell
app/api/                 Route Handlers (replace Express routes)
app/[slug]/page.tsx      Slug redirect / password gate
components/ui/           Shared primitives (Button, Input, Card, Modal, Toast, …)
components/layout/       AppShell, Sidebar, TopBar, AuthShell
hooks/                   useToast, useTheme
lib/db.ts                Sequelize singleton (global.__sequelize)
lib/session.ts           iron-session helpers: getSession(), getUser(), requireUser()
lib/models.ts            Central model import that triggers associations
lib/response.ts          ok(), err(), unauthorized(), notFound(), serverError()
middleware.ts            Edge-compatible auth redirect guard
database/                Sequelize model definitions
```

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SESSION` | Yes | iron-session password — min 32 chars |
| `DB_HOST` | Yes | MySQL host |
| `DB_PORT` | No | MySQL port (default: 3306) |
| `DB_NAME` | Yes | Database name |
| `DB_USER` | Yes | Database user |
| `DB_PASSWORD` | Yes | Database password |
| `NEXT_PUBLIC_APP_URL` | No | Public URL for reset-password links |
| `NODE_ENV` | Auto | `development` / `production` / `test` |

Copy `.env.example` to `.env.local` for local development.

---

## Common patterns

### Auth check in a Server Component
```tsx
import { getUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const user = await getUser();
  if (!user) redirect('/login');
  // ...
}
```

### Auth check in a Route Handler
```typescript
import { requireUser } from '@/lib/session';
import { serverError } from '@/lib/response';

export async function GET() {
  try {
    const user = await requireUser(); // throws Response(401) if not logged in
    // ...
  } catch (e) {
    return serverError(e);
  }
}
```

### Async params in Next.js 15
```typescript
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // MUST await
}
```

### File upload (no multer)
```typescript
const formData = await request.formData();
const files = formData.getAll('files') as File[];
for (const f of files) {
  const buffer = Buffer.from(await f.arrayBuffer());
}
```

---

## Development

```bash
npm install
cp .env.example .env.local  # edit with your DB creds
npm run dev                  # http://localhost:3000
npm run typecheck            # TypeScript check
npm run lint                 # ESLint
npm test                     # Jest
```

---

## Health endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/health/live` | Liveness probe (edge, instant) |
| `GET /api/health/ready` | Readiness probe (tests DB connection) |
| `GET /api/health/version` | App version info |

---

## Branch history

| Branch | Contents |
|--------|----------|
| `nextjs/01-foundation` | Next.js 15 skeleton, tsconfig, Tailwind, globals |
| `nextjs/02-database` | lib/db.ts, lib/models.ts, lib/slugify.ts |
| `nextjs/03-auth-api` | Login/signup/logout/me API routes (merged into 10) |
| `nextjs/04-file-api` | File upload/download API, user profile API |
| `nextjs/05-link-api` | Link CRUD, slug check, redirect page |
| `nextjs/06-analytics-api` | Click analytics per-link and account-level |
| `nextjs/07-advanced-auth-api` | Password reset, API keys, session management |
| `nextjs/08-ui-primitives` | Button, Input, Card, Modal, Toast, Badge, etc. |
| `nextjs/09-layout` | AppShell, Sidebar, TopBar, AuthShell, route layouts |
| `nextjs/10-public-pages` | Landing page, login, signup, forgot/reset password |
| `nextjs/11-dashboard-pages` | Dashboard, links, files, upload, account pages |
| `nextjs/12-devops` | Standalone output, health routes, Makefile, CLAUDE.md |
