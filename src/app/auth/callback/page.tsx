"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function AuthCallbackPage() {
  const [message, setMessage] = useState<string>("Completing sign-in...");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { error } = await supabaseBrowser.auth.exchangeCodeForSession();
      if (!mounted) return;
      if (error) {
        setMessage(`Error completing sign-in: ${error.message}`);
      } else {
        setMessage("Sign-in complete! Redirecting...");
        setTimeout(() => {
          window.location.replace("/auth");
        }, 800);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Auth Callback</h1>
      <p role="status" className="text-sm text-muted-foreground">{message}</p>
      <Button onClick={() => window.location.assign("/")}>Go home</Button>
    </div>
  );
}
