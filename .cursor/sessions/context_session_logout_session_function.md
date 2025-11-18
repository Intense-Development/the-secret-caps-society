# Logout Session Function Implementation Plan

**Feature**: Logout Session Function
**Date**: December 2024
**Status**: ✅ PLANNING COMPLETE - Ready for Implementation
**Estimated Effort**: 10-14 hours (1.5-2 days)

## Overview
This session tracks the planning and implementation of the logout session function for The Secret Caps Society application.

## Exploration Findings

### Current State Analysis

#### Existing Infrastructure
1. **Authentication Framework**: Supabase Auth is configured
   - Browser client: `src/lib/supabase/client.ts` using `createBrowserClient`
   - Server client: `src/lib/supabase/server.ts` using `createServerClient` with SSR cookies
   - Uses `@supabase/ssr` for server-side auth with cookies
   - JWT-based authentication with cookie-based session management

2. **Login Implementation**: Already exists at `src/app/api/auth/login/route.ts`
   - Handles password and magic-link authentication
   - Sets session cookies via Supabase SSR
   - Sets `sb-remember-me` cookie for persistent sessions
   - Returns user data and session expiration

3. **Session Management**:
   - Sessions stored in Supabase Auth
   - Cookies managed via `@supabase/ssr` cookie handlers
   - Middleware (`middleware.ts`) handles auth state checks and redirects
   - Navbar component checks auth state via `supabase.auth.getSession()`

4. **Current Auth State**:
   - No logout functionality exists (confirmed via grep search)
   - Navbar shows dashboard link when authenticated, login/signup when not
   - Dashboard page redirects to login if no user session

5. **API Route Pattern**: 
   - Routes follow Next.js App Router pattern: `src/app/api/auth/{action}/route.ts`
   - Use `NextRequest`/`NextResponse` for handling
   - Consistent error response structure with `buildErrorResponse` helper
   - Cookie management via `createServerClient` with cookie handlers

#### Technology Stack
- **Framework**: Next.js 15.5.3 with App Router
- **React**: 19.1.0
- **Auth**: Supabase Auth + PostgreSQL
- **Session Management**: `@supabase/ssr` with cookie-based sessions
- **Validation**: Zod 4.1.11
- **Testing**: Jest (unit) + Playwright (E2E)
- **Architecture**: Clean Architecture (domain/application/infrastructure layers)

#### Code Standards (from CODE_RULES.md)
- TDD approach mandatory
- Test-first development
- Clean architecture separation
- Server components by default, client components when needed
- Proper error handling and logging
- Accessibility requirements
- i18n support (next-intl)

## Team Selection

### Subagents to Consult

1. **Frontend Developer** (`frontend-developer.md`)
   - Advice on: Client-side logout implementation, UI/UX for logout button placement, state management after logout
   - Questions: Where should logout button be placed? How to handle client-side state cleanup?

2. **Frontend Test Engineer** (`frontend-test-engineer.md`)
   - Advice on: Testing logout functionality, E2E test scenarios, component testing patterns
   - Questions: What test cases are needed? How to test cookie cleanup?

3. **TypeScript Test Explorer** (`typescript-test-explorer.md`)
   - Advice on: API route testing patterns, mocking Supabase signOut, test structure
   - Questions: How to properly mock Supabase auth.signOut()? What edge cases to test?

## Plan

### Overview
This plan implements a complete logout session function with:
- Backend API route for server-side session termination
- Client-side logout functionality
- UI integration (logout button in Navbar and Dashboard)
- Proper cookie cleanup
- State management updates
- Comprehensive test coverage (unit + E2E)
- i18n support

### Implementation Phases

---

## PHASE 1: BACKEND API ROUTE (TDD)

### 1.1 Unit Tests for Logout API (WRITE FIRST)
**File**: `src/__tests__/api/auth/logout.test.ts`

