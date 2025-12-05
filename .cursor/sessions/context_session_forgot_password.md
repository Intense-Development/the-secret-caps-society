# Context Session: Forgot Password Flow

## Feature Request
Implement a complete Forgot Password flow including:
- Frontend view for password reset request
- Backend endpoint integration with Supabase
- Email verification and password reset flow

## Status
✅ **PLAN COMPLETE** - Ready for implementation

All planning phases completed. Detailed implementation plans available in:
- `.cursor/doc/forgot_password/backend_advice.md` (Complete backend implementation)
- `.cursor/doc/forgot_password/frontend_advice.md` (Complete frontend implementation)

## User Decisions ✅

**Quick Decisions:**
1. **Redirect URL:** B) Environment-based (`NEXT_PUBLIC_APP_URL`)
2. **Email Template:** B) Needs setup in Supabase dashboard
3. **Rate Limiting:** B) Client-side only (button disabled after submit)
4. **After Reset:** B) Redirect to login page with success message
5. **Languages:** C) All three (English, Spanish, Arabic)

**Technical:**
6. **Token Validation:** C) Both (frontend for UX, backend for security)
7. **Error Messages:** C) Hybrid (generic for email, specific for validation)
8. **Testing Level:** C) Unit + Integration + E2E tests
9. **Email Confirmation:** A) Required for signup
10. **Session Handling:** B) Invalidate all sessions after password change

## Timeline
- Created: December 5, 2025
- Planning Completed: December 5, 2025
- Status: **READY FOR IMPLEMENTATION**

## Summary

✅ **Complete implementation plan created**
- 4 new files to create (2 API routes, 2 pages)
- 4 files to update (validation + i18n)
- Full backend and frontend specifications
- Comprehensive testing strategy
- Security best practices implemented
- Estimated time: 8-12 hours

📚 **Documentation Created:**
- Main plan: `.cursor/doc/forgot_password/IMPLEMENTATION_PLAN.md`
- Backend: `.cursor/doc/forgot_password/backend_advice.md`
- Frontend: `.cursor/doc/forgot_password/frontend_advice.md`

---

## Exploration Notes

### Current State Analysis

**✅ What Exists:**
- Login page (`src/app/[locale]/login/page.tsx`) has a "Forgot password?" link (line 215) pointing to `/forgot-password`
- Supabase authentication is fully integrated with `@supabase/ssr`
- Auth validation using Zod schemas in `src/lib/validations/auth.ts`
- Login API route pattern established in `src/app/api/auth/login/route.ts`
- Server/client Supabase clients properly configured

**❌ What's Missing:**
1. `/forgot-password` page (frontend) - link exists but page doesn't
2. `/reset-password` page - for when user clicks email link
3. API route `/api/auth/forgot-password` - to request password reset
4. API route `/api/auth/reset-password` - to update password after verification
5. Zod validation schemas for password reset flow
6. Email templates configuration in Supabase (if not already set)

### Technology Stack
- **Frontend**: Next.js 15.5.3, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui (Radix UI)
- **Auth**: Supabase Auth with SSR
- **Validation**: Zod
- **Forms**: react-hook-form
- **Testing**: Jest, React Testing Library, Playwright

### Key Patterns Identified
- Login uses both password and magic-link modes
- Error handling with custom `mapSupabaseError` function
- Cookie management for session persistence (remember me)
- Consistent validation with Zod schemas
- Form handling with react-hook-form + zodResolver
- Toast notifications for user feedback

## Team Selection

Based on the exploration, the following subagents should be involved:

### 1. **@hexagonal-backend-architect** 🔴
**Responsibility:** Design and plan backend API routes for password reset flow
**Tasks:**
- Design `/api/auth/forgot-password` route (POST)
- Design `/api/auth/reset-password` route (POST)
- Define validation schemas and error handling
- Integrate with Supabase Auth password reset methods
- Follow existing auth route patterns
- Ensure proper security measures (rate limiting considerations)

**Parallel Execution:** Can run in parallel with frontend-developer after initial architecture discussion

### 2. **@frontend-developer** 🔵  
**Responsibility:** Design and plan frontend pages and components for password reset flow
**Tasks:**
- Design `/forgot-password` page component
- Design `/reset-password` page component  
- Create Zod schemas for password reset forms
- Plan form validation and UX flows
- Design loading states and error handling
- Ensure consistency with existing login page patterns
- Plan internationalization (i18n) support

**Parallel Execution:** Can run in parallel with backend architect after understanding API contracts

