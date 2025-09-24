"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

// This inner component uses useSearchParams
function AuthCallbackInner() {
  const [message, setMessage] = useState<string>("Completing sign-in...");
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setMessage(
        "No auth code found in URL. This page should not be visited directly."
      );
      return;
    }

    let mounted = true;
    (async () => {
      const { error } = await supabaseBrowser.auth.exchangeCodeForSession(code);
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
  }, [searchParams]);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Auth Callback</h1>
      <p role="status" className="text-sm text-muted-foreground">
        {message}
      </p>
      <Button onClick={() => window.location.assign("/")}>Go home</Button>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthCallbackInner />
    </Suspense>
  );
}
