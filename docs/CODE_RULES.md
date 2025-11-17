# Engineering Code Rules and Best Practices

This repository defines a modern, test-first, clean-architecture web stack using Next.js, shadcn/ui, and Supabase. The following rules are mandatory unless explicitly approved otherwise in a design review.

## Architecture & Project Structure
- **Clean architecture:**
  - `src/domain/` for entities and repository interfaces (pure domain, no framework code).
  - `src/application/` for use-cases (business logic orchestrating repositories, pure and testable).
  - `src/infrastructure/` for implementations that touch frameworks/services (e.g., Supabase repositories).
  - `src/lib/` for cross-cutting helpers (e.g., Supabase clients, utilities).
  - `src/components/` for presentational/UI components (shadcn/ui based), keep them as pure as possible.
  - `src/app/` for Next.js routing and pages.
- **Separation of concerns:** UI must not contain business logic; call use-cases from controllers or client handlers.
- **Dependency direction:** UI → application → domain. Infrastructure is injected into application (interfaces in domain).

## Versioning & Dependencies
- **Latest stable versions:** Always target the latest stable versions of libraries unless a compatibility constraint is documented.
- **Lockfiles:** Commit the package-lock.json to ensure reproducible installs.
- **Upgrade policy:** Use small incremental upgrades. Prefer automated PRs (e.g., Renovate) to keep deps up-to-date.
- **Security:** Avoid unmaintained or deprecated packages. Address `npm audit` findings promptly.

## Testing (TDD)
- **Test-first:** Every feature or bugfix must include tests in the same PR.
- **Unit/Component tests:**
  - Use Jest + React Testing Library for components and logic.
  - Test behavior over implementation details.
  - Keep tests deterministic and isolated; mock infrastructure.
- **Integration/API tests:**
  - For API routes or server utilities, add integration tests where feasible.
- **E2E tests:**
  - Use Playwright for user flows and cross-browser verification.
  - Keep E2E minimal but meaningful; cover core happy paths and critical regressions.
- **Coverage:** Focus on meaningful coverage; do not chase 100% for its own sake. Cover critical paths, error cases, and boundaries.

## CI/CD & Quality Gates
- **Pre-merge checks:** Lint, typecheck, unit tests must pass before merge.
- **E2E:** Run Playwright in CI for critical flows (or at least nightly).
- **Branch protections:** Require PR reviews and passing checks on `main`.

## Code Style & Conventions
- **TypeScript strictness:** Do not use `any` unless justified; prefer precise types.
- **ESLint/Prettier:** Fix lints before committing. Use `npm run lint` and `lint:fix`.
- **Naming rules:**
  - Files: `kebab-case` for files, `PascalCase` for React components, `camelCase` for variables/functions.
  - Folders reflect architecture (see structure above).
- **React/Next.js:** Prefer server components by default; mark interactive components with `"use client"`.
- **Accessibility:**
  - Always provide accessible names (labels, aria- attributes).
  - Ensure components are keyboard-navigable.

## Next.js Specifics
- **App Router:** Use `src/app/` with Route Handlers for APIs.
- **RSC vs Client:** Default to RSC. Only add `"use client"` when you need hooks or browser APIs.
- **Env handling:** Only expose variables prefixed with `NEXT_PUBLIC_` to the client.
- **Performance:** Use Next Image, streaming where appropriate, and cache APIs as needed.

## UI & Styling (shadcn/ui + Tailwind)
- **Design system:** Use shadcn/ui primitives and Tailwind tokens; avoid custom ad-hoc styles when a component exists.
- **Responsiveness:** Ensure mobile-first and test with devtools responsive modes.
- **Theme:** Use `next-themes` if theming is necessary; keep colors/tokens consistent.

## Supabase
- **Clients:**
  - Browser client: `src/lib/supabase/client.ts` using public URL + anon key.
  - Server client: `src/lib/supabase/server.ts` using `@supabase/ssr` and Next cookies.
  - Admin client: `src/lib/supabase/admin.ts` using `SUPABASE_SERVICE_ROLE` (server-only usage).
- **Security:** Never expose `SUPABASE_SERVICE_ROLE` to the browser. Keep secrets in env variables and hosting platform secrets.
- **Auth:** Use magic link or OAuth providers as needed; ensure redirect URLs are configured in Supabase.
- **RLS:** Enable Row Level Security and write explicit policies for tables.

## Git Workflow
- **Branches:**
  - `main` is protected. Create feature branches: `feat/<short-name>`, `fix/<short-name>`, `chore/<short-name>`.
- **Commits:** Use Conventional Commits (e.g., `feat: add auth page`, `fix: handle null session`).
- **PRs:** Include a clear description, screenshots (for UI), and test plan. Link to issue/task.

## Documentation
- **README:** Keep versions, setup, and run instructions accurate.
- **Prompts log:** Maintain `prompts.md` with key decisions/conversations.
- **ADR (optional):** For significant architectural decisions, add short Architecture Decision Records under `/docs/adr/`.

## Security & Secrets
- **.env files:** `.env.local` for local dev. Do not commit secrets. `.env.example` must stay updated and committed.
- **Least privilege:** Use the minimum required roles/keys for tasks.
- **Dependency review:** Review new dependencies for license and security posture.

## Performance & Monitoring (Future)
- **Monitoring:** Add logging/metrics as needed (e.g., Vercel Analytics or OpenTelemetry).
- **Performance:** Avoid unnecessary client JS, prefer RSC, and use caching/revalidation.

## Review Checklist (PR Gate)
- [ ] Code conforms to clean architecture layering.
- [ ] Tests added/updated (unit and E2E where applicable).
- [ ] Lints and types pass.
- [ ] Docs updated (README, prompts, ADR if needed).
- [ ] Secrets and env variables handled properly (no leaks).

## Exceptions
- Deviations from these rules require a short written rationale in the PR and approval from a maintainer.
