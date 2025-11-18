# [Feature] Implement Logout Endpoint

## Problem Statement

Currently, users can log in to the application via `/api/auth/login`, but there is **no logout functionality**. This creates several issues:

1. **No way to terminate sessions**: Users cannot properly log out, leaving their sessions active indefinitely
2. **Security risk**: Active sessions remain valid even when users want to end them
3. **Poor UX**: Users expect a logout option in authenticated interfaces (Navbar, Dashboard)
4. **Session management gap**: The login endpoint sets cookies (`sb-remember-me` and Supabase auth cookies), but there's no corresponding cleanup mechanism
5. **Incomplete auth flow**: Authentication is only half-implemented without logout capability

**Current Limitations:**
- No `/api/auth/logout` endpoint exists
- No client-side logout hook or functionality
- No logout button in UI components
- Session cookies persist indefinitely
- No way to clear Supabase session server-side

## User Value

Implementing logout will provide users with:

1. **Security Control**: Users can securely end their sessions when done, especially on shared devices
   - Example: A user logs in at a public computer, completes their purchase, and can now safely log out

2. **Session Management**: Clear indication of authentication state and ability to switch accounts
   - Example: A seller wants to log out and log in with their buyer account to make a purchase

3. **Privacy Protection**: Users can ensure their session is terminated when they're finished
   - Example: After managing their store, a seller can log out to prevent unauthorized access

4. **Better UX**: Standard authentication flow that users expect from modern web applications
   - Example: Users see a logout button in the Navbar and can easily end their session

5. **Cart Preservation**: Cart data is preserved after logout, allowing guest checkout
   - Example: User adds items to cart, logs out, and can still checkout as a guest

## Definition of Done

- [ ] **Backend API Route** (`/api/auth/logout`) implemented
  - POST endpoint that clears Supabase session
  - Clears all Supabase auth cookies
  - Clears `sb-remember-me` cookie
  - Idempotent (safe to call multiple times)
  - Graceful error handling (always returns success from user perspective)

- [ ] **Client-Side Logout Hook** (`useLogout`) implemented
  - Handles API call and client-side Supabase signOut
  - Loading state management
  - Graceful degradation (works even if API fails)
  - Analytics event tracking
  - Does NOT clear cart (preserved for guest checkout)

- [ ] **Confirmation Dialog** component created
  - Uses shadcn/ui AlertDialog
  - Warns about unsaved changes if detected
  - Loading state during logout
  - i18n support

- [ ] **Unsaved Changes Detection** hook implemented
  - Detects form dirty state
  - Warns before page unload
  - Integrates with logout confirmation

- [ ] **UI Integration** complete
  - Logout button in Navbar (desktop + mobile menu)
  - Logout button in Dashboard
  - Loading indicators
  - Accessibility support (ARIA labels)

- [ ] **Analytics Tracking** implemented
  - Logout event tracking
  - Success/failure tracking
  - Extensible for future analytics providers

- [ ] **Unit Tests** (>80% coverage)
  - API route tests (`src/__tests__/api/auth/logout.test.ts`)
  - Hook tests (`src/__tests__/hooks/useLogout.test.ts`)
  - Unsaved changes hook tests
  - Dialog component tests
  - Navbar logout integration tests

- [ ] **E2E Tests** for main flows
  - Successful logout and redirect
  - Cookie clearing verification
  - Logout button visibility based on auth state
  - Confirmation dialog flow

- [ ] **i18n Support** added
  - Translations in `messages/en.json`, `messages/es.json`, `messages/ar.json`
  - All user-facing strings translated

- [ ] **Documentation** updated
  - API documentation updated (README.md)
  - Code comments for complex logic
  - Session file updated with implementation status

- [ ] **Code Review** approved
  - Follows TDD approach
  - Matches existing code patterns
  - No linter errors
  - TypeScript strict mode compliance

- [ ] **CI/CD** passes
  - All tests pass
  - Build succeeds
  - No type errors

- [ ] **Manual Testing** complete (see checklist below)

## Manual Testing Checklist

### Basic Flow
- [ ] **Login then Logout**: 
  1. Log in with valid credentials
  2. Verify user is authenticated (Navbar shows dashboard button)
  3. Click logout button in Navbar
  4. Confirm dialog appears
  5. Click "Log Out" in dialog
  6. Verify redirect to home page
  7. Verify Navbar shows login/signup buttons
  8. Verify cannot access `/dashboard` (redirects to login)

- [ ] **Logout from Dashboard**:
  1. Log in and navigate to dashboard
  2. Click logout button (if present)
  3. Verify logout flow works correctly
  4. Verify redirect to home page

