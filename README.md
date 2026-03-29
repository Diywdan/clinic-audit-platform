# Жалоба как подарок

Production-ready MVP for structured clinic audits built with Next.js App Router, Prisma/PostgreSQL, NextAuth credentials auth, local photo storage, and Recharts. Current product name: `Жалоба как подарок`.

## Features

- Structured audit form grouped by `Block -> Section -> Criteria`
- Weighted normalized scoring with critical violation score cap
- Role-based access for `ADMIN`, `MANAGER`, and `EVALUATOR`
- Anti-abuse controls:
  - one evaluation per clinic per user per day
  - minimum 80% answered criteria
  - at least one critical block answered
  - minimum 3 uploaded photos
- `/dashboard` with ranking table, filters, trends, and block comparison charts
- `/admin` with clinic/user management and CSV export
- Local file upload MVP via `public/uploads`

## Setup

1. `npm install`
2. Copy `.env.example` to `.env`
3. `npm run prisma:generate`
4. `npx prisma migrate dev --name init`
5. `npm run prisma:seed`
6. `npm run dev`

## Seed Credentials

- Admin: `admin@audit.local` / `admin123`
- Manager: `manager@audit.local` / `manager123`
- Evaluator: `eva@audit.local` / `evaluator123`

## Scoring

- Block 1: min `-8`, max `7`, weight `0.15`
- Block 2: min `-16`, max `14`, weight `0.25`
- Block 3: min `-6`, max `9`, weight `0.20`
- Block 4: min `-20`, max `21`, weight `0.40`

```text
normalized = (score - min) / (max - min)
total_score = Σ(normalized_block * weight_block)
```

If there are 2 or more critical violations, the final score is capped at `40%`.

## Notes

- Local uploads are suitable for MVP. For production, swap `/api/upload` to S3-compatible storage.
- The current admin UI covers create/list flows and export. Update/delete routes can be added on the same schema.