### 3. **@ui-ux-analyzer** 🟦 (Optional - if time permits)
**Responsibility:** Review and provide feedback on password reset UX
**Tasks:**
- Analyze forgot password flow user experience
- Ensure visual consistency with login/register pages
- Validate accessibility compliance
- Review mobile responsiveness
- Suggest improvements for clarity and user guidance

**Parallel Execution:** Can run after frontend-developer creates initial designs

### 4. **@typescript-test-explorer** (For implementation phase - not planning)
**Responsibility:** Write comprehensive tests
**Tasks:**
- Unit tests for validation schemas
- API route integration tests
- E2E tests for complete password reset flow
- Component tests for form validation

## Implementation Plan (Draft - Pending Team Advice)

### User Flow Overview

```
1. User clicks "Forgot password?" on login page
   ↓
2. Navigate to /forgot-password page
   ↓
3. User enters email address
   ↓
4. POST to /api/auth/forgot-password
   ↓
5. Supabase sends password reset email
   ↓
6. User receives email with reset link
   ↓
7. User clicks link → /reset-password?token=xxx&type=recovery
   ↓
8. User enters new password + confirmation
   ↓
9. POST to /api/auth/reset-password with token
   ↓
10. Supabase validates token and updates password
   ↓
11. Redirect to /login with success message
```

### Files to Create

#### Frontend Components

**1. `src/app/[locale]/forgot-password/page.tsx`**
- Email input form
- Submit button with loading state
- Success message after submission
- Link back to login
- Consistent styling with login page
- i18n support (en, es, ar)

**2. `src/app/[locale]/reset-password/page.tsx`**
- Extract token from URL params
- Password input with strength indicator (reuse existing component)
- Confirm password input
- Submit button with loading state
- Token validation
- Success/error states
- Redirect to login after success

#### Backend API Routes

**3. `src/app/api/auth/forgot-password/route.ts`**
- POST endpoint
- Email validation
- Rate limiting considerations
- Call `supabase.auth.resetPasswordForEmail()`
- Configure redirect URL
- Error handling with mapSupabaseError
- Return generic success message (security best practice)

**4. `src/app/api/auth/reset-password/route.ts`**
- POST endpoint
- Validate new password meets requirements
- Verify token is valid
- Call `supabase.auth.updateUser()` with new password
- Handle Supabase errors
- Return success/error response

#### Validation Schemas

**5. Update `src/lib/validations/auth.ts`**
- Add `forgotPasswordSchema` (email only)
- Add `resetPasswordSchema` (password + confirmPassword)
- Reuse existing `passwordSchema` for validation
- Ensure password strength requirements

#### Internationalization

**6. Update message files**
- `messages/en.json` - Add forgot password messages
- `messages/es.json` - Spanish translations
- `messages/ar.json` - Arabic translations

### Technical Specifications

#### Supabase Methods to Use

```typescript
// For forgot password request
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${siteUrl}/reset-password`
})

// For password reset completion
await supabase.auth.updateUser({
  password: newPassword
})
```

#### Security Considerations

1. **Email Enumeration Protection**: Always return success message even if email doesn't exist
2. **Token Expiration**: Supabase tokens expire after 1 hour by default
3. **Rate Limiting**: Consider implementing rate limiting on forgot-password endpoint
4. **HTTPS Only**: Ensure reset links only work over HTTPS
5. **Single Use Tokens**: Supabase tokens are single-use by default

#### Error Handling Patterns

```typescript
// Generic success message (don't reveal if email exists)
"If an account exists with that email, you will receive a password reset link."

// Token validation errors
- "Reset link has expired. Please request a new one."
- "Invalid or expired reset token."
- "Password reset link has already been used."

// Password validation errors
- Reuse existing password schema validations
```

### Testing Strategy

#### Unit Tests
- Validation schema tests for forgot/reset password
- Password strength validation
- Token extraction from URL

#### Integration Tests  
- API route tests with mocked Supabase
- Test successful password reset flow
- Test error cases (invalid email, expired token, etc.)

#### E2E Tests (Playwright)
- Complete forgot password flow
- Email link clicking (may need to mock)
- Password reset and login with new password
- Error states and validation

### Consistency Checklist

- [ ] Match login page visual design
- [ ] Use same form components and patterns
- [ ] Consistent error message display (toast)
- [ ] Same loading states (Loader2 icon)
- [ ] Same navigation patterns (back to login link)
- [ ] Responsive design
- [ ] Dark mode support
- [ ] Accessibility (ARIA labels, keyboard navigation)

### Dependencies

**Existing Components to Reuse:**
- `PasswordStrengthIndicator` - Already exists
- Button, Input, Label from shadcn/ui
- Toast for notifications
- Card components for layout

**No New Dependencies Required** ✅

## Clarifications Needed

### 🔍 Questions for User Decision

#### 1. **Email Redirect URL Configuration**
When Supabase sends the password reset email, where should the link redirect to?

**A)** Production URL only: `https://your-domain.com/reset-password`
**B)** Environment-based: Use `NEXT_PUBLIC_APP_URL` env variable (supports local dev + production)  
**C)** Multiple environments: Different URLs for dev, staging, production

