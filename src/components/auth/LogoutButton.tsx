"use client";

import { Button } from "@/components/ui/button";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useTransition } from "react";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  const onLogout = () => {
    startTransition(async () => {
      await supabaseBrowser.auth.signOut();
      if (typeof window !== "undefined") {
        window.location.assign("/");
      }
    });
  };

  return (
    <Button variant="outline" onClick={onLogout} disabled={isPending} aria-busy={isPending}>
      {isPending ? "Signing out..." : "Sign out"}
    </Button>
  );
}
