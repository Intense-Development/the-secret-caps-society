# Frontend Requirements: Password Reset Flow

## Context
Creating forgot password and reset password pages in Next.js 15 App Router with React 19, following existing authentication page patterns.

## User Decisions
- Environment-based redirect URLs
- Client-side rate limiting (cooldown after submit)
- Redirect to login after successful reset
- Support all three languages (English, Spanish, Arabic)
- Both frontend and backend token validation
- Hybrid error messages

## Required Pages

### 1. /[locale]/forgot-password/page.tsx
**Purpose:** Request password reset email

**UI Components:**
- Email input field
- Submit button with loading state
- Success message display area
- "Back to login" link
- Error display (toast)

**UX Flow:**
1. User enters email
2. Click submit → button shows loading, disables for 60s
3. On success: Show inline success message
4. On error: Show toast notification
5. After 60s cooldown: Re-enable button

**Form Validation:**
- Email required
- Valid email format
- Client-side validation with Zod

### 2. /[locale]/reset-password/page.tsx
**Purpose:** Set new password after clicking email link

**URL Parameters:**
```
/reset-password?token=xxx&type=recovery
```

**UI Components:**
- New password input with visibility toggle
- Password strength indicator (reuse existing component)
- Confirm password input
- Submit button with loading state
- Success/error message display
- "Back to login" link

**UX Flow:**
1. Page loads → Extract token from URL
2. Validate token with Supabase (frontend check)
3. If invalid/expired: Show error, link to forgot-password
4. If valid: Show password form
5. User enters new password
6. Real-time password strength indicator
7. Submit → API call
8. Success → Redirect to /login with success toast
9. Error → Show toast, keep form

**Form Validation:**
- Password required
- Meet strength requirements:
  - Min 8 characters
  - At least one lowercase letter
  - At least one uppercase letter
  - At least one number
  - At least one special character
- Passwords must match

## Existing Patterns to Follow

### From `src/app/[locale]/login/page.tsx`:
- Use `"use client"` directive
- Import `useRouter` from `@/i18n/routing-config`
- Use `useForm` from `react-hook-form` with `zodResolver`
- Use `useToast` for notifications
- Form structure with Card components
- Navbar and Footer layout
- Password visibility toggle pattern
- Loading state with `Loader2` icon
- Error handling with `extractFieldErrors`

### Component Reuse:
- `PasswordStrengthIndicator` from `src/components/auth/`
- shadcn/ui components: Button, Input, Label, Card
- Lucide icons: ArrowLeft, Eye, EyeOff, Loader2, Mail, Key

### Styling:
- Match login page visual design
- Responsive layout (mobile-first)
- Dark mode support
- Consistent spacing and typography
- Use Tailwind CSS v4

## Validation Schemas

### Add to `src/lib/validations/auth.ts`:

```typescript
// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

// Reset password schema
export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// Types
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
```

## Internationalization

### Add to message files:

**messages/en.json:**
```json
{
  "auth": {
    "forgotPassword": {
      "title": "Forgot your password?",
      "description": "Enter your email address and we'll send you a link to reset your password.",
      "emailLabel": "Email",
      "emailPlaceholder": "your@email.com",
      "submitButton": "Send reset link",
      "successMessage": "If an account exists with that email, you will receive a password reset link.",
      "backToLogin": "Back to login"
    },
    "resetPassword": {
      "title": "Reset your password",
      "description": "Enter your new password below.",
      "passwordLabel": "New password",
      "confirmPasswordLabel": "Confirm password",
      "submitButton": "Reset password",
      "successMessage": "Password updated successfully! Redirecting to login...",
      "invalidToken": "This password reset link is invalid or has expired.",
      "expiredToken": "This password reset link has expired. Please request a new one."
    }
  }
}
```

(+ Spanish and Arabic translations)

## Client-Side Rate Limiting

```typescript
const [cooldownSeconds, setCooldownSeconds] = useState(0)
const [lastSubmitTime, setLastSubmitTime] = useState<number | null>(null)

useEffect(() => {
  if (cooldownSeconds > 0) {
    const timer = setTimeout(() => {
      setCooldownSeconds(prev => prev - 1)
    }, 1000)
    return () => clearTimeout(timer)
  }
}, [cooldownSeconds])

const handleSubmit = async (data) => {
  // Prevent rapid submissions
  if (cooldownSeconds > 0) return
  
  setLastSubmitTime(Date.now())
  setCooldownSeconds(60) // 60 second cooldown
  
  // ... API call
}
```

## Token Validation (Frontend)

```typescript
// On reset-password page mount
useEffect(() => {
  const validateToken = async () => {
    const searchParams = new URLSearchParams(window.location.search)
    const token = searchParams.get('token')
    const type = searchParams.get('type')
    
    if (!token || type !== 'recovery') {
      setTokenError('Invalid reset link')
      return
    }
    
    // Optional: Validate token with Supabase before showing form
    // This improves UX by catching expired tokens early
  }
  
  validateToken()
}, [])
```

## Questions for Frontend Developer

1. Should we use the same `extractFieldErrors` helper from login, or create a new one?

2. How should we handle the token in the URL? Store in state, or read on submit?

3. Should the success message on forgot-password page be inline or toast?

4. Do we need a separate loading state for token validation vs form submission?

5. Should we clear the form after successful submission on forgot-password?

6. Best practice for the cooldown timer display? Show countdown in button or below?

7. Should reset-password page clear the token from URL after successful reset?

**Please provide:**
- Detailed implementation plan for both pages
- Complete component structure with hooks
- Form handling patterns
- Error state management
- Accessibility considerations
- Mobile responsiveness approach
- Integration with i18n system

