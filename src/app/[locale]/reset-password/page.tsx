"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing-config";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
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
  AlertTriangle,
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
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);

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

  // Handle Supabase token exchange from email link
  useEffect(() => {
    const handleTokenExchange = async () => {
      const tokenHash = searchParams?.get("token_hash");
      const type = searchParams?.get("type");

      // If no token params, might already be exchanged or invalid link
      if (!tokenHash || type !== "recovery") {
        // Check if there's already a valid session
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setTokenError(
            "This password reset link is invalid or has expired. Please request a new one."
          );
        }
        setIsValidating(false);
        return;
      }

      try {
        // Exchange the token_hash for a session
        const supabase = createClient();
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery",
        });

        if (error) {
          console.error("Token exchange error:", error);
          setTokenError(
            "This password reset link has expired or is invalid. Please request a new one."
          );
        }
        // If successful, session is now stored in cookies
      } catch (error) {
        console.error("Token validation error:", error);
        setTokenError(
          "Unable to validate reset link. Please try requesting a new one."
        );
      } finally {
        setIsValidating(false);
      }
    };

    handleTokenExchange();
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