**Test Cases**:
```typescript
describe('POST /api/auth/logout', () => {
  // Success scenarios
  it('should return 200 and clear session cookies on successful logout')
  it('should call supabase.auth.signOut() to invalidate session')
  it('should clear all Supabase auth cookies')
  it('should clear sb-remember-me cookie')
  it('should return success response with message')
  
  // Edge cases
  it('should handle logout when no session exists (idempotent)')
  it('should handle logout when already logged out')
  it('should handle Supabase signOut errors gracefully')
  
  // Cookie management
  it('should set cookies with maxAge 0 to delete them')
  it('should preserve cookie path and domain settings')
  it('should handle cookie deletion errors gracefully')
  
  // Response format
  it('should match expected response structure')
  it('should return consistent success message')
})
```

### 1.2 Implement Logout API Route
**File**: `src/app/api/auth/logout/route.ts`

**Structure**:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { CookieOptions } from '@supabase/ssr'

type CookieToSet = {
  name: string
  value: string
  options: CookieOptions
}

export async function POST(request: NextRequest) {
  try {
    const cookiesToSet: CookieToSet[] = []
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookies) => {
            cookies.forEach((cookie) => cookiesToSet.push(cookie))
          },
        },
      }
    )

    // Sign out from Supabase (idempotent - safe to call even if no session)
    const { error } = await supabase.auth.signOut()

    // Build response
    const response = NextResponse.json({
      success: true,
      message: 'Successfully logged out',
    })

    // Clear all Supabase auth cookies by setting them with maxAge 0
    cookiesToSet.forEach(({ name, options }) => {
      response.cookies.set(name, '', {
        ...options,
        maxAge: 0,
        expires: new Date(0),
      })
    })

    // Clear sb-remember-me cookie
    response.cookies.set('sb-remember-me', '', {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      secure: true,
      maxAge: 0,
      expires: new Date(0),
    })

    // Log error but don't fail the request (logout should always succeed)
    if (error) {
      console.error('Logout API error:', error)
      // Still return success - user is logged out from client perspective
    }

    return response
  } catch (error) {
    console.error('Logout API error:', error)
    // Return success even on error - ensure client can proceed
    return NextResponse.json({
      success: true,
      message: 'Logged out',
    })
  }
}
```

**Key Points**:
- Use same cookie handling pattern as login route
- Make logout idempotent (safe to call multiple times)
- Always return success to client (even if server error)
- Clear all Supabase cookies and sb-remember-me cookie
- Use maxAge: 0 and expires: new Date(0) to delete cookies

---

## PHASE 2: CLIENT-SIDE LOGOUT FUNCTIONALITY

### 2.1 Create Logout Service/Hook
**File**: `src/hooks/useLogout.ts`

**Structure** (Updated with requirements):
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

// Analytics tracking function (to be implemented)
function trackLogoutEvent(success: boolean, error?: string) {
  // TODO: Implement analytics tracking
  // Options: Vercel Analytics, Google Analytics, custom endpoint
  if (typeof window !== 'undefined') {
    // Example: window.gtag?.('event', 'logout', { success, error })
    console.log('Logout event:', { success, error })
  }
}

export function useLogout() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const logout = async () => {
    // Prevent multiple simultaneous logout calls
    if (isLoading) return

    setIsLoading(true)
    let apiSuccess = false
    
    try {
      // Call logout API
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      apiSuccess = response.ok

      if (!response.ok) {
        // Log error but continue with client-side logout
        console.error('Logout API error:', result.message)
      }
    } catch (error) {
      // Network error - continue with client-side logout
      console.error('Logout API network error:', error)
    }

    // Always clear client-side session (graceful degradation)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Client-side logout error:', error)
    }

    // Track analytics
    trackLogoutEvent(apiSuccess, apiSuccess ? undefined : 'API failed')

    // Show success message (even if API failed)
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    })

    // Redirect to home page
    router.push('/')
    router.refresh() // Refresh to update server components
    
    setIsLoading(false)
  }

  return { logout, isLoading }
}
```

**Key Features**:
- Added `isLoading` state to prevent concurrent logout calls
- Graceful degradation: clears client-side session even if API fails
- Analytics tracking for logout events
- Does NOT clear cart (preserved for guest checkout)
- Proper error handling with user-friendly messages

**Alternative**: If using Server Actions pattern:
**File**: `src/app/actions/auth.ts`
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
```

**Decision**: Use client-side hook approach to match existing patterns and allow for toast notifications.

---

## PHASE 3: UI INTEGRATION

### 3.1 Create Logout Confirmation Dialog Component
**File**: `src/components/auth/LogoutConfirmDialog.tsx`

**Structure**:
```typescript
'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useTranslations } from 'next-intl'

