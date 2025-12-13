# Backend Requirements: Password Reset Flow

## Context
Implementing forgot password and reset password functionality using Supabase Auth in a Next.js 15 App Router application following hexagonal architecture patterns.

## User Decisions
- Environment-based redirect URLs (using `NEXT_PUBLIC_APP_URL`)
- Client-side rate limiting (button disabled after submit)
- Redirect to login after successful reset
- Hybrid error messages (generic for email enumeration, specific for validation)
- Both frontend and backend token validation
- Invalidate all sessions after password change
- Email confirmation required for signup

## Required API Routes

### 1. POST /api/auth/forgot-password
**Purpose:** Request password reset email

**Request Body:**
```typescript
{
  email: string
}
```

**Responsibilities:**
- Validate email format with Zod
- Call Supabase `resetPasswordForEmail()`
- Configure redirect URL from `NEXT_PUBLIC_APP_URL`
- Always return success message (prevent email enumeration)
- Handle Supabase errors gracefully

**Success Response:**
```typescript
{
  success: true,
  message: "If an account exists with that email, you will receive a password reset link."
}
```

### 2. POST /api/auth/reset-password
**Purpose:** Complete password reset with token

**Request Body:**
```typescript
{
  password: string,
  confirmPassword: string
}
```

**Responsibilities:**
- Validate password meets strength requirements
- Verify passwords match
- Extract and validate token from session/cookies
- Call Supabase `updateUser({ password })`
- Invalidate all user sessions
- Handle token expiration/invalid token errors

**Success Response:**
```typescript
{
  success: true,
  message: "Password updated successfully"
}
```

## Existing Patterns to Follow

### From `src/app/api/auth/login/route.ts`:
- Use `createServerClient` from `@supabase/ssr` with cookie handling
- Use `mapSupabaseError` for consistent error messages
- Return NextResponse with proper status codes
- Cookie management pattern for session handling

### Validation Pattern:
- Use Zod schemas from `src/lib/validations/auth.ts`
- Reuse existing `passwordSchema` and `emailSchema`
- Return structured validation errors

### Error Handling:
- Use `buildErrorResponse` helper function
- Map Supabase errors to user-friendly messages
- Return appropriate HTTP status codes

## Security Requirements

1. **Email Enumeration Protection:** Always return same success message
2. **Token Security:** Supabase handles token generation, expiration (1 hour)
3. **Session Management:** Invalidate all sessions after password change
4. **HTTPS Only:** Ensure redirect URLs use HTTPS in production
5. **Input Validation:** Strict Zod validation for all inputs

## Supabase Methods to Use

```typescript
// Forgot password
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`
})

// Reset password (after token validation)
const { data, error } = await supabase.auth.updateUser({
  password: newPassword
})

// Get current session (for token validation)
const { data: { session } } = await supabase.auth.getSession()
```

## Questions for Backend Architect

1. Should we create a service layer following hexagonal architecture, or keep it simple in route handlers given this is auth (infrastructure concern)?

2. How should we handle the token extraction? The token comes in the URL from email, but how does it get into the session?

3. Should we implement server-side rate limiting beyond client-side, or rely on Supabase's built-in protection?

4. How do we properly invalidate all sessions after password change? Does Supabase handle this automatically with `updateUser()`?

5. Should we add logging for security events (password reset requests, successful resets)?

6. What's the best way to handle the redirect URL configuration for different environments (dev, staging, production)?

**Please provide:**
- Detailed implementation plan for both API routes
- Code structure following hexagonal architecture (if applicable)
- Error handling strategy
- Security best practices specific to this flow
- Integration with existing auth patterns

