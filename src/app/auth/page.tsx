"use client";

import { useEffect, useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function AuthPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    supabaseBrowser.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUserEmail(data.user?.email ?? null);
    });
    const { data: sub } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });
    return () => {
      sub.subscription.unsubscribe();
      mounted = false;
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Authentication</h1>
      {userEmail ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Signed in as {userEmail}</p>
          <LogoutButton />
        </div>
      ) : (
        <LoginForm />
      )}
    </div>
  );
}
