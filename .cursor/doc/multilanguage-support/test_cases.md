# Comprehensive Test Cases: Multilanguage Support

## Test Strategy Overview

This document outlines comprehensive test cases for the multilanguage support feature, covering unit tests, integration tests, and E2E scenarios. Tests follow TDD principles: write test first, then implement, then verify.

---

## 1. i18n Configuration & Setup Tests

### 1.1 Locale Configuration
**File**: `src/i18n/__tests__/config.test.ts`

```typescript
describe("i18n Configuration", () => {
  it("should export valid locale configuration", () => {
    // Test that config.ts exports valid locales array
    // Test that default locale is 'en'
    // Test that supported locales include 'en', 'es', 'ar'
  });

  it("should have valid locale definitions", () => {
    // Test each locale has required properties (code, name, dir)
    // Test 'ar' locale has dir: 'rtl'
    // Test 'en' and 'es' locales have dir: 'ltr'
  });

  it("should validate locale codes", () => {
    // Test isValidLocale('en') returns true
    // Test isValidLocale('es') returns true
    // Test isValidLocale('ar') returns true
    // Test isValidLocale('fr') returns false
    // Test isValidLocale('invalid') returns false
  });
});
```

### 1.2 Routing Configuration
**File**: `src/i18n/__tests__/routing.test.ts`

```typescript
describe("i18n Routing", () => {
  it("should generate correct locale paths", () => {
    // Test getLocalePath('/products', 'es') returns '/es/products'
    // Test getLocalePath('/dashboard', 'ar') returns '/ar/dashboard'
    // Test preserves query params: getLocalePath('/products?q=test', 'es') returns '/es/products?q=test'
  });

  it("should extract locale from pathname", () => {
    // Test extractLocale('/es/products') returns 'es'
    // Test extractLocale('/ar/dashboard') returns 'ar'
    // Test extractLocale('/products') returns null or 'en'
  });

  it("should handle locale prefix removal", () => {
    // Test removeLocalePrefix('/es/products') returns '/products'
    // Test removeLocalePrefix('/ar/dashboard') returns '/dashboard'
    // Test removeLocalePrefix('/products') returns '/products' (no prefix)
  });
});
```

---

## 2. Message Loading & Fallback Tests

### 2.1 Message File Loading
**File**: `src/i18n/__tests__/messages.test.ts`

```typescript
describe("Message Loading", () => {
  it("should load English messages successfully", async () => {
    // Test loadMessages('en') returns valid object
    // Test messages contain expected keys (e.g., 'nav.products', 'hero.title')
  });

  it("should load Spanish messages successfully", async () => {
    // Test loadMessages('es') returns valid object
    // Test messages structure matches English
  });

  it("should load Arabic messages successfully", async () => {
    // Test loadMessages('ar') returns valid object
    // Test messages structure matches English
  });

  it("should fallback to English when locale file missing", async () => {
    // Mock missing file scenario
    // Test fallback to English messages
    // Test console warning logged (development mode)
  });

  it("should fallback to English when translation key missing", () => {
    // Test getTranslation('en', 'nav.products') returns English value
    // Test getTranslation('es', 'nonexistent.key') returns English fallback
    // Test getTranslation('ar', 'nonexistent.key') returns English fallback
  });

  it("should handle malformed JSON gracefully", async () => {
    // Mock malformed JSON file
    // Test error handling and fallback
  });
});
```

---

## 3. Formatting Utilities Tests

### 3.1 Date Formatting
**File**: `src/lib/__tests__/i18n-formatting.test.ts`

```typescript
describe("Date Formatting", () => {
  const testDate = new Date('2024-01-15T10:30:00Z');

  it("should format date for English locale", () => {
    // Test formatDate(testDate, 'en') returns 'Jan 15, 2024' or similar
    // Test format matches en-US conventions
  });

  it("should format date for Spanish locale", () => {
    // Test formatDate(testDate, 'es') returns '15 ene 2024' or similar
    // Test format matches es-ES conventions
  });

  it("should format date for Arabic locale", () => {
    // Test formatDate(testDate, 'ar') returns Arabic numerals or localized format
  });

  it("should handle different date formats", () => {
    // Test formatDate with 'short' format
    // Test formatDate with 'long' format
    // Test formatDate with 'relative' format (e.g., '2 days ago')
  });

  it("should handle invalid dates", () => {
    // Test formatDate with invalid Date object
    // Test formatDate with null/undefined
  });
});
```

### 3.2 Number Formatting
**File**: `src/lib/__tests__/i18n-formatting.test.ts` (continued)

```typescript
describe("Number Formatting", () => {
  it("should format numbers for English locale", () => {
    // Test formatNumber(1000.5, 'en') returns '1,000.5'
    // Test formatNumber(1000000, 'en') returns '1,000,000'
  });

  it("should format numbers for Spanish locale", () => {
    // Test formatNumber(1000.5, 'es') returns '1.000,5'
    // Test formatNumber(1000000, 'es') returns '1.000.000'
  });

  it("should format numbers for Arabic locale", () => {
    // Test formatNumber with Arabic numerals if applicable
  });

  it("should handle edge cases", () => {
    // Test formatNumber(0, 'en')
    // Test formatNumber(-100, 'en')
    // Test formatNumber(Infinity, 'en')
    // Test formatNumber(NaN, 'en')
  });
});
```

