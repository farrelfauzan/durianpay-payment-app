# Durianpay Payment Dashboard

An internal payment dashboard built with Go on the backend and React 19 (TanStack Start) on the frontend. Everything lives in a single pnpm monorepo.

---

## What You'll Need

Before you start, make sure you have these installed:

- **Go 1.23+** — powers the backend
- **Node.js 20+** — powers the frontend
- **pnpm 10+** — manages the monorepo packages
- **A C compiler** (GCC or equivalent) — needed for SQLite's CGO bindings
- **Docker** (optional) — if you'd rather skip installing Go/Node locally

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/farrelfauzan/durianpay-payment-app.git
cd durianpay-payment-app
make setup
```

That single `make setup` command handles everything: it copies the env file, installs Go modules, and runs `pnpm install` for the frontend.

### 2. Configure the backend

The setup step creates `backend/.env` from the sample. Open it up and tweak if needed:

```env
HTTP_ADDR=:8080
OPENAPIYAML_LOCATION=../openapi.yaml
JWT_SECRET=your-very-secret
JWT_EXPIRED=24h
```

Want a proper secret? Run `cd backend && make gen-secret` to generate one.

### 3. Configure the frontend

For local dev, you don't need to do anything — it defaults to `http://localhost:8080`. The Docker setup handles this automatically with `http://backend:8080`.

### 4. Run it

```bash
make run
```

This starts both services:
- Backend at http://localhost:8080
- Frontend at http://localhost:3000

Or if you prefer Docker:

```bash
docker compose up --build
```

---

## Sample Data

The database seeds itself on first startup — no migrations to run. You'll get:

**Two test users:**
- `cs@test.com` / `password` (role: cs)
- `operation@test.com` / `password` (role: operation)

**50 payment records** with merchants like Tokopedia, Shopee, and Gojek, statuses of `completed`/`processing`/`failed`, and amounts between IDR 50k–500k.

Seeding is idempotent, so restarting won't create duplicates. If you want a clean slate:

```bash
cd backend && rm -f dashboard.db && make run
```

---

## Available Commands

Run `make help` to see everything, but here are the highlights:

| What you want to do | Command |
|---------------------|---------|
| Start everything | `make run` |
| Start just the backend | `make run-backend` |
| Start just the frontend | `make run-frontend` |
| Run all tests | `make test` |
| Build for production | `make build` |
| Regenerate OpenAPI code | `make openapi-gen` |
| Spin up Docker | `make docker-up` |
| Tear down Docker | `make docker-down` |

---

## API

