# Web Boilerplate (Next.js + shadcn/ui + Supabase + TDD)

Clean architecture boilerplate with:
- Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui
- Supabase client helpers for browser and server
- TDD setup with Jest + React Testing Library + MSW
- E2E with Playwright (Chromium, Firefox, WebKit, plus mobile profiles)
- Cross-browser compatibility via Browserslist and Playwright matrix

## Requirements
- Node.js 20.17+ recommended (npm 11 requires Node 20+)
- npm (or your preferred package manager)
- Supabase project (URL and anon key)

## Getting Started
1) Install dependencies
```bash
npm install
```

2) Configure environment variables
- Create a `.env.local` in the project root with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3) Run the dev server
```bash
npm run dev
```
Open http://localhost:3000

## Testing (TDD)
- Unit/Component tests (Jest + RTL):
```bash
npm test
```
- Watch mode:
```bash
npm run test:watch
```
- CI mode:
```bash
npm run test:ci
```

MSW is pre-configured in `jest.setup.ts` with example handler `src/test/msw/handlers.ts`.

## E2E Tests (Playwright)
1) Install browsers (one-time):
```bash
npx playwright install
```
2) Run tests:
```bash
npm run e2e
```
Headed/UI modes are available via `e2e:headed` and `e2e:ui`.

## Clean Architecture Layout
- `src/domain/` — entities and repository interfaces
- `src/application/` — use-cases (business logic)
- `src/infrastructure/` — concrete implementations (e.g., Supabase repositories)
- `src/lib/` — framework-agnostic helpers (e.g., Supabase clients)
- `src/components/` — UI components (shadcn/ui)
- `src/app/` — Next.js routes

Example feature:
- `src/domain/entities/user.ts`
- `src/domain/repositories/user-repo.ts`
- `src/application/use-cases/get-current-user.ts`
- `src/infrastructure/repositories/supabase-user-repo.ts`

UI example:
- `src/components/example/HelloCard.tsx` with test `HelloCard.test.tsx`

API example:
- `src/app/api/health/route.ts` returns `{ status: 'ok' }`

## Supabase Setup
- Browser client: `src/lib/supabase/client.ts`
- Server client (RSC/Route Handlers): `src/lib/supabase/server.ts` (uses `@supabase/ssr` and Next 15 `cookies()`)

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.

## Scripts
See `package.json` scripts:
- `dev`, `build`, `start`
- `lint`, `lint:fix`, `typecheck`
- `test`, `test:watch`, `test:ci`
- `e2e`, `e2e:headed`, `e2e:ui`

## Package Versions
Runtime dependencies:
- next: 15.5.3
- react: 19.1.0
- react-dom: 19.1.0
- @supabase/supabase-js: ^2.57.4
- @supabase/ssr: latest installed
- zod: ^4.1.11
- class-variance-authority: ^0.7.1
- tailwind-merge: ^3.3.1
- lucide-react: ^0.544.0
- radix-ui packages and others: see `package.json`

Dev dependencies:
- typescript: ^5
- eslint: ^9 with `eslint-config-next` 15.5.3
- tailwindcss: ^4 and @tailwindcss/postcss: ^4
- jest: ^30 with `jest-environment-jsdom`
- @testing-library/*, msw, @mswjs/data
- @playwright/test

Refer to `package.json` for the authoritative list and semver ranges.

## Cross-browser Support
- `browserslist` in `package.json` targets modern browsers and maintained Node versions.
- Playwright runs tests across Chromium, Firefox, WebKit, and mobile profiles.

## Notes
- If you saw an npm/node warning, ensure Node 20.17+ to match npm 11 engine requirements.

## Engineering Rules
Please read and follow the engineering standards in `docs/CODE_RULES.md`.
