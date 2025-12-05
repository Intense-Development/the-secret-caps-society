"use client";

import { useState, useEffect } from "react";
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

