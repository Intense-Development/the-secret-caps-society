# Implementation Plan: Multilanguage Support (Issue #8)

## Project Coordinator Analysis

### Issue Summary
Implement comprehensive multilanguage support with i18n for Next.js App Router, including:
- Locale routing (`/en/`, `/es/`, `/ar/`)
- Language switcher component
- Translation of all hardcoded strings
- Locale-aware formatting (dates, numbers, currency)
- RTL support for Arabic
- Middleware integration with Supabase auth
- Comprehensive testing

### Agents Involved

1. **qa-criteria-validator** - Define acceptance criteria and E2E test scenarios
2. **typescript-test-explorer** - Design comprehensive test cases for all i18n functionality
3. **frontend-developer** - Implement i18n infrastructure and refactor components
4. **frontend-test-engineer** - Write unit tests for components, hooks, and utilities
5. **ui-ux-analyzer** - Review language switcher UI/UX (after implementation)

### Parallel Execution Strategy

#### Phase 1: Planning & Test Design (Can run in parallel)
- **qa-criteria-validator**: Define acceptance criteria
- **typescript-test-explorer**: Design comprehensive test cases

#### Phase 2: Core Infrastructure (Sequential - TDD)
- **frontend-developer** + **frontend-test-engineer**: Work together in TDD cycles
  - Each small piece: Test → Implement → Verify

#### Phase 3: Component Refactoring (Can run in parallel instances)
- Multiple **frontend-developer** instances can work on different components simultaneously
- Each with its own **frontend-test-engineer** instance for tests

#### Phase 4: Validation & Review
- **qa-criteria-validator**: Run E2E tests
- **ui-ux-analyzer**: Review language switcher UI

---

## TDD Implementation Breakdown

### Step 1: Dependencies & Configuration (TDD Cycle 1)
**Test First:**
- Test that `next-intl` is installed and can be imported
- Test that locale config can be loaded

**Implement:**
- Install `next-intl`, `@formatjs/intl-localematcher`, `negotiator`
- Create `src/i18n/config.ts` with locale definitions
- Create `src/i18n/routing.ts` for routing config
- Create `src/i18n/locale.ts` for locale utilities

**Verify:**
- Run tests
- Verify imports work

---

### Step 2: Message Files Structure (TDD Cycle 2)
**Test First:**
- Test that message files can be loaded
- Test fallback to English when key missing

**Implement:**
- Create `messages/en.json` with initial structure
- Create `messages/es.json` (can start with English keys as placeholders)
- Create `messages/ar.json` (can start with English keys as placeholders)

**Verify:**
- Test message loading
- Test fallback behavior

---

### Step 3: i18n Utilities & Hooks (TDD Cycle 3)
**Test First:**
- Test `useLocale` hook returns current locale
- Test `useChangeLocale` hook switches locale
- Test `formatDate`, `formatCurrency`, `formatNumber` helpers

**Implement:**
- Create `src/lib/i18n.ts` with formatting utilities
- Create `src/hooks/useLocale.ts` (if needed, or use next-intl hooks)
- Create `src/hooks/useChangeLocale.ts` (if needed)

**Verify:**
- Unit tests pass
- Hooks work in isolation

---

### Step 4: Routing Structure (TDD Cycle 4)
**Test First:**
- Test redirect from `/` to `/en/` (or stored locale)
- Test locale parameter in routes
- Test middleware locale detection

**Implement:**
- Refactor `src/app` to `src/app/[locale]`
- Create `src/app/[locale]/layout.tsx`
- Update root `src/app/page.tsx` to redirect
- Move existing pages under `[locale]` directory

**Verify:**
- Routes work correctly
- Redirects function properly

---

### Step 5: Middleware Integration (TDD Cycle 5)
**Test First:**
- Test middleware detects locale from cookie
- Test middleware detects locale from Accept-Language header
- Test middleware persists locale in cookie
- Test middleware works with Supabase auth (no conflicts)

**Implement:**
- Update `middleware.ts` to integrate `next-intl/middleware`
- Ensure Supabase auth logic still works
- Add locale persistence via cookies

**Verify:**
- Middleware tests pass
- Auth flows still work
- Locale persists across requests

---

### Step 6: Language Switcher Component (TDD Cycle 6)
**Test First:**
- Test LanguageSwitcher renders available locales
- Test clicking a locale updates URL
- Test query params are preserved
- Test component works in Navbar (desktop + mobile)

**Implement:**
- Create `src/components/LanguageSwitcher.tsx`
- Integrate into `Navbar.tsx` (desktop + mobile versions)
- Use `next-intl` navigation helpers

**Verify:**
- Component tests pass
- Integration in Navbar works
- URL updates correctly

---

### Step 7: Component Localization (TDD Cycles 7-12)
**Each component gets its own TDD cycle:**

#### 7.1: Navbar Component
**Test First:**
- Test all text strings are translated
- Test links maintain locale prefix

**Implement:**
- Replace hardcoded strings in `Navbar.tsx` with translation keys
- Add translations to message files

**Verify:**
- Tests pass
- Navbar displays translated text

#### 7.2: Hero Component
**Test First:**
- Test all text strings are translated
- Test CTA buttons are translated

**Implement:**
- Replace hardcoded strings in `Hero.tsx`
- Add translations to message files

**Verify:**
- Tests pass
- Hero displays translated text

