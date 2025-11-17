"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing-config";
import { Link } from "@/i18n/routing-config";
import { useForm, Controller } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Eye, EyeOff, Loader2, LogIn, MailCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

function extractFieldErrors(errorResponse: unknown) {
  if (
    typeof errorResponse === "object" &&
    errorResponse !== null &&
    "errors" in errorResponse
  ) {
    const errors = (errorResponse as { errors?: unknown }).errors;
    if (
      errors &&
      typeof errors === "object" &&
      "fieldErrors" in errors &&
      typeof (errors as { fieldErrors?: unknown }).fieldErrors === "object"
    ) {
      return (errors as { fieldErrors: Record<string, string[]> }).fieldErrors;
    }
  }
  return undefined;
}

export default function Login() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [submittingAction, setSubmittingAction] = useState<
    "password" | "magic-link" | null
  >(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
      mode: "password",
    },
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = form;

  const submitLogin = async (
    payload: LoginInput,
    action: "password" | "magic-link"
  ) => {
    setSubmittingAction(action);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        const fieldErrors = extractFieldErrors(result);
        if (fieldErrors) {
          Object.entries(fieldErrors).forEach(([field, messages]) => {
            if (messages?.[0]) {
              setError(field as keyof LoginInput, {
                type: "server",
                message: messages[0],
              });
            }
          });
        }

        toast({
          variant: "destructive",
          title: "Unable to sign in",
          description:
            (result?.message as string | undefined) ??
            "Please check your details and try again.",
        });
        return;
      }

      if (action === "magic-link") {
        toast({
          title: "Magic link sent",
          description:
            (result?.message as string | undefined) ??
            "Check your inbox to continue.",
        });
        return;
      }

      toast({
        title: "Welcome back!",
        description: "Successfully signed in to the Secret Caps Society.",
      });

      reset({
        email: payload.email,
        password: "",
        rememberMe: payload.rememberMe,
        mode: "password",
      });

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Login request failed:", error);
      toast({
        variant: "destructive",
        title: "Unexpected error",
        description: "We couldn't complete your request. Please try again.",
      });
    } finally {
      setSubmittingAction(null);
    }
  };

  const handlePasswordSubmit = handleSubmit(async (values) => {
    await submitLogin(
      {
        ...values,
        mode: "password",
      },
      "password"
    );
  });

  const handleMagicLinkSubmit = () =>
    handleSubmit(async ({ email, rememberMe }) => {
      await submitLogin(
        {
          email,
          rememberMe,
          mode: "magic-link",
        },
        "magic-link"
      );
    })();

  const isPasswordSubmitting = submittingAction === "password";
  const isMagicLinkSubmitting = submittingAction === "magic-link";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-16 md:py-24">
        <div className="container max-w-md mx-auto px-4">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </Link>
          </div>

          <Card className="border-border/40 shadow-soft">
            <CardHeader>
              <CardTitle>Log in to your account</CardTitle>
              <CardDescription>
                Use your email and password or request a magic link to sign in.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="your@email.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
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
                </div>

                <Controller
                  name="rememberMe"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember-me"
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                      />
                      <Label
                        htmlFor="remember-me"
                        className="text-sm font-normal text-muted-foreground"
                      >
                        Remember me on this device
                      </Label>
                    </div>
                  )}
                />

                <div className="space-y-3 pt-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isPasswordSubmitting}
                  >
                    {isPasswordSubmitting ? (
                      <span className="inline-flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in
                      </span>
                    ) : (
                      <span className="inline-flex items-center">
                        <LogIn className="mr-2 h-4 w-4" />
                        Log in
                      </span>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={isMagicLinkSubmitting}
                    onClick={handleMagicLinkSubmit}
                  >
                    {isMagicLinkSubmitting ? (
                      <span className="inline-flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending magic link
                      </span>
                    ) : (
                      <span className="inline-flex items-center">
                        <MailCheck className="mr-2 h-4 w-4" />
                        Email me a magic link
                      </span>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    We&rsquo;ll remember your device for faster access next time. You
                    can always sign out securely from the dashboard.
                  </p>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account yet?{" "}
                <Link
                  href="/register"
                  className="text-primary underline hover:opacity-80"
                >
                  Sign up
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
