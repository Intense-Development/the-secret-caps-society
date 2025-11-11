## Session Context

- **Feature**: Implement user login and smart dashboard view
- **Created**: 2025-11-11
- **Status**: Planning in progress

### Iteration Notes

- **Iteration 1 Plan (2025-11-11)**
  - Implement a Supabase-backed login API at `src/app/api/auth/login/route.ts` that validates payloads with `loginSchema`, calls `auth.signInWithPassword`, handles Supabase errors, respects the "remember me" flag via session persistence settings, and returns sanitized user metadata.
  - Extend the API and client to support a passwordless/magic-link fallback path so users can request an email link when they prefer not to use a password.
  - Replace the simulated login logic in `src/app/login/page.tsx` with a client component that uses `react-hook-form` + `zodResolver(loginSchema)`, calls the login API, surfaces validation/server errors, toggles password visibility, manages remember-me, exposes the magic-link option, and redirects authenticated users to the smart dashboard.
  - Create authenticated routing helpers (middleware or server-side guard) to protect `/dashboard` routes, using `supabase.server` to check sessions, redirect unauthenticated visitors to `/login`, and accommodate role-aware redirects for buyers, sellers, or admins.
  - Build a role-adaptive smart dashboard experience under `src/app/dashboard/` with SSR data loading and caching. The view should reuse `Navbar`/`Footer`, fetch user profile + role-aware insights via a new `src/application/dashboard/getDashboardData.ts`, and compose UI widgets for metrics, activity, tasks, and recommendations using `src/data/dashboardData.ts` as interim mocks.
  - Adopt `recharts` and create reusable chart wrappers in `src/components/dashboard/` for revenue trends, category share, inventory health, and traffic sources, ensuring accessibility and responsive design with guidance from @ui-ux-analyzer.
  - Add server utilities/services (e.g., `getDashboardData.ts`) that centralize Supabase queries so mocks can be swapped for live data easily, respecting the Supabase-only integration scope.
  - Write automated coverage: unit tests for the login API (password + magic-link cases) and dashboard data service; integration test covering login flow; Playwright e2e verifying login → dashboard redirect + guarded routes; component tests for critical dashboard widgets if tooling allows.
  - Document updates: extend `README.md` and `SETUP_GUIDE.md` with login (password + magic link) instructions, dashboard overview, SSR caching strategy, new dependency setup, and any component catalog updates.