### 3.3 Currency Formatting
**File**: `src/lib/__tests__/i18n-formatting.test.ts` (continued)

```typescript
describe("Currency Formatting", () => {
  it("should format currency for English locale", () => {
    // Test formatCurrency(100.50, 'en', 'USD') returns '$100.50'
  });

  it("should format currency for Spanish locale", () => {
    // Test formatCurrency(100.50, 'es', 'EUR') returns '100,50 €'
    // Test currency symbol position (before/after)
  });

  it("should format currency for Arabic locale", () => {
    // Test formatCurrency with Arabic locale
  });

  it("should handle different currencies", () => {
    // Test USD, EUR, MXN formatting
  });

  it("should handle edge cases", () => {
    // Test formatCurrency(0, 'en', 'USD')
    // Test formatCurrency(-50, 'en', 'USD')
    // Test formatCurrency with invalid currency code
  });
});
```

---

## 4. Hooks Tests

### 4.1 useLocale Hook
**File**: `src/hooks/__tests__/useLocale.test.tsx`

```typescript
describe("useLocale Hook", () => {
  it("should return current locale", () => {
    // Test useLocale() returns current locale from context
    // Test default locale is 'en'
  });

  it("should update when locale changes", () => {
    // Test hook updates when locale switcher is used
    // Test hook persists across component re-renders
  });

  it("should work in different component contexts", () => {
    // Test hook works in Client Components
    // Test hook works with NextIntlClientProvider
  });
});
```

### 4.2 useTranslations Hook
**File**: `src/hooks/__tests__/useTranslations.test.tsx`

```typescript
describe("useTranslations Hook", () => {
  it("should return translation function", () => {
    // Test useTranslations() returns a function
    // Test function can translate keys
  });

  it("should translate keys correctly", () => {
    // Test t('nav.products') returns correct translation
    // Test t('hero.title') returns correct translation
  });

  it("should handle missing keys", () => {
    // Test t('nonexistent.key') returns fallback or key
  });

  it("should handle interpolation", () => {
    // Test t('welcome', { name: 'John' }) interpolates correctly
  });
});
```

---

## 5. Language Switcher Component Tests

### 5.1 LanguageSwitcher Component
**File**: `src/components/__tests__/LanguageSwitcher.test.tsx`

```typescript
describe("LanguageSwitcher Component", () => {
  it("should render available locales", () => {
    // Test component renders English, Spanish, Arabic options
    // Test current locale is highlighted/selected
  });

  it("should switch locale on click", async () => {
    // Test clicking Spanish option updates URL to /es/...
    // Test clicking Arabic option updates URL to /ar/...
    // Test query params are preserved
  });

  it("should preserve query parameters", () => {
    // Test switching from /en/products?q=test to /es/products?q=test
  // Test switching from /en/dashboard?tab=stats to /es/dashboard?tab=stats
  });

  it("should be keyboard accessible", () => {
    // Test Tab navigation works
    // Test Enter/Space activates selection
    // Test Arrow keys navigate options
  });

  it("should work in mobile menu", () => {
    // Test component renders correctly in mobile context
    // Test touch interactions work
  });

  it("should handle rapid clicks", async () => {
    // Test multiple rapid clicks don't cause race conditions
    // Test only last selection is applied
  });
});
```

---

## 6. Component Localization Tests

### 6.1 Navbar Component
**File**: `src/components/__tests__/Navbar.i18n.test.tsx`

```typescript
describe("Navbar i18n", () => {
  it("should display translated navigation links", () => {
    // Test 'Products' link shows Spanish text when locale is 'es'
    // Test 'Stores' link shows Spanish text when locale is 'es'
    // Test 'About' link shows Spanish text when locale is 'es'
  });

  it("should display translated auth buttons", () => {
    // Test 'Login' button shows Spanish text when locale is 'es'
    // Test 'Sign Up' button shows Spanish text when locale is 'es'
    // Test 'Dashboard' button shows Spanish text when locale is 'es'
  });

  it("should maintain locale in links", () => {
    // Test links include locale prefix (e.g., /es/products)
    // Test links preserve locale when navigating
  });
});
```

### 6.2 Hero Component
**File**: `src/components/__tests__/Hero.i18n.test.tsx`

```typescript
describe("Hero i18n", () => {
  it("should display translated heading", () => {
    // Test main heading shows Spanish translation when locale is 'es'
  });

  it("should display translated description", () => {
    // Test description text shows Spanish translation when locale is 'es'
  });

  it("should display translated CTAs", () => {
    // Test 'Sign Up' button shows Spanish text
    // Test 'Browse Products' button shows Spanish text
  });
});
```

### 6.3 Footer Component
**File**: `src/components/__tests__/Footer.i18n.test.tsx`

```typescript
describe("Footer i18n", () => {
  it("should display translated footer sections", () => {
    // Test 'Quick Links', 'Legal', 'Stay Updated' headings are translated
    // Test all footer links are translated
  });

  it("should format copyright date", () => {
    // Test copyright year is formatted correctly
    // Test copyright text is translated
  });
});
```

