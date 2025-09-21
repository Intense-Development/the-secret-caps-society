"use client";

import { useState, useTransition } from "react";
import { z } from "zod";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emailSchema = z.string().email();

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setMessage("Please enter a valid email.");
      return;
    }
    setMessage(null);

    startTransition(async () => {
      const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined;
      const { error } = await supabaseBrowser.auth.signInWithOtp({
        email: parsed.data,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage("Check your email for the magic link.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex w-full max-w-md flex-col gap-3">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
      </div>
      <Button type="submit" disabled={isPending} aria-busy={isPending}>
        {isPending ? "Sending..." : "Send magic link"}
      </Button>
      {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
    </form>
  );
}
