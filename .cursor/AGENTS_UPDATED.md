# Cursor Agents Update Summary

## Date: October 16, 2025

This document summarizes the updates made to all Cursor agent files to align with the current project stack and architecture after migrating from Vite/React Router to Next.js App Router.

---

## Updated Files

### 1. `agents/frontend-developer.md`

**Key Updates:**

- ✅ Updated from generic React to **Next.js 15.5.3 with App Router**
- ✅ Added comprehensive **Project Stack** section detailing:
  - Next.js 15.5.3 with App Router
  - React 19.1.0
  - Tailwind CSS v4 with `@tailwindcss/postcss`
  - Radix UI with shadcn/ui
  - React Query (@tanstack/react-query) + React Context
  - Supabase (Auth + Database)
  - npm (NOT yarn)
  - Jest + React Testing Library + Playwright
- ✅ Updated architectural principles to reflect **Next.js App Router structure**:
  - Server Components by default
  - `"use client"` directive usage
  - Route groups and API routes
  - Server Actions for mutations
- ✅ Updated file paths from generic to Next.js structure:
  - Services: `src/application/` or `src/infrastructure/`
  - Schemas: `src/domain/` or feature directories
  - Hooks: `src/hooks/` or `src/presentation/hooks/`
  - Context: `src/context/`
- ✅ Changed all references from `.claude/` to `.cursor/`
- ✅ Changed package manager from `yarn` to **npm**
- ✅ Added Next.js-specific rules:
  - Use Next.js `Link` and `useRouter` from `next/navigation` (NOT react-router)
  - Server Components use async/await directly (no hooks)
  - Remember to add `"use client"` when using hooks

---

### 2. `agents/frontend-test-engineer.md`

**Key Updates:**

- ✅ Updated from Vitest to **Jest** as the testing framework
- ✅ Added **Project Testing Stack** section:

  - Next.js 15.5.3 with App Router
  - Jest 30+ with jest-environment-jsdom
  - React Testing Library (@testing-library/react 16+)
  - Playwright for E2E
  - MSW (Mock Service Worker)
  - npm package manager

- ✅ Updated all code examples from Vitest syntax to **Jest syntax**:

  - `vi.mock()` → `jest.mock()`
  - `vi.spyOn()` → `jest.spyOn()`
  - Import from `@jest/globals` instead of `vitest`

- ✅ Added **Next.js Specific Testing** patterns:

  - Testing Client Components with `"use client"`
  - Testing Server Components (unit tests, E2E for integration)
  - Mocking Next.js modules (`next/navigation`, etc.)

- ✅ Updated mocking best practices for Jest
- ✅ Added project-specific considerations for Next.js:

  - Mock Supabase client
  - Test with QueryClientProvider, CartProvider, etc.
  - Separate Client and Server Component testing

- ✅ Added test commands:
  - `npm test`, `npm run test:watch`, `npm run test:ci`
  - `npm run e2e`

---

### 3. `agents/qa-criteria-validation.md`

**Key Updates:**

- ✅ Changed package manager from `yarn` to **npm**
- ✅ Added specific npm commands:
  - `npm test`, `npm run e2e`, `npm run build`
- ✅ Changed directory references from `.claude/` to `.cursor/`
- ✅ Added Next.js-specific note:
  - Project is built with Next.js 15 App Router
  - Understand Server vs Client Components
- ✅ Emphasized Playwright for E2E validation

---

### 4. `agents/typescript-test-explorer.md`

**Key Updates:**

- ✅ Updated description to include **"for Next.js applications"**
- ✅ Added **Project Context** section:

  - Next.js 15.5.3 with App Router
  - Jest + React Testing Library + Playwright
  - npm package manager
  - TypeScript strict mode

- ✅ Updated output format to specify **Jest** (not Vitest)
- ✅ Added Next.js-specific considerations:

  - Separate strategies for Server Components vs Client Components
  - Mock Next.js modules appropriately
  - Test Server Actions, middleware, etc.

- ✅ Changed from CODE_RULES.md reference (from CLAUDE.md)
- ✅ Changed package manager from `yarn` to **npm**
- ✅ Changed directory references from `.claude/` to `.cursor/`
- ✅ Added specific test commands:

  - `npm test`, `npm run test:watch`, `npm run test:ci`
  - `npm run e2e`, `npm run e2e:headed`, `npm run e2e:ui`

