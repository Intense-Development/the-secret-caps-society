# Password Reset Flow - Complete Implementation Plan

**Feature:** Forgot Password & Reset Password  
**Date:** December 5, 2025  
**Status:** ✅ Planning Complete - Ready for Implementation

---

## Executive Summary

This document provides a complete implementation plan for adding password reset functionality to The Secret Caps Society marketplace. The feature will allow users to reset their passwords via email using Supabase Auth.

### Scope

**What's Included:**
- ✅ Request password reset page (`/forgot-password`)
- ✅ Reset password page (`/reset-password`)
- ✅ Backend API routes with Supabase integration
- ✅ Email-based password reset flow
- ✅ Full internationalization (English, Spanish, Arabic)
- ✅ Security best practices (email enumeration protection, session invalidation)
- ✅ Client-side rate limiting
- ✅ Comprehensive testing strategy

**What's NOT Included:**
- ❌ Admin password reset (out of scope)
- ❌ SMS-based password reset
- ❌ Password history tracking
- ❌ Server-side rate limiting (future enhancement)

---

## Implementation Overview

### Files to Create (4 new files)

1. **`src/app/api/auth/forgot-password/route.ts`** - Request reset email API
2. **`src/app/api/auth/reset-password/route.ts`** - Complete reset API  
3. **`src/app/[locale]/forgot-password/page.tsx`** - Request reset page
4. **`src/app/[locale]/reset-password/page.tsx`** - Reset password page

### Files to Update (4 files)

1. **`src/lib/validations/auth.ts`** - Add validation schemas
2. **`messages/en.json`** - English translations
3. **`messages/es.json`** - Spanish translations
4. **`messages/ar.json`** - Arabic translations

### Environment Variables Required

```bash
# Add to .env.local (if not already present)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Update for production
```

### External Configuration Required

**Supabase Dashboard Setup:**
1. Configure email template for password reset
2. Add redirect URLs for all environments
3. Verify email provider is working

---

## User Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User clicks "Forgot password?" on login page             │
│    └─> Navigate to /forgot-password                         │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 2. User enters email address                                │
│    └─> POST /api/auth/forgot-password                       │
│    └─> Supabase sends reset email                           │
│    └─> Show success message (always)                        │
│    └─> Button disabled for 60 seconds (rate limit)          │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 3. User receives email with reset link                      │
│    Example: https://yourapp.com/reset-password?token=xxx    │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 4. User clicks link → reset-password page loads             │
│    └─> Validate token exists in URL                         │
│    └─> Supabase validates token via cookies (automatic)     │
│    └─> Show password reset form OR error                    │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 5. User enters new password + confirmation                  │
│    └─> Real-time password strength indicator                │
│    └─> Client-side validation                               │
│    └─> POST /api/auth/reset-password                        │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 6. Backend validates token & updates password               │
│    └─> Supabase.auth.updateUser({ password })               │
│    └─> All user sessions invalidated                        │
│    └─> Return success                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 7. Frontend redirects to /login                             │
│    └─> Show success toast                                   │
│    └─> User must log in with new password                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Security Features

### 1. Email Enumeration Protection ✅
**Problem:** Attackers could discover which emails are registered  
**Solution:** Always return same success message, whether email exists or not

```json
// Response (same for all cases)
{
  "success": true,
  "message": "If an account exists with that email, you will receive a password reset link."
}
```

### 2. Token Security ✅
- **Generation:** Cryptographically secure (Supabase)
- **Expiration:** 1 hour (Supabase default)
- **Single Use:** Token invalidated after successful reset
- **Transport:** HTTPS only in production

### 3. Session Invalidation ✅
- **Automatic:** All user sessions invalidated on password change
- **Effect:** User logged out on all devices
- **Benefit:** If attacker triggers reset, old sessions are killed

### 4. Rate Limiting ✅
- **Client-side:** Button disabled for 60 seconds after submission
- **Prevents:** Spam/abuse of reset endpoint
- **Supabase:** Additional built-in rate limiting

### 5. Input Validation ✅
- **Email:** Format validation, required
- **Password:** Strength requirements enforced
  - Minimum 8 characters
  - At least one lowercase letter
  - At least one uppercase letter
  - At least one number
  - At least one special character
- **Confirmation:** Must match password

---

## Technical Architecture

### Backend (Hexagonal Architecture Decision)

**Decision:** Keep it simple - implement directly in API routes  
**Rationale:** Auth is infrastructure concern, no complex business logic

```
src/app/api/auth/
├── forgot-password/
│   └── route.ts          ← Calls supabase.auth.resetPasswordForEmail()
└── reset-password/
    └── route.ts          ← Calls supabase.auth.updateUser({ password })
```

