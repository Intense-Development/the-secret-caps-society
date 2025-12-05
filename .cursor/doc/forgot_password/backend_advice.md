# Backend Architecture Advice: Password Reset Flow

**Consultant:** @hexagonal-backend-architect  
**Date:** December 5, 2025

## Architecture Decision

For authentication flows, **keep it simple** and implement directly in API route handlers. Auth is an infrastructure concern (Supabase Auth adapter), and creating a full hexagonal architecture for this would be over-engineering.

**Rationale:**
- Auth is already an infrastructure layer (Supabase)
- No complex business logic to abstract
- Direct API integration is clearer for auth flows
- Follows existing login/logout pattern in the codebase

## Implementation Plan

### File Structure

```
src/app/api/auth/
├── forgot-password/
│   └── route.ts          (NEW)
└── reset-password/
    └── route.ts          (NEW)
```

### 1. POST /api/auth/forgot-password/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { z } from 'zod'
import { emailSchema } from '@/lib/validations/auth'

// Validation schema
const forgotPasswordSchema = z.object({
  email: emailSchema,
})

// Helper for consistent error responses
function buildErrorResponse(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  )
}

// Helper for success responses
function buildSuccessResponse(message: string) {
  return NextResponse.json(
    {
      success: true,
      message,
    },
    { status: 200 }
  )
}

export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate request body
    const rawBody = await request.json()
    const validationResult = forgotPasswordSchema.safeParse(rawBody)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email format',
          errors: validationResult.error.flatten(),
        },
        { status: 400 }
      )
    }

    const { email } = validationResult.data

    // 2. Initialize Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: () => {}, // No cookies to set for this endpoint
        },
      }
    )

    // 3. Generate redirect URL (environment-based)
    const redirectUrl = 
      process.env.NEXT_PUBLIC_APP_URL 
        ? `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`
        : `${request.nextUrl.origin}/reset-password`

    // 4. Request password reset email from Supabase
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    })

    // 5. IMPORTANT: Always return success to prevent email enumeration
    // Even if the email doesn't exist, we return the same message
    if (error) {
      console.error('[FORGOT_PASSWORD_ERROR]', {
        message: error.message,
        status: error.status,
        timestamp: new Date().toISOString(),
      })
    }

    // Generic success message (security best practice)
    return buildSuccessResponse(
      'If an account exists with that email, you will receive a password reset link.'
    )

  } catch (error) {
    console.error('[FORGOT_PASSWORD_EXCEPTION]', error)
    
    return buildErrorResponse(
      'An unexpected error occurred. Please try again.',
      500
    )
  }
}
```

### 2. POST /api/auth/reset-password/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { z } from 'zod'
import { passwordSchema } from '@/lib/validations/auth'

// Validation schema
const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

function buildErrorResponse(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    {
      success: false,
      message,
      ...(details && { details }),
    },
    { status }
  )
}

function buildSuccessResponse(message: string) {
  return NextResponse.json(
    {
      success: true,
      message,
    },
    { status: 200 }
  )
}

// Map Supabase errors to user-friendly messages
function mapResetPasswordError(error: string): string {
  if (error.includes('expired') || error.includes('token')) {
    return 'This password reset link has expired or is invalid. Please request a new one.'
  }
  if (error.includes('same password')) {
    return 'New password must be different from your current password.'
  }
  return 'Failed to reset password. Please try again.'
}

export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate request body
    const rawBody = await request.json()
    const validationResult = resetPasswordSchema.safeParse(rawBody)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Password validation failed',
          errors: validationResult.error.flatten(),
        },
        { status: 400 }
      )
    }

    const { password } = validationResult.data

    // 2. Initialize Supabase client with cookie handling
    const cookiesToSet: Array<{
      name: string
      value: string
      options: Record<string, unknown>
    }> = []

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

    // 3. Verify user is authenticated (token in session from email link)
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return buildErrorResponse(
        'Invalid or expired password reset link.',
        401
      )
    }

    // 4. Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    })

    if (updateError) {
      console.error('[RESET_PASSWORD_ERROR]', {
        userId: user.id,
        error: updateError.message,
        timestamp: new Date().toISOString(),
      })

      return buildErrorResponse(
        mapResetPasswordError(updateError.message),
        400
      )
    }

    // 5. Log successful password reset (security audit)
    console.info('[RESET_PASSWORD_SUCCESS]', {
      userId: user.id,
      timestamp: new Date().toISOString(),
    })

    // 6. Supabase automatically invalidates other sessions when password changes
    // The current session from the reset token will also be invalidated

    // 7. Return success response with new cookies
    const response = buildSuccessResponse(
      'Password updated successfully. Please log in with your new password.'
    )

    // Set cookies for the response
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options)
    })

    return response

  } catch (error) {
    console.error('[RESET_PASSWORD_EXCEPTION]', error)
    
    return buildErrorResponse(
      'An unexpected error occurred. Please try again.',
      500
    )
  }
}
```

## Security Best Practices

### 1. Email Enumeration Protection ✅
- **Implementation:** Always return same success message regardless of whether email exists
- **Why:** Prevents attackers from discovering which emails are registered

