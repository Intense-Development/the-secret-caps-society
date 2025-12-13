# Frontend Implementation Advice: Password Reset Flow

**Consultant:** @frontend-developer  
**Date:** December 5, 2025

## Architecture Overview

Following Next.js 15 App Router patterns and existing authentication page structure from `src/app/[locale]/login/page.tsx`.

**Key Principles:**
- Client Components (`"use client"`)
- React Hook Form + Zod validation
- Consistent UI/UX with login page
- Toast notifications for feedback
- Environment-aware routing
- Full i18n support

## Implementation Plan

### File Structure

```
src/
├── app/[locale]/
│   ├── forgot-password/
│   │   └── page.tsx          (NEW)
│   └── reset-password/
│       └── page.tsx          (NEW)
├── lib/validations/
│   └── auth.ts               (UPDATE - add schemas)
└── messages/
    ├── en.json               (UPDATE)
    ├── es.json               (UPDATE)
    └── ar.json               (UPDATE)
```

## 1. Validation Schemas

### Update `src/lib/validations/auth.ts`

```typescript
// Add to existing file

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

// Reset password schema
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

// Export types
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
```

## 2. Forgot Password Page

### Create `src/app/[locale]/forgot-password/page.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing-config";
import { Link } from "@/i18n/routing-config";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  forgotPasswordSchema, 
  type ForgotPasswordInput 
} from "@/lib/validations/auth";