**Key Methods:**

```typescript
// Forgot Password
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`
})

// Reset Password  
await supabase.auth.updateUser({
  password: newPassword
})
```

### Frontend (React Hook Form + Zod)

**Pattern:** Match existing login page architecture

```
src/app/[locale]/
├── forgot-password/
│   └── page.tsx          ← "use client", React Hook Form, 60s cooldown
└── reset-password/
    └── page.tsx          ← "use client", token validation, password strength
```

**Key Features:**
- React Hook Form with Zod resolver
- Toast notifications for feedback
- Password strength indicator (reused component)
- Client-side cooldown timer
- Responsive design (mobile-first)
- Dark mode support
- Full accessibility

---

## Testing Strategy

### Unit Tests (Jest)
```typescript
// Validation schemas
✓ forgotPasswordSchema validates email
✓ resetPasswordSchema validates password strength
✓ Password confirmation matches

// Utility functions
✓ calculatePasswordStrength returns correct scores
✓ Error message mapping works correctly
```

### Integration Tests (Jest + MSW)
```typescript
// API Routes
✓ POST /api/auth/forgot-password with valid email
✓ POST /api/auth/forgot-password with invalid email (same response)
✓ POST /api/auth/reset-password with valid token
✓ POST /api/auth/reset-password with expired token (401)
✓ POST /api/auth/reset-password with invalid password
```

### Component Tests (React Testing Library)
```typescript
// Forgot Password Page
✓ Renders form correctly
✓ Shows validation errors
✓ Submits form successfully
✓ Shows success message after submission
✓ Cooldown timer works correctly
✓ Button disabled during cooldown

// Reset Password Page
✓ Validates token on mount
✓ Shows error for invalid token
✓ Password visibility toggle works
✓ Password strength indicator updates
✓ Passwords must match validation
✓ Redirects to login on success
```

### E2E Tests (Playwright)
```typescript
// Complete Flow
✓ Navigate to forgot password from login
✓ Submit email and see success message
✓ Verify cooldown timer prevents rapid submissions
// Note: Email link testing requires Supabase test utilities

// Error Scenarios
✓ Invalid email format shows error
✓ Expired token shows error page
✓ Weak password shows strength indicator
✓ Mismatched passwords show error
```

---

## Implementation Timeline

### Phase 1: Backend (2-3 hours)
- [ ] Create `/api/auth/forgot-password/route.ts`
- [ ] Create `/api/auth/reset-password/route.ts`
- [ ] Update validation schemas
- [ ] Add environment variable
- [ ] Test with curl/Postman
- [ ] Write unit tests for validation
- [ ] Write integration tests for routes

### Phase 2: Frontend (3-4 hours)
- [ ] Create `/forgot-password/page.tsx`
- [ ] Create `/reset-password/page.tsx`
- [ ] Add i18n messages (all 3 languages)
- [ ] Test locally with dev server
- [ ] Write component tests
- [ ] Test responsive design
- [ ] Test dark mode
- [ ] Accessibility audit

### Phase 3: Supabase Configuration (30 mins)
- [ ] Configure email template
- [ ] Add redirect URLs
- [ ] Test email delivery
- [ ] Verify token expiration

### Phase 4: Integration & Testing (2-3 hours)
- [ ] Test complete flow end-to-end
- [ ] Test all error scenarios
- [ ] Test token expiration (wait 1 hour)
- [ ] Test session invalidation
- [ ] Mobile device testing
- [ ] Cross-browser testing
- [ ] Write E2E tests

### Phase 5: Documentation & Deployment (1 hour)
- [ ] Update README if needed
- [ ] Deploy to staging
- [ ] QA validation
- [ ] Deploy to production
- [ ] Monitor for errors

**Total Estimated Time:** 8-12 hours

---

## Error Handling Matrix

| Scenario | HTTP Status | User Message | Action |
|----------|-------------|--------------|---------|
| **Forgot Password Endpoint** |
| Valid email (exists) | 200 | Generic success | Email sent |
| Valid email (not exists) | 200 | Generic success | No email (silent) |
| Invalid email format | 400 | "Invalid email format" | Show inline error |
| Supabase error | 200 | Generic success | Log error, return success anyway |
| **Reset Password Endpoint** |
| Valid token + password | 200 | "Password updated successfully" | Redirect to login |
| Invalid/expired token | 401 | "Reset link expired or invalid" | Show error page, link to forgot-password |
| Weak password | 400 | Specific validation errors | Show inline errors |
| Passwords don't match | 400 | "Passwords don't match" | Show inline error |
| Same as old password | 400 | "Must be different from current" | Show inline error |
| Supabase error | 500 | "Please try again" | Log error, show toast |

---

## Detailed Implementation Docs

📄 **For complete code implementations, see:**

- **Backend:** `.cursor/doc/forgot_password/backend_advice.md`
  - Complete API route code
  - Security best practices
  - Error handling strategies
  - Supabase integration details
  - Testing examples

- **Frontend:** `.cursor/doc/forgot_password/frontend_advice.md`
  - Complete page component code
  - Form handling patterns
  - UI/UX considerations
  - Accessibility guidelines
  - Responsive design approach
  - i18n message examples

- **Session Context:** `.cursor/sessions/context_session_forgot_password.md`
  - Exploration notes
  - User decisions
  - Iteration history

---

## Pre-Implementation Checklist

### Environment Setup
- [ ] Verify `NEXT_PUBLIC_SUPABASE_URL` exists in `.env.local`
- [ ] Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` exists in `.env.local`
- [ ] Add `NEXT_PUBLIC_APP_URL` to `.env.local`
- [ ] Test Supabase connection

