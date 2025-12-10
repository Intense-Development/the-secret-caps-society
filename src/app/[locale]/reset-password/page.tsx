"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Link, useRouter } from "@/i18n/routing-config";
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
import { useToast } from "@/components/ui/use-toast";
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Loader2, 
  Key,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PasswordStrengthIndicator from "@/components/auth/PasswordStrengthIndicator";
import { 
  resetPasswordSchema, 
  type ResetPasswordInput 
} from "@/lib/validations/auth";

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [isValidatingSession, setIsValidatingSession] = useState(true);

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

  // Listen for Supabase auth state changes and validate session
  useEffect(() => {
    const supabase = createClient();
    
    // Check for session and process any recovery codes/tokens
    const checkSession = async () => {
      setIsValidatingSession(true);
      
      // First, check if we have tokens in URL hash (implicit flow)
      if (typeof window !== 'undefined' && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        console.log('[RESET_PASSWORD_HASH_CHECK]', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          type,
          error,
        });

        // Handle errors from Supabase in hash
        if (error) {
          console.error('[RESET_PASSWORD_HASH_ERROR]', { error, errorDescription });
          setIsValidatingSession(false);
          toast({
            variant: "destructive",
            title: "Reset link expired",
            description: errorDescription || "Please request a new password reset link.",
          });
          setTimeout(() => router.push("/forgot-password"), 2000);
          return;
        }

        // Process recovery tokens from hash
        if (accessToken && refreshToken && type === 'recovery') {
          console.log('[RESET_PASSWORD_SETTING_SESSION_FROM_HASH]');
          try {
            const { data: { session: newSession }, error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (newSession && !setSessionError) {
              setHasValidSession(true);
              setIsValidatingSession(false);
              console.log('[RESET_PASSWORD_SESSION_FROM_HASH_SUCCESS]');
              // Clean up URL hash
              window.history.replaceState(null, '', window.location.pathname + window.location.search);
              return;
            } else {
              console.error('[RESET_PASSWORD_SET_SESSION_ERROR]', setSessionError);
              setIsValidatingSession(false);
              toast({
                variant: "destructive",
                title: "Invalid reset link",
                description: setSessionError?.message || "Please request a new password reset link.",
              });
              setTimeout(() => router.push("/forgot-password"), 2000);
              return;
            }
          } catch (error) {
            console.error('[RESET_PASSWORD_SET_SESSION_EXCEPTION]', error);
            setIsValidatingSession(false);
            toast({
              variant: "destructive",
              title: "Error processing reset link",
              description: "Please request a new password reset link.",
            });
            setTimeout(() => router.push("/forgot-password"), 2000);
            return;
          }
        }
      }

      // Check if we have a code parameter - exchange it for session on client side
      const code = searchParams?.get('code');
      const typeParam = searchParams?.get('type');
      
      if (code) {
        console.log('[RESET_PASSWORD_CODE_DETECTED]', { type: typeParam });
        
        try {
          // Use client-side exchangeCodeForSession - this should work for password reset codes
          // The browser client can handle this without PKCE issues in some cases
          console.log('[RESET_PASSWORD_EXCHANGING_CODE]');
          const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error('[RESET_PASSWORD_EXCHANGE_ERROR]', exchangeError);
            
            // If exchangeCodeForSession fails (PKCE issue), try verifyOtp as fallback
            console.log('[RESET_PASSWORD_TRYING_VERIFY_OTP]');
            const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
              token: code,
              type: 'recovery',
            });

            if (verifyError || !verifyData?.session) {
              console.error('[RESET_PASSWORD_VERIFY_OTP_ERROR]', verifyError);
              setIsValidatingSession(false);
              toast({
                variant: "destructive",
                title: "Invalid reset link",
                description: exchangeError?.message || verifyError?.message || "Please request a new password reset link.",
              });
              setTimeout(() => router.push("/forgot-password"), 2000);
              return;
            }

            // verifyOtp succeeded
            if (verifyData.session) {
              setHasValidSession(true);
              setIsValidatingSession(false);
              console.log('[RESET_PASSWORD_SESSION_FROM_VERIFY_OTP]');
              window.history.replaceState(null, '', window.location.pathname);
              return;
            }
          } else if (exchangeData?.session) {
            // exchangeCodeForSession succeeded
            setHasValidSession(true);
            setIsValidatingSession(false);
            console.log('[RESET_PASSWORD_SESSION_FROM_EXCHANGE]');
            window.history.replaceState(null, '', window.location.pathname);
            return;
          }
        } catch (error) {
          console.error('[RESET_PASSWORD_CODE_PROCESSING_EXCEPTION]', error);
          setIsValidatingSession(false);
          toast({
            variant: "destructive",
            title: "Error processing reset link",
            description: "Please request a new password reset link.",
          });
          setTimeout(() => router.push("/forgot-password"), 2000);
          return;
        }
      }

      // Check for existing session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log('[RESET_PASSWORD_SESSION_CHECK]', {
        hasSession: !!session,
        error: sessionError?.message,
      });

      if (session) {
        setHasValidSession(true);
        setIsValidatingSession(false);
        console.log('[RESET_PASSWORD_EXISTING_SESSION]');
        return;
      }

      // No session found
      setIsValidatingSession(false);
      console.warn('[RESET_PASSWORD_NO_SESSION]', 'No valid session found');
      toast({
        variant: "destructive",
        title: "Reset link expired",
        description: "Please request a new password reset link.",
      });
      setTimeout(() => router.push("/forgot-password"), 2000);
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AUTH_STATE_CHANGE]', { event, hasSession: !!session });
      
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          setHasValidSession(true);
          setIsValidatingSession(false);
          console.log('[RESET_PASSWORD_SESSION_FROM_EVENT]');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, searchParams, toast]);

  // Form submission  
  const onSubmit = async (data: ResetPasswordInput) => {
    // Don't allow submission if session is still being validated
    if (isValidatingSession) {
      console.warn('[FORM_SUBMISSION_BLOCKED]', 'Session validation in progress');
      toast({
        variant: "default",
        title: "Please wait",
        description: "Validating reset link...",
      });
      return;
    }

    // Don't allow submission if no valid session
    if (!hasValidSession) {
      console.error('[NO_SESSION_DETECTED]', 'Cannot reset password without valid session');
      toast({
        variant: "destructive",
        title: "Reset link expired",
        description: "Please request a new password reset link and try again.",
      });
      setTimeout(() => router.push("/forgot-password"), 2000);
      return;
    }

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
        credentials: 'include', // Ensure cookies are sent
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle errors with toast notifications
        toast({
          variant: "destructive",
          title: response.status === 401 
            ? "Reset link expired" 
            : "Unable to reset password",
          description: result.message || "Please request a new reset link and try again.",
        });
        
        // If token expired, suggest going back to forgot-password
        if (response.status === 401) {
          setTimeout(() => {
            router.push("/forgot-password");
          }, 3000);
        }
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
                  <PasswordStrengthIndicator password={password || ""} />
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
                    disabled={isSubmitting || isValidatingSession || !hasValidSession}
                  >
                    {isValidatingSession ? (
                      <span className="inline-flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Validating reset link...
                      </span>
                    ) : isSubmitting ? (
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

