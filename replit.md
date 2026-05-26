# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Local Development (non-Replit)

1. Copy `.env.local.example` to `.env.local`.
2. Fill in `DATABASE_URL`, `CLERK_SECRET_KEY`, and `VITE_CLERK_PUBLISHABLE_KEY`.
3. Install dependencies: `pnpm install`
4. Run API: `pnpm --filter @workspace/api-server run dev`
5. Run frontend: `pnpm --filter @workspace/colour-explorer run dev`
6. Push DB schema: `pnpm --filter @workspace/db run push`

## Railway deployment

One Railway **web service** builds and runs the API plus the Palettrast UI on the same URL (so `/api` and sign-in work like Replit).

1. In the Railway project, add **PostgreSQL** and link `DATABASE_URL` to the web service.
2. Set these variables on the web service:
   - `DATABASE_URL` (from Postgres; use “Reference” if available)
   - `CLERK_SECRET_KEY`
   - `CLERK_PUBLISHABLE_KEY`
   - `VITE_CLERK_PUBLISHABLE_KEY` (same value as publishable key; required at build time)
   - `NODE_ENV=production`
3. Deploy from the `main` branch. Each deploy runs `railway:db-push` to apply the schema.
4. In the Clerk dashboard, add your Railway URL under allowed origins / redirect URLs.