export default function ForgotPassword() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Cooldown timer
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownSeconds]);

  // Form submission
  const onSubmit = async (data: ForgotPasswordInput) => {
    if (cooldownSeconds > 0) return;

    setIsSubmitting(true);
    setShowSuccess(false);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Unable to send reset email",
          description: result.message || "Please try again later.",
        });
        return;
      }

      // Show success message
      setShowSuccess(true);
      setCooldownSeconds(60); // 60 second cooldown

      // Optional: Auto-hide success after 10 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 10000);

    } catch (error) {
      console.error("Forgot password request failed:", error);
      toast({
        variant: "destructive",
        title: "Unexpected error",
        description: "We couldn't complete your request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-16 md:py-24">
        <div className="container max-w-md mx-auto px-4">
          <div className="mb-8">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Link>
          </div>

          <Card className="border-border/40 shadow-soft">
            <CardHeader>
              <CardTitle>Forgot your password?</CardTitle>
              <CardDescription>
                Enter your email address and we&apos;ll send you a link to reset
                your password.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {showSuccess && (
                <Alert className="mb-6 border-green-500/50 bg-green-50 dark:bg-green-950/20">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    If an account exists with <strong>{getValues("email")}</strong>,
                    you will receive a password reset link shortly. Please check your
                    inbox and spam folder.
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="your@email.com"
                    disabled={isSubmitting || cooldownSeconds > 0}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3 pt-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || cooldownSeconds > 0}
                  >
                    {isSubmitting ? (
                      <span className="inline-flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </span>
                    ) : cooldownSeconds > 0 ? (
                      <span>
                        Resend in {cooldownSeconds}s
                      </span>
                    ) : (
                      <span className="inline-flex items-center">
                        <Mail className="mr-2 h-4 w-4" />
                        Send reset link
                      </span>
                    )}
                  </Button>

                  {cooldownSeconds > 0 && (
                    <p className="text-xs text-muted-foreground text-center">
                      Didn&apos;t receive the email? You can request another link
                      in {cooldownSeconds} seconds.
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground text-center pt-2">
                    This helps protect your account from unauthorized access
                    attempts.
                  </p>
                </div>
              </form>
            </CardContent>

            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="text-primary underline hover:opacity-80"
                >
                  Log in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
```

## 3. Reset Password Page

### Create `src/app/[locale]/reset-password/page.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing-config";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Loader2, 
  Key, 
  AlertTriangle,
  CheckCircle2 
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { 
  resetPasswordSchema, 
  type ResetPasswordInput,
  calculatePasswordStrength 
} from "@/lib/validations/auth";

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState<ReturnType<
    typeof calculatePasswordStrength
  > | null>(null);

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  // Calculate password strength on change
  useEffect(() => {
    if (password && password.length > 0) {
      setPasswordStrength(calculatePasswordStrength(password));
    } else {
      setPasswordStrength(null);
    }
  }, [password]);

  // Validate token on mount
  useEffect(() => {
    const validateToken = () => {
      const token = searchParams?.get("token");
      const type = searchParams?.get("type");

      if (!token || type !== "recovery") {
        setTokenError(
          "This password reset link is invalid. Please request a new one."
        );
        setIsValidating(false);
        return;
      }

      // Token exists in URL, Supabase will validate it
      // If invalid, the API call will fail
      setIsValidating(false);
    };

    validateToken();
  }, [searchParams]);

  // Form submission
  const onSubmit = async (data: ResetPasswordInput) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle specific errors
        if (response.status === 401) {
          setTokenError(
            result.message ||
            "This password reset link has expired. Please request a new one."
          );
          return;
        }

        toast({
          variant: "destructive",
          title: "Unable to reset password",
          description: result.message || "Please try again.",
        });
        return;
      }

      // Success!
      toast({
        title: "Password updated successfully!",
        description: "Redirecting to login...",
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (error) {
      console.error("Reset password request failed:", error);
      toast({
        variant: "destructive",
        title: "Unexpected error",
        description: "We couldn't complete your request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while validating token
  if (isValidating) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Validating reset link...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show error if token is invalid
  if (tokenError) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-16 md:py-24">
          <div className="container max-w-md mx-auto px-4">
            <Card className="border-border/40 shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="rounded-full bg-destructive/10 p-3">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  </div>
                </div>
                <CardTitle className="text-center">Invalid Reset Link</CardTitle>
                <CardDescription className="text-center">
                  {tokenError}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex flex-col gap-3">
                <Button asChild className="w-full">
                  <Link href="/forgot-password">
                    Request new reset link
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login">
                    Back to login
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show reset password form
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-16 md:py-24">
        <div className="container max-w-md mx-auto px-4">
          <div className="mb-8">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Link>
          </div>

          <Card className="border-border/40 shadow-soft">
            <CardHeader>
              <CardTitle>Reset your password</CardTitle>
              <CardDescription>
                Enter your new password below. Make sure it&apos;s strong and
                secure.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* New Password */}
                <div className="grid gap-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Enter new password"
                      {...register("password")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute inset-y-0 right-0 h-full px-3 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                  {/* Password Strength Indicator */}
                  {passwordStrength && (
                    <PasswordStrengthIndicator strength={passwordStrength} />
                  )}
                </div>

                {/* Confirm Password */}
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Confirm new password"
                      {...register("confirmPassword")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute inset-y-0 right-0 h-full px-3 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3 pt-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="inline-flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting password...
                      </span>
                    ) : (
                      <span className="inline-flex items-center">
                        <Key className="mr-2 h-4 w-4" />
                        Reset password
                      </span>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    After resetting your password, you&apos;ll need to log in on
                    all your devices.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
```

## 4. Internationalization Messages

### Update `messages/en.json`

```json
{
  "auth": {
    "forgotPassword": {
      "title": "Forgot your password?",
      "description": "Enter your email address and we'll send you a link to reset your password.",
      "emailLabel": "Email",
      "emailPlaceholder": "your@email.com",
      "sendButton": "Send reset link",
      "sendingButton": "Sending...",
      "resendButton": "Resend in {seconds}s",
      "successTitle": "Check your email",
      "successMessage": "If an account exists with {email}, you will receive a password reset link shortly. Please check your inbox and spam folder.",
      "cooldownMessage": "Didn't receive the email? You can request another link in {seconds} seconds.",
      "securityNote": "This helps protect your account from unauthorized access attempts.",
      "backToLogin": "Back to login",
      "rememberPassword": "Remember your password?",
      "loginLink": "Log in"
    },
    "resetPassword": {
      "title": "Reset your password",
      "description": "Enter your new password below. Make sure it's strong and secure.",
      "passwordLabel": "New Password",
      "confirmPasswordLabel": "Confirm Password",
      "passwordPlaceholder": "Enter new password",
      "confirmPasswordPlaceholder": "Confirm new password",
      "submitButton": "Reset password",
      "submittingButton": "Resetting password...",
      "sessionNote": "After resetting your password, you'll need to log in on all your devices.",
      "validatingToken": "Validating reset link...",
      "invalidTokenTitle": "Invalid Reset Link",
      "invalidTokenMessage": "This password reset link is invalid. Please request a new one.",
      "expiredTokenMessage": "This password reset link has expired. Please request a new one.",
      "requestNewLink": "Request new reset link",
      "successTitle": "Password updated successfully!",
      "successMessage": "Redirecting to login..."
    }
  }
}
```

### Update `messages/es.json` (Spanish)

```json
{
  "auth": {
    "forgotPassword": {
      "title": "¿Olvidaste tu contraseña?",
      "description": "Ingresa tu dirección de correo electrónico y te enviaremos un enlace para restablecer tu contraseña.",
      "emailLabel": "Correo electrónico",
      "emailPlaceholder": "tu@email.com",
      "sendButton": "Enviar enlace de restablecimiento",
      "sendingButton": "Enviando...",
      "resendButton": "Reenviar en {seconds}s",
      "successMessage": "Si existe una cuenta con {email}, recibirás un enlace de restablecimiento de contraseña en breve. Por favor, revisa tu bandeja de entrada y carpeta de spam.",
      "cooldownMessage": "¿No recibiste el correo? Puedes solicitar otro enlace en {seconds} segundos.",
      "securityNote": "Esto ayuda a proteger tu cuenta de intentos de acceso no autorizados.",
      "rememberPassword": "¿Recuerdas tu contraseña?",
      "loginLink": "Iniciar sesión"
    },
    "resetPassword": {
      "title": "Restablecer tu contraseña",
      "description": "Ingresa tu nueva contraseña a continuación. Asegúrate de que sea fuerte y segura.",
      "passwordLabel": "Nueva contraseña",
      "confirmPasswordLabel": "Confirmar contraseña",
      "passwordPlaceholder": "Ingresa nueva contraseña",
      "confirmPasswordPlaceholder": "Confirma nueva contraseña",
      "submitButton": "Restablecer contraseña",
      "submittingButton": "Restableciendo contraseña...",
      "sessionNote": "Después de restablecer tu contraseña, deberás iniciar sesión en todos tus dispositivos.",
      "invalidTokenMessage": "Este enlace de restablecimiento de contraseña es inválido. Por favor, solicita uno nuevo.",
      "requestNewLink": "Solicitar nuevo enlace",
      "successTitle": "¡Contraseña actualizada exitosamente!",
      "successMessage": "Redirigiendo al inicio de sesión..."
    }
  }
}
```

### Update `messages/ar.json` (Arabic - RTL)

```json
{
  "auth": {
    "forgotPassword": {
      "title": "هل نسيت كلمة المرور؟",
      "description": "أدخل عنوان بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور.",
      "emailLabel": "البريد الإلكتروني",
      "emailPlaceholder": "your@email.com",
      "sendButton": "إرسال رابط إعادة التعيين",
      "sendingButton": "جاري الإرسال...",
      "resendButton": "إعادة الإرسال في {seconds}ث",
      "successMessage": "إذا كان هناك حساب بـ {email}، ستتلقى رابط إعادة تعيين كلمة المرور قريبًا. يرجى التحقق من صندوق الوارد ومجلد البريد العشوائي.",
      "rememberPassword": "تتذكر كلمة المرور؟",
      "loginLink": "تسجيل الدخول"
    },
    "resetPassword": {
      "title": "إعادة تعيين كلمة المرور",
      "description": "أدخل كلمة المرور الجديدة أدناه. تأكد من أنها قوية وآمنة.",
      "passwordLabel": "كلمة المرور الجديدة",
      "confirmPasswordLabel": "تأكيد كلمة المرور",
      "submitButton": "إعادة تعيين كلمة المرور",
      "submittingButton": "جاري إعادة التعيين...",
      "sessionNote": "بعد إعادة تعيين كلمة المرور، ستحتاج إلى تسجيل الدخول على جميع أجهزتك.",
      "successTitle": "تم تحديث كلمة المرور بنجاح!",
      "successMessage": "جاري التوجيه إلى تسجيل الدخول..."
    }
  }
}
```

## Key Implementation Details

### 1. Answers to Questions

**Q: Should we use the same extractFieldErrors helper from login?**
A: Not needed - we're using simpler error handling with toast notifications for API errors and inline errors for validation.

**Q: How should we handle the token in the URL?**
A: Don't extract it manually! Supabase SSR automatically handles it through cookies. Just check if it exists for UX (showing error if missing), but let Supabase validate it on the backend.

**Q: Should the success message on forgot-password page be inline or toast?**
A: **Inline Alert** - More visible and persistent. User needs to see this message clearly to know to check their email.

**Q: Do we need a separate loading state for token validation vs form submission?**
A: **Yes** - Show loading spinner while validating token on mount, then show either the form or error state.

**Q: Should we clear the form after successful submission on forgot-password?**
A: **No** - Keep the email visible in the success message so user knows which email to check.

**Q: Best practice for the cooldown timer display?**
A: **In the button** - Shows user exactly when they can retry. Clearer UX than separate text.

**Q: Should reset-password page clear the token from URL after successful reset?**
A: **No need** - We redirect to login immediately after success. Token becomes invalid after use anyway.

### 2. Accessibility Considerations

✅ **Keyboard Navigation:**
- All interactive elements are keyboard accessible
- Proper tab order (email → submit → links)
- Escape key doesn't close (not a modal)

✅ **Screen Readers:**
- Semantic HTML (form, button, input)
- Aria-labels on password visibility toggles
- Error messages associated with inputs

✅ **Visual:**
- High contrast colors
- Clear focus indicators
- Large touch targets (44px minimum)
- Icons paired with text

✅ **Form Feedback:**
- Clear error messages
- Success states
- Loading indicators
- Disabled state styling

### 3. Mobile Responsiveness

```typescript
// Already handled by existing patterns:
// - Responsive container (max-w-md)
// - Proper padding (px-4)
// - Touch-friendly button sizes
// - Readable font sizes
// - Navbar and Footer are responsive
```

**Breakpoints (from existing design):**
- Mobile: < 768px (default)
- Tablet: 768px - 1024px
- Desktop: > 1024px

### 4. Error State Management

**Client-side validation errors:**
- Shown inline below input fields
- Red text (text-destructive)
- Realtime as user types (handled by react-hook-form)

**API errors:**
- Shown as toast notifications
- Destructive variant for errors
- Success variant for confirmations

**Token errors:**
- Special error card UI
- Action buttons to recover (request new link)
- Clear messaging about what went wrong

### 5. Loading States

**Forgot Password:**
- Submit button: "Sending..." with spinner
- Cooldown: "Resend in Xs"
- Form fields disabled during submission

**Reset Password:**
- Initial: "Validating reset link..." (full page spinner)
- Submit: "Resetting password..." with spinner
- Success: Toast + auto-redirect after 2s

## Testing Checklist

### Unit Tests
- [ ] forgotPasswordSchema validation
- [ ] resetPasswordSchema validation
- [ ] Password strength calculation
- [ ] Cooldown timer logic

### Component Tests (React Testing Library)
- [ ] Forgot password form submission
- [ ] Reset password form submission
- [ ] Password visibility toggle
- [ ] Validation error display
- [ ] Success message display
- [ ] Cooldown button state

### E2E Tests (Playwright)
```typescript
// Example E2E test structure
test('complete password reset flow', async ({ page }) => {
  // 1. Navigate to forgot password
  await page.goto('/forgot-password')
  
  // 2. Enter email
  await page.fill('[name="email"]', 'test@example.com')
  await page.click('button[type="submit"]')
  
  // 3. Verify success message
  await expect(page.locator('text=check your inbox')).toBeVisible()
  
  // 4. Verify cooldown timer
  await expect(page.locator('button:disabled')).toBeVisible()
  
  // Note: Email link clicking would need to be mocked
  // or use Supabase test helpers to get reset URL
})
```

## Integration Checklist

- [ ] Create `/[locale]/forgot-password/page.tsx`
- [ ] Create `/[locale]/reset-password/page.tsx`
- [ ] Update `src/lib/validations/auth.ts`
- [ ] Update `messages/en.json`
- [ ] Update `messages/es.json`
- [ ] Update `messages/ar.json`
- [ ] Test all three language variants
- [ ] Test dark mode appearance
- [ ] Test mobile responsive design
- [ ] Test keyboard navigation
- [ ] Test with screen reader
- [ ] Integrate with backend APIs
- [ ] Test real email flow
- [ ] Test expired token scenario
- [ ] Test invalid token scenario

## Final Notes

### Reused Components ✅
- All UI components from shadcn/ui
- PasswordStrengthIndicator from existing auth components
- Navbar and Footer (consistent layout)
- Toast system for notifications

### New Components ❌
- None required! Everything can be built with existing components

### Performance
- Client-side only (no SSR needed for auth pages)
- Minimal JavaScript bundle impact
- Form validation is efficient with Zod
- No heavy dependencies added

### Security
- Passwords never logged or displayed
- Token handled securely by Supabase
- No client-side token parsing/validation beyond existence check
- CSRF protection via Supabase cookies

## Next Steps

1. Implement both pages
2. Test locally with real Supabase project
3. Verify email delivery
4. Test token expiration (wait 1 hour)
5. Test on mobile devices
6. Run accessibility audit
7. Add E2E tests
8. Deploy to staging for QA