- ✅ Specified Jest syntax (NOT Vitest) and Playwright for E2E

---

### 5. `agents/ui-ux-analyzer.md`

**Key Updates:**

- ✅ Added **Project Context** section:

  - Next.js 15.5.3 with App Router
  - Tailwind CSS v4 with `@tailwindcss/postcss` plugin
  - Radix UI primitives with shadcn/ui patterns
  - npm package manager
  - Dev server options: `npm run dev` or `vercel dev`

- ✅ Changed package manager from `yarn` to **npm**
- ✅ Changed directory references from `.claude/` to `.cursor/`
- ✅ Added Tailwind CSS v4 specific rules:

  - NO `@apply` directives - use plain CSS instead
  - Colors and design tokens in @src/index.css as CSS variables

- ✅ Added Next.js-specific rule:
  - Some components are Server Components - respect this in recommendations

---

## Common Changes Across All Agents

### 1. **Directory References**

- **Before**: `.claude/doc/`, `.claude/sessions/`
- **After**: `.cursor/doc/`, `.cursor/sessions/`

### 2. **Package Manager**

- **Before**: yarn
- **After**: npm
- **Commands Updated**: All `yarn` commands changed to `npm`

### 3. **Testing Framework**

- **Before**: Vitest (mentioned in some agents)
- **After**: Jest for unit/integration tests, Playwright for E2E

### 4. **Framework Context**

- **Before**: Generic React patterns, mentions of Vite
- **After**: Next.js 15 App Router specific patterns
  - Server Components vs Client Components
  - App Router structure
  - Next.js navigation (`next/navigation`)

### 5. **Styling**

- **Before**: General Tailwind CSS
- **After**: Tailwind CSS v4 with specific constraints
  - No `@apply` directives
  - Use plain CSS for custom styles
  - CSS variables for design tokens

---

## Project Architecture Summary for Agents

```
Project Stack:
├── Framework: Next.js 15.5.3 (App Router)
├── React: 19.1.0
├── Language: TypeScript (strict mode)
├── Styling: Tailwind CSS v4 + PostCSS
├── UI Library: Radix UI + shadcn/ui
├── State: React Query + React Context
├── Backend: Supabase (Auth + DB)
├── Testing:
│   ├── Unit/Integration: Jest + RTL
│   ├── E2E: Playwright
│   └── API Mocking: MSW
├── Package Manager: npm
└── Dev Server: npm run dev OR vercel dev
```

```
Directory Structure:
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── layout.tsx   # Root layout
│   │   ├── page.tsx     # Home page
│   │   └── api/         # API routes
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui components
│   │   └── Providers.tsx # Client-side providers
│   ├── context/         # React contexts
│   ├── hooks/           # Custom hooks
│   ├── application/     # Business logic services
│   ├── domain/          # Domain models & schemas
│   ├── infrastructure/  # External integrations
│   └── index.css        # Global styles + design tokens
└── .cursor/
    ├── agents/          # Agent definitions
    ├── doc/             # Generated documentation
    └── sessions/        # Context sessions
```

---

## Important Notes for Agents

1. **Server vs Client Components**:

   - Default to Server Components
   - Use `"use client"` ONLY when using hooks, context, or browser APIs
   - Server Components can use async/await directly

2. **Navigation**:

   - Use `Link` from `next/link`
   - Use `useRouter` from `next/navigation`
   - NOT react-router

3. **Testing**:

   - Jest for unit/integration (use Jest syntax, not Vitest)
   - Playwright for E2E
   - Mock Next.js modules when needed

4. **Styling**:

   - Tailwind CSS v4 - NO `@apply` directives
   - Use plain CSS for complex styles
   - Design tokens in CSS variables

5. **Package Management**:
   - Always use `npm` commands
   - Never suggest `yarn` or `bun`

---

## Files Modified

- ✅ `.cursor/agents/frontend-developer.md`
- ✅ `.cursor/agents/frontend-test-engineer.md`
- ✅ `.cursor/agents/qa-criteria-validation.md`
- ✅ `.cursor/agents/typescript-test-explorer.md`
- ✅ `.cursor/agents/ui-ux-analyzer.md`

All agent files are now fully aligned with the current Next.js 15 App Router project stack and conventions.