### 2. Token Security ✅
- **Supabase Handles:**
  - Token generation (cryptographically secure)
  - Token expiration (1 hour default)
  - Single-use tokens (can't be reused)
  - Token validation
- **Our Responsibility:**
  - Validate user session exists before password update
  - Use HTTPS for redirect URLs in production

### 3. Session Invalidation ✅
- **Automatic:** Supabase automatically invalidates all sessions when `updateUser({ password })` is called
- **Effect:** User must re-login on all devices
- **Security Benefit:** If attacker triggered reset, old sessions are killed

### 4. Rate Limiting
- **Client-Side:** Button disabled for 60 seconds (implemented in frontend)
- **Supabase Built-in:** Has rate limiting on auth endpoints
- **Recommendation:** Sufficient for MVP, consider server-side for production

### 5. Logging for Security Audit ✅
- Log failed attempts (with errors)
- Log successful password resets
- Include timestamps and user IDs
- Don't log passwords or tokens

## Environment Variables Required

Add to `.env.local`:

```bash
# Should already exist
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Add this for proper redirect URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000  # dev
# NEXT_PUBLIC_APP_URL=https://yourdomain.com  # production
```

## Token Flow Explanation

**How the token gets from URL to session:**

1. User receives email with link: `https://yourapp.com/reset-password?token=xxx&type=recovery`
2. Supabase automatically validates token when user visits the page
3. If valid, Supabase creates a temporary session with the token
4. This session is stored in cookies (handled by Supabase SSR)
5. When user submits new password, `supabase.auth.getUser()` retrieves user from this session
6. After password update, this temporary session is invalidated

**Frontend doesn't need to manually handle the token!** Supabase SSR handles it automatically through cookies.

## Error Handling Strategy

### Forgot Password Errors:
```typescript
// Client receives same message for all cases:
{
  success: true,
  message: "If an account exists with that email, you will receive a password reset link."
}
```

### Reset Password Errors:
```typescript
// Invalid/expired token
{
  success: false,
  message: "This password reset link has expired or is invalid. Please request a new one."
}

// Validation errors
{
  success: false,
  message: "Password validation failed",
  errors: { fieldErrors: { password: ["..."], confirmPassword: ["..."] } }
}

// Same password
{
  success: false,
  message: "New password must be different from your current password."
}
```

## Testing Strategy

### Unit Tests (Jest)
```typescript
// Test validation schemas
describe('forgotPasswordSchema', () => {
  it('validates correct email', () => {
    // ...
  })
  
  it('rejects invalid email', () => {
    // ...
  })
})

// Test error mapping
describe('mapResetPasswordError', () => {
  it('maps expired token error', () => {
    // ...
  })
})
```

### Integration Tests
```typescript
// Mock Supabase client
// Test API routes with various scenarios
describe('POST /api/auth/forgot-password', () => {
  it('returns success for valid email', async () => {
    // ...
  })
  
  it('returns success even for non-existent email', async () => {
    // Security test
  })
})
```

### E2E Tests (Playwright)
- Complete flow from forgot password to reset
- May need to mock email or use Supabase test helpers

## Supabase Dashboard Configuration

**Required Setup:**

1. **Email Templates** (Supabase Dashboard → Authentication → Email Templates)
   - Select "Reset Password" template
   - Customize template if needed
   - Ensure it includes the `{{ .ConfirmationURL }}` token
   - Default template works fine

2. **Site URL** (Supabase Dashboard → Authentication → URL Configuration)
   - Set "Site URL" to your production domain
   - Add redirect URLs for development (localhost:3000)

3. **Email Provider** (if not using Supabase's default)
   - Configure SMTP settings if using custom email provider

## FAQ

**Q: Do we need to check if email is confirmed before sending reset email?**
A: No, Supabase only sends reset emails to confirmed emails automatically.

**Q: Can users reset password multiple times?**
A: Yes, but only the most recent reset link will work (previous ones are invalidated).

**Q: What if user clicks expired link?**
A: Frontend will detect no valid session, show error message, link to request new reset.

**Q: Should we add rate limiting beyond client-side?**
A: Supabase has built-in rate limiting. For MVP, client-side is sufficient. For production, consider adding server-side.

## Integration Checklist

- [ ] Create `/api/auth/forgot-password/route.ts`
- [ ] Create `/api/auth/reset-password/route.ts`
- [ ] Add `NEXT_PUBLIC_APP_URL` to `.env.local`
- [ ] Configure Supabase email template
- [ ] Add redirect URLs in Supabase dashboard
- [ ] Test with real email (use your own email for testing)
- [ ] Verify token expiration (wait 1 hour, test expired link)
- [ ] Test session invalidation (login on two devices, reset password, verify both logged out)

## Next Steps for Implementation

1. Create the two API route files
2. Update `.env.local` with `NEXT_PUBLIC_APP_URL`
3. Configure Supabase dashboard (email templates)
4. Test with curl or Postman before frontend integration
5. Implement frontend pages (in parallel)
6. Integration testing
7. E2E testing