interface LogoutConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  hasUnsavedChanges?: boolean
  isLoading?: boolean
}

export function LogoutConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  hasUnsavedChanges = false,
  isLoading = false,
}: LogoutConfirmDialogProps) {
  const t = useTranslations('auth')

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('logout.confirmTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {hasUnsavedChanges
              ? t('logout.confirmWithChanges')
              : t('logout.confirmMessage')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t('common.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? t('common.loading') : t('logout.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

### 3.2 Create Hook for Unsaved Changes Detection
**File**: `src/hooks/useUnsavedChanges.ts`

**Structure**:
```typescript
'use client'

import { useEffect, useState } from 'react'

/**
 * Hook to detect unsaved changes in forms
 * Usage: Call setHasUnsavedChanges(true) when form is dirty
 */
export function useUnsavedChanges() {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Warn before page unload if there are unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  return { hasUnsavedChanges, setHasUnsavedChanges }
}
```

### 3.3 Update Logout Hook with Confirmation
**File**: `src/hooks/useLogout.ts` (Updated)

**Add confirmation dialog state**:
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

export function useLogout(hasUnsavedChanges: boolean = false) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const handleLogout = async () => {
    // Close dialog
    setShowConfirmDialog(false)
    
    // ... existing logout logic ...
  }

  const requestLogout = () => {
    // Show confirmation dialog
    setShowConfirmDialog(true)
  }

  return {
    logout: handleLogout,
    requestLogout,
    isLoading,
    showConfirmDialog,
    setShowConfirmDialog,
  }
}
```

### 3.4 Add Logout Button to Navbar
**File**: `src/components/Navbar.tsx`

**Changes**:
- Import `useLogout` hook and `LogoutConfirmDialog`
- Add logout button next to dashboard button when authenticated
- Add logout option in mobile menu
- Use LogOut icon from lucide-react
- Show confirmation dialog before logout

**Location**: Replace or add next to dashboard button:
```typescript
import { LogOut } from 'lucide-react'
import { useLogout } from '@/hooks/useLogout'
import { LogoutConfirmDialog } from '@/components/auth/LogoutConfirmDialog'

// Inside component:
const { requestLogout, logout, isLoading, showConfirmDialog, setShowConfirmDialog } = useLogout()

// In JSX:
{isAuthenticated ? (
  <>
    <Link href="/dashboard">
      <Button variant="default" size="sm" className="h-9">
        <LayoutDashboard className="h-4 w-4 mr-2" />
        {t("dashboard")}
      </Button>
    </Link>
    <Button 
      variant="ghost" 
      size="sm" 
      className="h-9"
      onClick={requestLogout}
      disabled={isLoading}
      aria-label={t("logout")}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4 mr-2" />
      )}
      {t("logout")}
    </Button>
    <LogoutConfirmDialog
      open={showConfirmDialog}
      onOpenChange={setShowConfirmDialog}
      onConfirm={logout}
      isLoading={isLoading}
    />
  </>
) : (
  // ... existing login/signup buttons
)}
```

**Key Features**:
- Confirmation dialog before logout
- Loading state with spinner icon
- Accessibility support
- Works in both desktop and mobile menu

### 3.2 Add Logout Button to Dashboard
**File**: `src/app/[locale]/dashboard/page.tsx` (or create a dashboard header component)

**Option A**: Add to dashboard page directly
**Option B**: Create `src/components/dashboard/DashboardHeader.tsx` component

**Recommendation**: Option B for reusability

**Structure**:
```typescript
'use client'