### Supabase Dashboard
- [ ] Access Supabase dashboard
- [ ] Navigate to Authentication → Email Templates
- [ ] Review password reset template
- [ ] Configure redirect URLs
- [ ] Test email provider

### Codebase
- [ ] Pull latest from main branch
- [ ] Verify existing auth routes work (login, logout)
- [ ] Check PasswordStrengthIndicator component exists
- [ ] Verify shadcn/ui components are available

---

## Post-Implementation Verification

### Functional Testing
- [ ] User can request password reset
- [ ] Email is received with valid link
- [ ] Link opens reset page
- [ ] User can set new password
- [ ] Old password no longer works
- [ ] New password works for login
- [ ] User is logged out on all devices after reset

### Security Testing
- [ ] Same response for existing/non-existing emails
- [ ] Token expires after 1 hour
- [ ] Token cannot be reused
- [ ] Sessions invalidated after password change
- [ ] Rate limiting prevents spam
- [ ] HTTPS enforced in production

### UI/UX Testing
- [ ] Responsive on mobile (375px, 768px, 1024px)
- [ ] Dark mode works correctly
- [ ] All three languages display correctly (en, es, ar)
- [ ] Password strength indicator updates
- [ ] Cooldown timer counts down
- [ ] Success messages are clear
- [ ] Error messages are helpful
- [ ] Keyboard navigation works
- [ ] Screen reader compatible

### Performance Testing
- [ ] Page load time acceptable
- [ ] No console errors
- [ ] No memory leaks
- [ ] Forms submit quickly

---

## Rollback Plan

If issues arise in production:

1. **Immediate:** Comment out the "Forgot password?" link in login page
2. **Quick Fix:** Revert the API routes if causing errors
3. **Full Rollback:** Revert all commits related to this feature

```bash
# Emergency: Hide the link
# In src/app/[locale]/login/page.tsx, comment out:
# <Link href="/forgot-password">Forgot password?</Link>
```

---

## Support & Maintenance

### Monitoring
- Monitor Supabase logs for password reset errors
- Track password reset success rate
- Monitor email delivery rates

### Common Issues & Solutions

**Issue:** Email not received  
**Solution:** Check spam folder, verify email provider, check Supabase logs

**Issue:** Token expired error  
**Solution:** Expected behavior after 1 hour, user should request new link

**Issue:** Password doesn't meet requirements  
**Solution:** Show password strength indicator, highlight specific requirements

**Issue:** Link clicked twice shows error  
**Solution:** Expected behavior (single-use token), show clear error with action

---

## Future Enhancements (Out of Scope)

- [ ] Server-side rate limiting with Redis
- [ ] Password reset via SMS
- [ ] Password history (prevent reusing last N passwords)
- [ ] Configurable token expiration time
- [ ] Admin ability to force password reset
- [ ] Two-factor authentication integration
- [ ] Password reset activity log in user dashboard

---

## Conclusion

This implementation plan provides everything needed to add a secure, user-friendly password reset flow to The Secret Caps Society. The feature follows industry best practices for security, integrates seamlessly with existing authentication patterns, and provides an excellent user experience.

**Key Success Factors:**
✅ Security-first approach (email enumeration protection, session invalidation)  
✅ Consistent with existing design patterns  
✅ Full internationalization support  
✅ Comprehensive testing strategy  
✅ Clear error handling and user feedback  
✅ Accessible and responsive  

**Ready to implement!** 🚀

---

**Questions or clarifications?** Refer to the detailed advice documents or update the session context file.

