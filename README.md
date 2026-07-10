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
cp .env.example .env   # fill in DATABASE_URL, JWT secrets, Stripe keys, admin credentials
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed     # creates admin user + default categories
npm run dev
```

## Prisma 7 note
This project uses Prisma 7, which requires a driver adapter instead of a bare `datasource.url`
in `schema.prisma`. The connection string lives in two places:
- `prisma.config.ts` (root) — used by the Prisma CLI for `migrate`/`studio`/`generate`/`db seed`
- `src/shared/prisma.ts` — used at runtime, via `@prisma/adapter-pg` + `pg`

Both read `DATABASE_URL` from `.env`, so you only need to set it once.

## Admin Access
Seeding creates one admin user from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`
(defaults to `admin@gearup.com` / `admin123` if unset). Log in via `POST /api/auth/login`
like any other user — the seeded account already has `role: ADMIN`.

## Error Response Format
Every error (validation, not-found, forbidden, unhandled) returns the same shape:
```json
{
  "success": false,
  "message": "Human readable summary",
  "errorDetails": [{ "path": "field_or_empty", "message": "Detail" }]
}
```

## Auth
Send `Authorization: Bearer <token>` header. Roles: CUSTOMER, PROVIDER, ADMIN.

## Rental Order Status Flow
```
PLACED -> CONFIRMED (provider) -> PAID (payment confirm) -> PICKED_UP (provider) -> RETURNED (provider)
PLACED -> CANCELLED (customer, only while PLACED)
```

## Payment Integration (Stripe)
- `POST /api/payments/create` — customer creates a real Stripe `PaymentIntent` for a `CONFIRMED`
  rental order and gets back a `clientSecret`. A local `Payment` row is created with `status: PENDING`.
- `POST /api/payments/webhook` — Stripe webhook endpoint. Verifies the `Stripe-Signature` header
  against `STRIPE_WEBHOOK_SECRET` and, on `payment_intent.succeeded`, marks the payment
  `COMPLETED` and the rental order `PAID`. On `payment_intent.payment_failed`, marks it `FAILED`.
  This route reads the **raw** request body (mounted before `express.json()` in `app.ts`) because
  Stripe's signature check needs the unparsed bytes.
- `POST /api/payments/confirm` — manual fallback (no signature check), useful for SSLCommerz's
  callback style or for testing without running the Stripe CLI locally.
- `GET /api/payments` / `GET /api/payments/:id` — history and status tracking.

### Testing the Stripe webhook locally
```bash
stripe login
stripe listen --forward-to localhost:5000/api/payments/webhook
# copy the printed whsec_... into STRIPE_WEBHOOK_SECRET in .env, then:
stripe trigger payment_intent.succeeded
```

## Notes
- Reviews are gated: a customer can only review a gear item after a RETURNED rental containing that item.