import { useLogout } from '@/hooks/useLogout'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function DashboardHeader({ userName }: { userName: string }) {
  const { logout } = useLogout()
  const t = useTranslations('dashboard')

  return (
    <header className="flex justify-between items-center">
      {/* ... existing header content ... */}
      <Button variant="outline" onClick={logout}>
        <LogOut className="h-4 w-4 mr-2" />
        {t('logout')}
      </Button>
    </header>
  )
}
```

### 3.5 Add i18n Translations
**Files**: 
- `messages/en.json`
- `messages/es.json`
- `messages/ar.json`

**Add translations**:
```json
{
  "nav": {
    "logout": "Log Out"
  },
  "auth": {
    "logout": {
      "confirmTitle": "Confirm Logout",
      "confirmMessage": "Are you sure you want to log out?",
      "confirmWithChanges": "You have unsaved changes. Are you sure you want to log out? Your changes will be lost.",
      "confirm": "Log Out"
    }
  },
  "common": {
    "cancel": "Cancel",
    "loading": "Loading..."
  }
}
```

---

## PHASE 4: TESTING

### 4.1 Unit Tests for Logout Hook
**File**: `src/__tests__/hooks/useLogout.test.ts`

**Test Cases**:
```typescript
describe('useLogout', () => {
  it('should call logout API endpoint')
  it('should clear Supabase client session')
  it('should show success toast on successful logout')
  it('should redirect to home page after logout')
  it('should show error toast on logout failure')
  it('should handle network errors gracefully')
})
```

### 4.2 Component Tests for Navbar Logout
**File**: `src/components/__tests__/Navbar.logout.test.tsx`

**Test Cases**:
```typescript
describe('Navbar Logout', () => {
  it('should show logout button when authenticated')
  it('should not show logout button when not authenticated')
  it('should call logout function when logout button clicked')
  it('should show logout button in mobile menu when authenticated')
})
```

### 4.3 E2E Tests
**File**: `e2e/logout.spec.ts`

**Test Cases**:
```typescript
describe('Logout Flow', () => {
  test('should successfully logout and redirect to home', async ({ page }) => {
    // Login first
    // Click logout button
    // Verify redirect to home
    // Verify user is logged out
  })

  test('should clear session cookies after logout', async ({ page, context }) => {
    // Login
    // Verify cookies exist
    // Logout
    // Verify cookies are cleared
  })

  test('should show logout button only when authenticated', async ({ page }) => {
    // Verify logout button not visible when not logged in
    // Login
    // Verify logout button visible
  })
})
```

---

## PHASE 5: EDGE CASES & ERROR HANDLING

### 5.1 Handle Concurrent Logout Requests
- Ensure logout is idempotent
- Prevent multiple simultaneous logout calls

### 5.2 Handle Network Failures
- Show appropriate error messages
- Ensure client-side state is cleared even if API fails

### 5.3 Handle Partial Failures
- If Supabase signOut fails, still clear cookies
- If cookie clearing fails, still invalidate session

### 5.4 Handle Redirect After Logout
- Redirect to home page
- Preserve locale in redirect URL
- Clear any redirectTo query params

---

## FILES TO CREATE

1. `src/app/api/auth/logout/route.ts` - Logout API endpoint
2. `src/__tests__/api/auth/logout.test.ts` - API route tests
3. `src/hooks/useLogout.ts` - Logout hook with confirmation
4. `src/hooks/useUnsavedChanges.ts` - Unsaved changes detection hook
5. `src/__tests__/hooks/useLogout.test.ts` - Hook tests
6. `src/__tests__/hooks/useUnsavedChanges.test.ts` - Unsaved changes hook tests
7. `src/components/auth/LogoutConfirmDialog.tsx` - Logout confirmation dialog
8. `src/components/__tests__/auth/LogoutConfirmDialog.test.tsx` - Dialog component tests
9. `src/components/__tests__/Navbar.logout.test.tsx` - Navbar logout tests
10. `src/lib/analytics.ts` - Analytics tracking utility (for logout events)
11. `e2e/logout.spec.ts` - E2E tests

## FILES TO MODIFY

1. `src/components/Navbar.tsx` - Add logout button
2. `messages/en.json` - Add logout translations
3. `messages/es.json` - Add logout translations
4. `messages/ar.json` - Add logout translations
5. `src/app/[locale]/dashboard/page.tsx` - Add logout button (or use DashboardHeader component)

## ESTIMATED EFFORT

- Backend API: 2-3 hours
- Client-side hook with confirmation: 2-3 hours
- Unsaved changes detection: 1 hour
- Confirmation dialog component: 1-2 hours
- Analytics tracking: 1 hour
- UI integration (Navbar + Dashboard): 2-3 hours
- Testing (unit + E2E): 4-5 hours
- **Total**: 10-14 hours (1.5-2 days)

## DEPENDENCIES

- Supabase Auth (`@supabase/ssr`)
- Next.js App Router
- React 19
- next-intl for translations
- shadcn/ui components
- Jest for unit tests
- Playwright for E2E tests

## Notes

- Follow TDD approach: write tests first
- Ensure logout is idempotent (safe to call multiple times)
- Always clear both server and client-side sessions
- Handle errors gracefully - logout should always "succeed" from user perspective (graceful degradation)
- Preserve locale in redirects
- Use existing patterns from login implementation
- **DO NOT clear cart** - preserve for guest checkout (Q6: C)
- Show confirmation dialog before logout (Q3: B)
- Warn about unsaved changes if detected (Q4: B)
- Track logout events for analytics (Q9: B)
- Show loading state during logout (Q8: C)
- Clear client-side session even if API fails (Q5: A)
- Design for future profile/settings page integration (Q1: C)

## Advice

### Frontend Developer Agent Advice

**Hook Structure Recommendations**:
1. **Hook Naming**: Use `useLogout` (not `useLogoutMutation`) since it's a business hook, not a React Query mutation hook
2. **Hook Location**: Place in `src/hooks/useLogout.ts` following the pattern of other business hooks
3. **Loading State**: Consider adding `isLoading` state to prevent multiple simultaneous logout calls:
   ```typescript
   const [isLoading, setIsLoading] = useState(false)
   ```
4. **Error Handling**: Ensure proper error boundaries and user feedback
5. **State Management**: The hook should handle both API call and client-side Supabase signOut

**UI Integration Recommendations**:
1. **Button Placement**: Add logout button next to dashboard button in Navbar (desktop) and in mobile menu
2. **Icon**: Use `LogOut` from `lucide-react` (already imported in Navbar)
3. **Button Variant**: Use `variant="ghost"` for logout to differentiate from primary actions
4. **Accessibility**: Ensure logout button has proper ARIA labels
5. **Mobile Menu**: Ensure logout button is accessible in mobile menu when authenticated

**Component Structure**:
- Keep logout logic in hook, not in component
- Components should only call `logout()` function
- Use existing toast pattern for user feedback

### Frontend Test Engineer Agent Advice

**Testing Patterns**:
1. **Hook Testing**: Use `renderHook` from `@testing-library/react`:
   ```typescript
   const { result } = renderHook(() => useLogout())
   ```
2. **Mocking Strategy**: 
   - Mock `fetch` for API calls
   - Mock `useRouter` from `next/navigation`
   - Mock `useToast` hook
   - Mock Supabase client's `signOut` method
3. **Component Testing**: Test Navbar logout button visibility and click behavior
4. **Test Structure**: Follow Arrange-Act-Assert pattern
5. **Async Testing**: Use `waitFor` for async operations

**Test Coverage Priorities**:
1. Happy path: successful logout flow
2. Error handling: API failures, network errors
3. Edge cases: concurrent logout calls, already logged out state
4. UI states: button visibility, loading states
5. Integration: cookie clearing, redirect behavior

**Mock Setup Example**:
```typescript
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}))

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))
```

### TypeScript Test Explorer Agent Advice

**API Route Testing**:
1. **Mock Pattern**: Follow existing login test pattern:
   ```typescript
   const mockSignOut = jest.fn()
   jest.mock('@supabase/ssr', () => ({
     createServerClient: jest.fn(() => ({
       auth: { signOut: mockSignOut },
     })),
   }))
   ```
2. **Cookie Testing**: Test cookie deletion by checking `maxAge: 0` and `expires: new Date(0)`
3. **Idempotency**: Test that logout can be called multiple times safely
4. **Error Scenarios**: Test Supabase errors, network failures, cookie deletion failures

**Edge Cases to Test**:
1. Logout when no session exists (should still succeed)
2. Logout when already logged out (idempotent)
3. Supabase signOut returns error (should still clear cookies)
4. Cookie deletion fails (should still invalidate session)
5. Concurrent logout requests (should handle gracefully)
6. Network timeout during logout
7. Invalid response from API

**Test Structure**:
```typescript
describe('POST /api/auth/logout', () => {
  describe('Success scenarios', () => { /* ... */ })
  describe('Edge cases', () => { /* ... */ })
  describe('Error handling', () => { /* ... */ })
  describe('Cookie management', () => { /* ... */ })
})
```

**Additional Test Considerations**:
- Test that all Supabase cookies are cleared (not just one)
- Test that `sb-remember-me` cookie is cleared
- Test response structure matches expected format
- Test that errors are logged but don't fail the request
- Test cookie path and domain preservation during deletion

## Clarification Answers

**User Requirements Summary**:
- **Q1: C** - Logout from Navbar + Dashboard + User profile/settings (plan for future profile page)
- **Q2: A** - Redirect to home page (`/`) after logout
- **Q3: B** - Show confirmation dialog before logging out
- **Q4: B** - Warn user about unsaved changes before logout
- **Q5: A** - Clear client-side session even if API fails (graceful degradation)
- **Q6: C** - Clear only session data, keep cart for guest checkout
- **Q7: A** - Show logout button in Navbar on all authenticated pages
- **Q8: C** - Show loading state during logout process
- **Q9: B** - Track logout events/analytics

## Updated Plan Based on Requirements

### Key Changes to Implementation:

1. **Confirmation Dialog**: Use `AlertDialog` component for logout confirmation
2. **Unsaved Changes Detection**: Add hook to detect unsaved form changes
3. **Analytics Tracking**: Add event tracking for logout events
4. **Cart Preservation**: Do NOT clear cart on logout (keep for guest checkout)
5. **Loading States**: Show loading indicator during logout
6. **Graceful Degradation**: Clear client-side session even if API fails
7. **Future-Proof**: Design logout hook to work in profile/settings pages when added

## Final Implementation Plan Summary

### Core Features
✅ **Backend API Route** (`/api/auth/logout`)
- Idempotent logout endpoint
- Clears Supabase session cookies
- Clears `sb-remember-me` cookie
- Graceful error handling

✅ **Client-Side Logout Hook** (`useLogout`)
- Confirmation dialog integration
- Loading state management
- Graceful degradation (works even if API fails)
- Analytics event tracking
- Does NOT clear cart (preserved for guest checkout)

✅ **Confirmation Dialog** (`LogoutConfirmDialog`)
- Uses shadcn/ui AlertDialog
- Warns about unsaved changes
- Loading state during logout
- i18n support

✅ **Unsaved Changes Detection** (`useUnsavedChanges`)
- Detects form dirty state
- Warns before page unload
- Integrates with logout confirmation

✅ **UI Integration**
- Logout button in Navbar (desktop + mobile)
- Logout button in Dashboard
- Future-ready for profile/settings pages
- Loading indicators
- Accessibility support

✅ **Analytics Tracking**
- Logout event tracking
- Success/failure tracking
- Extensible for future analytics providers

✅ **Testing**
- Unit tests for API route
- Unit tests for hooks
- Component tests
- E2E tests for complete flow

### Implementation Order (TDD)
1. Write API route tests → Implement API route
2. Write hook tests → Implement logout hook
3. Write dialog tests → Implement confirmation dialog
4. Write component tests → Integrate in Navbar
5. Write E2E tests → Verify complete flow

### Key Design Decisions
- **Cart Preservation**: Cart data remains in localStorage after logout (Q6: C)
- **Confirmation Required**: Always show confirmation dialog (Q3: B)
- **Unsaved Changes**: Warn user if form has unsaved changes (Q4: B)
- **Graceful Degradation**: Clear client-side session even if API fails (Q5: A)
- **Analytics**: Track all logout events (Q9: B)
- **Loading States**: Show loading indicator during logout (Q8: C)

## Implementation Status

⏳ **READY FOR IMPLEMENTATION**

The plan is complete and ready for implementation. All requirements have been clarified and incorporated into the design.

**Next Steps**:
1. Start with TDD approach - write tests first
2. Implement backend API route
3. Implement client-side hook
4. Create confirmation dialog component
5. Integrate into UI components
6. Add analytics tracking
7. Write comprehensive tests
8. Update documentation

