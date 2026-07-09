# GearUp Backend

Rent Sports & Outdoor Gear Instantly — Backend API

## Tech Stack
- Node.js + Express + TypeScript
- PostgreSQL + Prisma
- JWT auth
- Zod validation

## Module Pattern
Every module (`auth`, `category`, `gear`, `rental`, `payment`, `review`, `provider`, `admin`) follows:
```
module.interface.ts   -> types
module.constant.ts    -> searchable/filterable fields (where relevant)
module.validation.ts  -> zod schemas
module.service.ts     -> DB logic, functions suffixed with Db (e.g. getAllGearDb)
module.controller.ts  -> catchAsync + sendResponse wrapper, calls service
module.route.ts        -> express router, wires validateRequest + auth + controller
```

Controllers never talk to Prisma directly — only services do. Cross-module orchestration
(e.g. provider updating gear it doesn't own) lives in the service layer.

## Setup
```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT secrets, etc.
npx prisma migrate dev --name init
npx prisma generate
npm run dev
```

## Prisma 7 note
This project uses Prisma 7, which requires a driver adapter instead of a bare `datasource.url`
in `schema.prisma`. The connection string lives in two places:
- `prisma.config.ts` (root) — used by the Prisma CLI for `migrate`/`studio`/`generate`
- `src/shared/prisma.ts` — used at runtime, via `@prisma/adapter-pg` + `pg`

Both read `DATABASE_URL` from `.env`, so you only need to set it once.

## Auth
Send `Authorization: Bearer <token>` header. Roles: CUSTOMER, PROVIDER, ADMIN.

## Rental Order Status Flow
```
PLACED -> CONFIRMED (provider) -> PAID (payment confirm) -> PICKED_UP (provider) -> RETURNED (provider)
PLACED -> CANCELLED (customer, only while PLACED)
```

## Notes
- `POST /api/payments/create` creates a PENDING payment record (integrate real Stripe/SSLCommerz call in `payment.service.ts`).
- `POST /api/payments/confirm` is the webhook/callback endpoint — no auth guard, matches Stripe/SSLCommerz callback pattern. Add signature verification before production use.
- Reviews are gated: a customer can only review a gear item after a RETURNED rental containing that item.
# GearUp-server