The full API spec lives in [`openapi.yaml`](openapi.yaml). You can paste it into [Swagger Editor](https://editor.swagger.io) to explore interactively.

### Endpoints at a glance

| Method | Path | Auth? | What it does |
|--------|------|-------|--------------|
| POST | `/dashboard/v1/auth/login` | No | Log in, get a JWT |
| GET | `/dashboard/v1/auth/me` | Yes | Who am I? |
| POST | `/dashboard/v1/auth/logout` | Yes | Log out |
| GET | `/dashboard/v1/payments` | Yes | List payments |

### Filtering payments

The payments endpoint supports pagination, sorting, search, and status filtering:

```
GET /dashboard/v1/payments?page=1&page_size=20&sort=-created_at&status=completed&search=tokopedia
```

All requests are validated against the OpenAPI spec at runtime — send something malformed and you'll get a clear `400` error before any handler code runs.

---

## How It's Built

```
├── backend/          Go + Chi + SQLite
├── frontend/         TanStack Start + React 19 + Tailwind v4
├── packages/sdk/     Shared typed API client
└── openapi.yaml      The single source of truth
```

### Backend

Follows a clean 3-layer pattern per domain:

```
Handler (HTTP) → Usecase (business logic) → Repository (database)
```

Each domain (`auth`, `payment`) is self-contained under `internal/module/` with its own interfaces, making it easy to test each layer in isolation.

### Frontend

- **Routes** — file-based routing with SSR via TanStack Router
- **Components** — shadcn/ui built on Radix primitives
- **Hooks** — data fetching with TanStack Query, client state with Zustand
- **SDK** — shared typed Axios client in `packages/sdk/`

---

## RBAC (Role-Based Access Control)

Authorization is handled client-side using [CASL](https://casl.js.org/). The user's role (returned from `/auth/me`) determines what they can see and do.

### Roles & Capabilities

| Feature | `operation` | `cs` |
|---------|:-----------:|:----:|
| View dashboard | ✓ | ✓ |
| View payment table | ✓ | ✓ |
| View payment summary bar | ✓ | ✓ |
| View analytics chart | ✓ | ✗ |
| Export payments (XLSX) | ✓ | ✗ |

### How it works

1. On login, the dashboard layout reads the user's `role` and builds a CASL ability via `defineAbilityFor(role)` in `src/lib/ability.ts`.
2. The ability is provided through React context (`AbilityContext`).
3. Components use the `<Can>` component or `useAbility()` hook to conditionally render UI based on permissions.
4. Permission constants are centralized in `src/lib/acl.ts` for consistency.

### Adding new permissions

Edit `src/lib/ability.ts` — add new actions/subjects and update the role switch cases. Then use `<Can {...ACL.action.Subject}>` in your components.

---

## Export (XLSX)

The export button (visible only to `operation` role) downloads the current page of payments as an Excel `.xlsx` file.

- Uses the [SheetJS (xlsx)](https://sheetjs.com/) library, dynamically imported to keep the initial bundle small.
- Exports columns: ID, Merchant, Status, Amount, Created At.
- The file is generated client-side from the data already fetched — no additional API call needed.

---

## Testing

### Backend tests

Every layer has its own tests using Go's standard `testing` package — no mocking libraries, just hand-written fakes:

- **Handlers** — test HTTP serialization and status codes with fake usecases
- **Usecases** — test business logic with fake repositories
- **Repositories** — test real SQL queries against an in-memory SQLite database
- **Middleware** — tests JWT validation and token rejection

### Frontend tests

Vitest + React Testing Library cover the critical UI:

- **LoginForm** — form rendering, validation, API calls, error states
- **PaymentTable** — columns render, data displays, search works, loading skeletons show
- **PaymentSummaryBar** — loading state and correct counts

Run them all with `make test`.

---

## What's Different from the Boilerplate

This project extends [durianpay/fullstack-boilerplate](https://github.com/durianpay/fullstack-boilerplate) significantly:

**Backend:** Added the entire payment module (handler/usecase/repository), JWT middleware, `/me` and `/logout` endpoints, 50 seeded payment records, and comprehensive tests at every layer.

**Frontend:** Built from scratch — login page with form validation, payment dashboard with sortable/filterable/searchable data table, responsive sidebar, summary stats bar, and component tests.

**Infrastructure:** pnpm monorepo structure, shared SDK package, root Makefile for all commands, Docker Compose orchestration, and an OpenAPI-first workflow where one spec drives codegen, runtime validation, and frontend types.

---

## OpenAPI Integration

The project follows an **OpenAPI-first** workflow — the single `openapi.yaml` at the repo root is the source of truth:

### Backend
- [oapi-codegen](https://github.com/oapi-codegen/oapi-codegen) generates Go types, the `ServerInterface`, and Chi router bindings
- Runtime request validation via `oapi-codegen/nethttp-middleware` rejects malformed requests before handlers run

### Frontend
- [Orval](https://orval.dev) generates TypeScript types and React Query hooks into `packages/sdk/`
- The frontend imports hooks and types directly from `@durianpay/sdk`
- Run `pnpm --filter @durianpay/sdk openapi` (or `make openapi-gen`) to regenerate after spec changes

### Workflow
```
openapi.yaml
   ├── oapi-codegen → backend/internal/openapigen/ (Go types + router)
   └── orval        → packages/sdk/src/generated/  (TS types + React Query hooks)
```

---

## Server-Side Authorization

The backend includes a `RequireRole` middleware (`internal/middleware/auth.go`) that enforces role-based access at the HTTP layer. Currently both `cs` and `operation` roles can access the payments endpoint (per requirements), but the middleware is ready to restrict future endpoints:

```go
// Example usage for an admin-only endpoint:
r.With(middleware.RequireRole("operation")).Post("/export", exportHandler)
```

Unauthorized role access returns `403 Forbidden` with a structured JSON error.