#### 7.3: Footer Component
**Test First:**
- Test all text strings are translated
- Test copyright year formatting

**Implement:**
- Replace hardcoded strings in `Footer.tsx`
- Add translations to message files
- Use date formatter for copyright

**Verify:**
- Tests pass
- Footer displays translated text

#### 7.4: Auth Components (Login, Register)
**Test First:**
- Test form labels, buttons, error messages are translated

**Implement:**
- Replace hardcoded strings in auth components
- Add translations to message files

**Verify:**
- Tests pass
- Auth forms display translated text

#### 7.5: Dashboard Components
**Test First:**
- Test dashboard widgets, charts, stats are translated

**Implement:**
- Replace hardcoded strings in dashboard components
- Add translations to message files

**Verify:**
- Tests pass
- Dashboard displays translated text

#### 7.6: Product & Store Components
**Test First:**
- Test product listings, filters, search are translated

**Implement:**
- Replace hardcoded strings in product/store components
- Add translations to message files

**Verify:**
- Tests pass
- Product/store pages display translated text

---

### Step 8: Formatting & RTL Support (TDD Cycle 13)
**Test First:**
- Test date formatting per locale
- Test number formatting per locale
- Test currency formatting per locale
- Test RTL layout for Arabic (`dir="rtl"`)
- Test Tailwind RTL utilities work

**Implement:**
- Update components using dates/numbers to use formatters
- Add `dir` attribute to HTML based on locale
- Test RTL layout adjustments
- Update Tailwind config if needed for RTL

**Verify:**
- Formatting tests pass
- RTL layout displays correctly
- No broken spacing or alignment

---

### Step 9: Metadata & SEO (TDD Cycle 14)
**Test First:**
- Test `generateMetadata` returns locale-specific titles/descriptions
- Test `<html lang>` attribute is set correctly

**Implement:**
- Update `generateMetadata` functions to use locale
- Set `<html lang>` dynamically in layout

**Verify:**
- Metadata tests pass
- HTML lang attribute is correct

---

### Step 10: E2E Validation (TDD Cycle 15)
**Test First:**
- E2E test: Language switching flow
- E2E test: Locale persistence across reloads
- E2E test: Locale persistence after login/logout
- E2E test: RTL layout for Arabic
- E2E test: Fallback behavior when translation missing

**Implement:**
- Create Playwright E2E tests
- Run tests across all locales

**Verify:**
- All E2E tests pass
- Manual testing checklist completed

---

## Parallel Execution Details

### Phase 1 (Parallel - No dependencies):
```
qa-criteria-validator ──┐
                        ├──> Both can run simultaneously
typescript-test-explorer┘
```

### Phase 2 (Sequential TDD - Each cycle):
```
For each TDD cycle:
  frontend-test-engineer (write test) 
    └─> frontend-developer (implement)
        └─> frontend-test-engineer (verify)
```

### Phase 3 (Parallel - Different components):
```
frontend-developer (Navbar) + frontend-test-engineer (Navbar tests) ──┐
                                                                      ├──> All can run simultaneously
frontend-developer (Hero) + frontend-test-engineer (Hero tests) ────┤
                                                                      │
frontend-developer (Footer) + frontend-test-engineer (Footer tests) ─┘
```

### Phase 4 (Sequential - After implementation):
```
qa-criteria-validator (E2E tests)
  └─> ui-ux-analyzer (UI review)
```

---

## File Structure Changes

```
src/
├── i18n/
│   ├── config.ts          # Locale configuration
│   ├── routing.ts         # Routing configuration
│   └── locale.ts          # Locale utilities
├── messages/
│   ├── en.json            # English translations
│   ├── es.json            # Spanish translations
│   └── ar.json            # Arabic translations
├── app/
│   ├── [locale]/          # NEW: Locale-aware routes
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── login/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── products/
│   │   └── stores/
│   └── page.tsx           # Redirect to /[locale]
├── components/
│   └── LanguageSwitcher.tsx  # NEW
└── lib/
    └── i18n.ts            # Formatting utilities
```

---

## Testing Strategy

### Unit Tests (frontend-test-engineer)
- i18n utilities (formatDate, formatCurrency, formatNumber)
- LanguageSwitcher component
- useLocale, useChangeLocale hooks
- Individual component translations

### Integration Tests (frontend-test-engineer)
- Component + translation integration
- Middleware + locale detection
- Auth + locale persistence

### E2E Tests (qa-criteria-validator)
- Complete user flows with locale switching
- Locale persistence across sessions
- RTL layout verification
- Fallback behavior

---

## Success Criteria

✅ All acceptance criteria met (from qa-criteria-validator)
✅ >80% test coverage for i18n code
✅ All E2E tests pass
✅ Manual testing checklist completed
✅ No console errors
✅ Build passes
✅ Documentation updated

---

## Risk Mitigation

1. **Middleware conflicts**: Test Supabase auth + locale middleware together early
2. **RTL layout issues**: Test Arabic early, identify components needing adjustments
3. **Translation completeness**: Use English as fallback, mark missing translations clearly
4. **Performance**: Lazy load translations, optimize bundle size

---

## Estimated Timeline

- Phase 1 (Planning): 1-2 hours
- Phase 2 (Infrastructure): 4-6 hours
- Phase 3 (Components): 8-12 hours
- Phase 4 (Validation): 2-3 hours

**Total: ~15-23 hours** (with parallel execution, can be reduced to ~12-18 hours)