**Recommendation:** Option B - Most flexible for development and deployment

---

#### 2. **Password Reset Email Template**
Does Supabase already have a custom email template configured for password reset?

**A)** Yes, already configured in Supabase dashboard
**B)** No, needs to be configured (requires Supabase dashboard access)
**C)** Not sure, need to check

**Note:** If B or C, the implementation plan should include instructions for configuring the email template in Supabase.

---

#### 3. **Rate Limiting Strategy**
How should we handle potential abuse of the forgot password endpoint?

**A)** No rate limiting for now (rely on Supabase's built-in protection)
**B)** Client-side only (button disabled for X seconds after submission)
**C)** Server-side rate limiting (requires additional implementation)
**D)** Both client and server-side

**Recommendation:** Option B for MVP (simple, effective), Option D for production

---

#### 4. **User Experience After Password Reset**
After successfully resetting password, what should happen?

**A)** Automatic login + redirect to dashboard
**B)** Redirect to login page with success message (user must login)
**C)** Show success message on reset page with "Login" button

**Recommendation:** Option B - More secure, follows best practices

---

#### 5. **Internationalization Priority**
Which languages need to be supported immediately?

**A)** English only for MVP, i18n later
**B)** English + Spanish  
**C)** English + Spanish + Arabic (all three)

**Recommendation:** Option C if messages already exist for other features, Option A for fastest MVP

---

#### 6. **Token Validation Location**  
When user clicks reset link, where should token validation happen?

**A)** Frontend validates on page load (check with Supabase before showing form)
**B)** Backend validates on password submission only
**C)** Both (frontend for UX, backend for security)

**Recommendation:** Option C - Best user experience and security

---

#### 7. **Error Message Detail Level**
How specific should error messages be?

**A)** Generic messages only (security-first, no info disclosure)
**B)** Detailed messages for better UX (e.g., "Email not found")
**C)** Hybrid (generic for email, specific for password requirements)

**Recommendation:** Option A for email enumeration protection, Option C overall

---

#### 8. **Testing Coverage**
What level of testing is required before considering this complete?

**A)** Unit tests only (validation schemas, utility functions)
**B)** Unit + Integration tests (API routes)
**C)** Unit + Integration + E2E tests (full user flow)
**D)** All of the above + manual testing checklist

**Recommendation:** Option C minimum, Option D for production-ready

---

### 🔧 Technical Clarifications

#### 9. **Existing Supabase Configuration**
Is Supabase email confirmation currently required for new users?

**A)** Yes, email confirmation is required
**B)** No, users can login immediately after signup
**C)** Not sure

**Why it matters:** Affects whether we need to handle unverified email scenarios in password reset flow.

---

#### 10. **Session Handling**
After password reset, what happens to existing user sessions?

**A)** Keep all existing sessions active
**B)** Invalidate all sessions (user must re-login everywhere)
**C)** Let Supabase handle default behavior

**Recommendation:** Option B - More secure (force re-login after password change)

## Iterations

### Iteration 1 - Initial Exploration & Planning ✅
- Status: **COMPLETE - Awaiting User Feedback**
- Focus: Understanding current auth implementation
- Completed:
  - ✅ Analyzed existing authentication setup
  - ✅ Identified missing components
  - ✅ Selected team of subagents  
  - ✅ Created draft implementation plan
  - ✅ Prepared clarification questions
- Next: User answers clarification questions → Get subagent advice → Finalize plan

### Iteration 2 - Subagent Consultation ✅
- Status: **COMPLETE**
- Focus: Get expert advice from @hexagonal-backend-architect and @frontend-developer
- Completed:
  - ✅ Backend architect provided complete API route implementation
  - ✅ Frontend developer provided complete page implementations
  - ✅ Security best practices documented
  - ✅ Testing strategies defined
  - ✅ i18n messages created for all three languages

### Iteration 3 - Plan Finalization ✅
- Status: **COMPLETE**
- Focus: Incorporate feedback and create final implementation plan
- Result: **COMPREHENSIVE IMPLEMENTATION PLAN READY**