- [ ] **Mobile Menu Logout**:
  1. Log in on mobile viewport
  2. Open mobile menu
  3. Click logout button
  4. Verify confirmation dialog appears
  5. Complete logout flow
  6. Verify redirect works

### Edge Case Testing
- [ ] **Logout when already logged out**:
  1. Try to access logout endpoint directly when not authenticated
  2. Verify idempotent behavior (no errors)

- [ ] **Multiple rapid logout clicks**:
  1. Click logout button multiple times quickly
  2. Verify only one logout request is processed
  3. Verify loading state prevents duplicate calls

- [ ] **Logout with unsaved changes**:
  1. Navigate to a form (e.g., dashboard settings)
  2. Make changes without saving
  3. Click logout
  4. Verify warning about unsaved changes appears in dialog
  5. Verify logout still works after confirmation

- [ ] **Network failure during logout**:
  1. Disable network (devtools → Network → Offline)
  2. Click logout
  3. Verify client-side session is still cleared
  4. Verify user is redirected (graceful degradation)

- [ ] **Cart preservation**:
  1. Add items to cart
  2. Log out
  3. Verify cart items are still present
  4. Verify can proceed to checkout as guest

### Error Handling
- [ ] **API error handling**:
  1. Mock API to return error
  2. Attempt logout
  3. Verify client-side session is still cleared
  4. Verify user sees success message (not error)

- [ ] **Supabase error handling**:
  1. Mock Supabase signOut to fail
  2. Attempt logout
  3. Verify cookies are still cleared
  4. Verify user can proceed

### Integration
- [ ] **Middleware integration**:
  1. Log out
  2. Try to access protected route
  3. Verify middleware redirects to login

- [ ] **Analytics tracking**:
  1. Log out successfully
  2. Verify logout event is tracked
  3. Log out with API failure
  4. Verify failure event is tracked

- [ ] **Locale preservation**:
  1. Log in on `/es/dashboard`
  2. Log out
  3. Verify redirect preserves locale (or redirects to `/es`)

- [ ] **Session cookie verification**:
  1. Log in and check cookies in devtools
  2. Log out
  3. Verify all Supabase cookies are deleted
  4. Verify `sb-remember-me` cookie is deleted

## Technical Details

### Files to Create
1. `src/app/api/auth/logout/route.ts` - Logout API endpoint
2. `src/__tests__/api/auth/logout.test.ts` - API route tests
3. `src/hooks/useLogout.ts` - Logout hook with confirmation
4. `src/hooks/useUnsavedChanges.ts` - Unsaved changes detection hook
5. `src/__tests__/hooks/useLogout.test.ts` - Hook tests
6. `src/__tests__/hooks/useUnsavedChanges.test.ts` - Unsaved changes hook tests
7. `src/components/auth/LogoutConfirmDialog.tsx` - Logout confirmation dialog
8. `src/components/__tests__/auth/LogoutConfirmDialog.test.tsx` - Dialog component tests
9. `src/components/__tests__/Navbar.logout.test.tsx` - Navbar logout tests
10. `src/lib/analytics.ts` - Analytics tracking utility
11. `e2e/logout.spec.ts` - E2E tests

### Files to Modify
1. `src/components/Navbar.tsx` - Add logout button
2. `messages/en.json` - Add logout translations
3. `messages/es.json` - Add logout translations
4. `messages/ar.json` - Add logout translations
5. `src/app/[locale]/dashboard/page.tsx` - Add logout button (optional)

### Implementation Approach
- **TDD**: Write tests first, then implement
- **Pattern**: Follow existing login route pattern (`src/app/api/auth/login/route.ts`)
- **Cookie Management**: Use same cookie handling as login (via `@supabase/ssr`)
- **Error Handling**: Always return success to client (graceful degradation)
- **Idempotency**: Logout should be safe to call multiple times

### Key Requirements
- ✅ Logout must be idempotent
- ✅ Must clear all Supabase session cookies
- ✅ Must clear `sb-remember-me` cookie
- ✅ Must NOT clear cart data (preserve for guest checkout)
- ✅ Must show confirmation dialog before logout
- ✅ Must warn about unsaved changes if detected
- ✅ Must track logout events for analytics
- ✅ Must show loading state during logout
- ✅ Must work even if API fails (graceful degradation)
- ✅ Must preserve locale in redirects

### Estimated Effort
**10-14 hours (1.5-2 days)**

### Related Context
- Planning document: `.cursor/sessions/context_session_logout_session_function.md`
- Existing login implementation: `src/app/api/auth/login/route.ts`
- Supabase client setup: `src/lib/supabase/server.ts` and `src/lib/supabase/client.ts`
