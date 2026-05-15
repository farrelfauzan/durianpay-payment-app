# Durianpay Payment Dashboard

An internal payment dashboard built with Go (backend) and React 19 + TanStack Start (frontend) in a pnpm monorepo.

## Prerequisites

- Go 1.23+
- Node.js 20+
- pnpm 10+
- A C compiler (for SQLite CGO bindings)
- Docker (optional)

## Getting Started

```bash
git clone https://github.com/farrelfauzan/durianpay-payment-app.git
cd durianpay-payment-app
make setup   # copies env, installs Go modules, runs pnpm install
make run     # starts backend (:8080) and frontend (:3000)
```

Or with Docker:

```bash
docker compose up --build
```

### Backend config

The setup creates `backend/.env` from the sample. Generate a proper JWT secret with `cd backend && make gen-secret`.

```env
HTTP_ADDR=:8080
OPENAPIYAML_LOCATION=../openapi.yaml
JWT_SECRET=your-very-secret
JWT_EXPIRED=24h
```

## Sample Data

The database seeds on first startup:

- `cs@test.com` / `password` (role: cs)
- `operation@test.com` / `password` (role: operation)
- 50 payment records (merchants: Tokopedia, Shopee, Gojek; statuses: completed/processing/failed)

Reset with: `cd backend && rm -f dashboard.db && make run`

## Commands

- `make run` — start everything
- `make test` — run all tests
- `make build` — production build
- `make openapi-gen` — regenerate code from OpenAPI spec
- `make docker-up` / `make docker-down` — Docker lifecycle

## API

Full spec in `openapi.yaml` ([Swagger Editor](https://editor.swagger.io) compatible).

- `POST /dashboard/v1/auth/login` — log in, get JWT
- `GET /dashboard/v1/auth/me` — current user info
- `POST /dashboard/v1/auth/logout` — log out
- `GET /dashboard/v1/payments` — list payments (supports `page`, `page_size`, `sort`, `status`, `search`)

All requests are validated against the OpenAPI spec at runtime.

## Architecture

The backend follows a 3-layer pattern per domain: **Handler → Usecase → Repository**. Each domain (`auth`, `payment`) is self-contained under `internal/module/`.

The frontend uses file-based routing (TanStack Router), shadcn/ui components, TanStack Query for data fetching, and a shared typed SDK (`packages/sdk/`).

### OpenAPI-first workflow

```
openapi.yaml
   ├── oapi-codegen → backend/internal/openapigen/
   └── orval        → packages/sdk/src/generated/
```

## RBAC

Client-side authorization via [CASL](https://casl.js.org/). The `operation` role can view analytics charts and export XLSX; the `cs` role has read-only dashboard access.

Permissions are defined in `frontend/src/lib/ability.ts` and enforced via the `useAbility()` hook.

The backend also has a `RequireRole` middleware for server-side route protection.

## Testing

**Backend:** Go standard `testing` package with hand-written fakes — handlers, usecases, repositories, and middleware all tested independently.

**Frontend:** Vitest + React Testing Library covering LoginForm, PaymentTable, and PaymentSummaryBar.

Run with `make test`.

## Export (XLSX)

The `operation` role can export the current payment page as `.xlsx` (client-side generation via SheetJS, dynamically imported).
