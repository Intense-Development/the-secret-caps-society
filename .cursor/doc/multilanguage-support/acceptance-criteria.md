# Acceptance Criteria: Multilanguage Support (Issue #8)

## Feature: Comprehensive Multilanguage Support with i18n

### User Story
As a **Spanish-speaking seller or buyer**, I want to **navigate the entire application in my native language** so that I can **understand all features, complete onboarding, manage products, and view dashboard insights without language barriers**.

As a **prospective Arabic user**, I want the **interface to support RTL layout** so that when translations are available, the **layout displays correctly without mirrored or broken spacing**.

As a **support team member**, I want **locale-specific messaging and analytics segmentation** so that I can **provide better support and understand user behavior by language**.

---

## Acceptance Criteria

### AC1: Locale Routing & Detection
**Given** a user visits the application root (`/`)
**When** they have no stored locale preference
**Then** they should be automatically redirected to `/en/` (or their browser's preferred locale if supported)

**Given** a user visits `/es` or `/es/`
**When** the middleware processes the request
**Then** they should see the Spanish version of the application

**Given** a user visits `/ar` or `/ar/`
**When** the middleware processes the request
**Then** they should see the Arabic version with RTL layout (`dir="rtl"`)

---

### AC2: Language Switcher Component
**Given** a user is on any page
**When** they interact with the language switcher in the Navbar
**Then** the URL should update to the new locale (e.g., `/en/products` → `/es/products`)
**And** all text content should update to the selected language
**And** query parameters should be preserved (e.g., `/en/products?search=caps` → `/es/products?search=caps`)
**And** the page should not perform a full reload

**Given** a user is on mobile
**When** they open the mobile menu
**Then** the language switcher should be accessible and functional

---

### AC3: Translation Coverage
**Given** a user selects Spanish (`/es`)
**When** they navigate through the application
**Then** all hardcoded strings should be replaced with Spanish translations:
- Navbar links (Products, Stores, About, Login, Sign Up, Dashboard)
- Hero section (headings, descriptions, CTAs)
- Footer (links, copyright, newsletter)
- Auth forms (labels, buttons, error messages)
- Dashboard widgets and charts
- Product/Store listings and filters
- Error messages and validation text

**Given** a translation key is missing for a locale
**When** the application attempts to render that key
**Then** it should fallback to English without crashing
**And** a console warning should be logged (development mode)

---

### AC4: Locale-Aware Formatting
**Given** a user is viewing product prices
**When** they switch between locales
**Then** currency should be formatted according to locale (e.g., $100.00 → 100,00 € for Spanish)
**And** number formatting should match locale conventions (1,000.50 → 1.000,50 for Spanish)

**Given** a user views dates (copyright year, dashboard timestamps)
**When** they are displayed
**Then** dates should be formatted according to locale conventions

---

### AC5: RTL Support for Arabic
**Given** a user selects Arabic (`/ar`)
**When** the page renders
**Then** the HTML `dir` attribute should be set to `"rtl"`
**And** the layout should flip to right-to-left
**And** icons and spacing should adjust correctly (no broken alignment)
**And** Tailwind RTL utilities should work as expected

---

### AC6: Middleware Integration
**Given** a user makes a request
**When** the middleware processes it
**Then** locale should be detected from (in priority order):
1. URL path (`/es/products`)
2. Cookie (`NEXT_LOCALE=es`)
3. Accept-Language header
4. Default to `en`

**Given** a user selects a locale
**When** they navigate or reload
**Then** the locale preference should be persisted in a cookie
**And** subsequent requests should use the stored locale

**Given** a user is authenticated via Supabase
**When** they navigate to protected routes
**Then** Supabase auth middleware should still function correctly
**And** locale middleware should not interfere with auth redirects
**And** locale should be preserved through auth flows

---

### AC7: Metadata & SEO
**Given** a page has metadata (title, description)
**When** it's rendered for different locales
**Then** metadata should be locale-specific
**And** the HTML `lang` attribute should match the current locale

---

### AC8: Error Handling
**Given** translation files fail to load
**When** the application attempts to render
**Then** it should gracefully fallback to English
**And** display an error message to the user (in development)
**And** not crash the application

**Given** a user switches locales during a Supabase auth redirect
**When** the redirect completes
**Then** no infinite loops should occur
**And** redirect parameters should be preserved
**And** the correct locale should be maintained

---

## Edge Cases

### EC1: Invalid Locale
**Scenario**: User manually enters `/fr/products` (French not supported)
**Expected**: Redirect to default locale (`/en/products`) or closest match

### EC2: Missing Translation Key
**Scenario**: A component uses a translation key that doesn't exist in `messages/es.json`
**Expected**: Fallback to English value, log warning in development

### EC3: Locale Cookie Expiration
**Scenario**: User's locale cookie expires
**Expected**: Fallback to browser Accept-Language or default to `en`

### EC4: Concurrent Locale Switches
**Scenario**: User rapidly clicks language switcher multiple times
**Expected**: Only the last selection should be applied, no race conditions

### EC5: Deep Links with Locale
**Scenario**: User shares a link like `/es/products/123`
**Expected**: Recipient should see the product in Spanish, locale should persist

---

## Non-Functional Requirements

### Performance
- Translation files should be lazy-loaded per locale
- Language switching should not cause full page reloads
- Bundle size increase should be minimal (<50KB per locale)

### Accessibility
- Language switcher should be keyboard navigable
- Screen readers should announce language changes
- RTL layout should maintain proper focus order

### Security
- Locale cookies should be HttpOnly and Secure in production
- No XSS vulnerabilities from translation content
- Locale validation to prevent path traversal

### Browser Compatibility
- Support for Chrome, Firefox, Safari, Edge (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)
- RTL support in all supported browsers

---

## Manual Testing Checklist

### Basic Flow
- [ ] Visit `/` and confirm redirect to `/en/` (or stored locale)
- [ ] Use language switcher to toggle between English and Spanish
- [ ] Verify URL updates (e.g., `/en/login` → `/es/login`)
- [ ] Verify all text content updates
- [ ] Verify metadata updates (page title, description)
- [ ] Log in via `/en/login`, switch to Spanish, verify dashboard respects locale

### Edge Case Testing
- [ ] Manually visit `/es` with no prior cookie; verify middleware negotiates Spanish
- [ ] Navigate to a non-translated key (simulate by removing a key); verify fallback-to-English
- [ ] Switch to Arabic and confirm layout flips to RTL with no broken spacing
- [ ] Test language switcher on mobile menu

### Error Handling
- [ ] Force translation load failure (rename `messages/en.json`); verify graceful fallback
- [ ] Switch locales during Supabase auth redirect; verify no infinite loops
- [ ] Test with invalid locale in URL; verify redirect to valid locale

### Integration
- [ ] Verify Supabase auth middleware and `next-intl` locale middleware coexist
- [ ] Check analytics/telemetry captures locale context (if configured)
- [ ] Ensure Playwright e2e tests cover locale persistence across reloads
- [ ] Test locale persistence after logging out and back in

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Implementation complete with edge cases handled
- [ ] Unit tests added (>80% coverage for i18n code)
- [ ] Integration tests for main flows
- [ ] E2E tests for language switching and persistence
- [ ] Documentation updated (README, i18n guide)
- [ ] Code review approved
- [ ] CI/CD passes
- [ ] Manual testing checklist completed
- [ ] No console errors in production build
- [ ] Performance benchmarks met (bundle size, load time)