---

## 7. Middleware Tests

### 7.1 Locale Detection
**File**: `middleware.__tests__.ts`

```typescript
describe("Locale Middleware", () => {
  it("should detect locale from URL path", () => {
    // Test /es/products sets locale to 'es'
    // Test /ar/dashboard sets locale to 'ar'
  });

  it("should detect locale from cookie", () => {
    // Test cookie 'NEXT_LOCALE=es' sets locale to 'es'
    // Test cookie takes precedence over Accept-Language header
  });

  it("should detect locale from Accept-Language header", () => {
    // Test Accept-Language: es-ES sets locale to 'es'
    // Test Accept-Language: ar-SA sets locale to 'ar'
    // Test fallback to 'en' if no match
  });

  it("should persist locale in cookie", () => {
    // Test selecting locale sets cookie
    // Test cookie persists across requests
  });

  it("should redirect root path to default locale", () => {
    // Test / redirects to /en/
    // Test / redirects to /es/ if cookie is set
  });
});
```

### 7.2 Middleware + Supabase Auth Integration
**File**: `middleware.__tests__.ts` (continued)

```typescript
describe("Middleware + Supabase Auth", () => {
  it("should not interfere with auth redirects", () => {
    // Test protected route redirect to /login preserves locale
    // Test /login redirect to /dashboard preserves locale
  });

  it("should handle auth flows with locale", () => {
    // Test login from /es/login redirects to /es/dashboard
    // Test logout from /es/dashboard redirects to /es/
  });

  it("should preserve locale through auth state changes", () => {
    // Test locale persists when user logs in
    // Test locale persists when user logs out
  });
});
```

---

## 8. RTL Support Tests

### 8.1 RTL Layout
**File**: `src/app/[locale]/__tests__/rtl.test.tsx`

```typescript
describe("RTL Support", () => {
  it("should set dir='rtl' for Arabic locale", () => {
    // Test <html dir="rtl"> when locale is 'ar'
    // Test <html dir="ltr"> when locale is 'en' or 'es'
  });

  it("should apply RTL styles correctly", () => {
    // Test Tailwind RTL utilities work (e.g., rtl:ml-4)
    // Test spacing adjusts correctly
  });

  it("should handle icon alignment in RTL", () => {
    // Test icons don't appear mirrored incorrectly
    // Test icon + text alignment is correct
  });

  it("should handle text alignment in RTL", () => {
    // Test text-align: right for Arabic
    // Test text-align: left for English/Spanish
  });
});
```

---

## 9. Integration Tests

### 9.1 Full Page Rendering
**File**: `src/app/[locale]/__tests__/integration.test.tsx`

```typescript
describe("Page Integration", () => {
  it("should render complete page in English", async () => {
    // Test full page render with English locale
    // Test all components show English text
  });

  it("should render complete page in Spanish", async () => {
    // Test full page render with Spanish locale
    // Test all components show Spanish text
  });

  it("should render complete page in Arabic with RTL", async () => {
    // Test full page render with Arabic locale
    // Test RTL layout is applied
  });
});
```

---

## 10. E2E Tests (Playwright)

### 10.1 Language Switching Flow
**File**: `e2e/i18n.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Multilanguage Support', () => {
  test('should switch language and persist selection', async ({ page }) => {
    // Navigate to homepage
    // Click language switcher
    // Select Spanish
    // Verify URL is /es/
    // Verify text content is in Spanish
    // Reload page
    // Verify locale persists (still /es/)
  });

  test('should preserve query params when switching language', async ({ page }) => {
    // Navigate to /en/products?q=caps
    // Switch to Spanish
    // Verify URL is /es/products?q=caps
    // Verify search query is preserved
  });

  test('should apply RTL layout for Arabic', async ({ page }) => {
    // Navigate to /ar/
    // Verify html[dir="rtl"]
    // Verify layout is right-to-left
    // Verify no broken spacing or alignment
  });

  test('should persist locale after login', async ({ page }) => {
    // Navigate to /es/login
    // Login
    // Verify redirect to /es/dashboard
    // Verify dashboard is in Spanish
  });

  test('should persist locale after logout', async ({ page }) => {
    // Login from /es/login
    // Logout
    // Verify redirect to /es/
    // Verify homepage is in Spanish
  });
});
```

---

## Test Coverage Goals

- **Unit Tests**: >80% coverage for i18n utilities, hooks, and components
- **Integration Tests**: All main user flows covered
- **E2E Tests**: Critical paths (language switching, persistence, RTL)

---

## Test Execution Order (TDD)

1. Write test for i18n config → Implement config → Verify
2. Write test for message loading → Implement loading → Verify
3. Write test for formatting utilities → Implement utilities → Verify
4. Write test for hooks → Implement hooks → Verify
5. Write test for LanguageSwitcher → Implement component → Verify
6. Write test for component localization → Implement translations → Verify
7. Write test for middleware → Implement middleware → Verify
8. Write E2E tests → Run and verify all scenarios
