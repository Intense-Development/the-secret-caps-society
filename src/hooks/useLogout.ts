"use client";

import { useState, useCallback } from "react";
import { useRouter } from "@/i18n/routing-config";
import { createClient } from "@/lib/supabase/client";
import { trackLogout } from "@/lib/analytics";

interface UseLogoutOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseLogoutReturn {
  logout: () => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to handle user logout
 * - Calls logout API endpoint
 * - Clears client-side Supabase session
 * - Handles errors gracefully
 * - Tracks analytics events
 * - Does NOT clear cart (preserved for guest checkout)
 */
export function useLogout(options: UseLogoutOptions = {}): UseLogoutReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Call logout API endpoint
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Even if API fails, we'll clear client-side session (graceful degradation)
      const supabase = createClient();
      await supabase.auth.signOut();

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Logout failed");
      }

      // Track successful logout
      trackLogout(true);

      // Redirect to home page
      router.push("/");
      router.refresh();

      // Call success callback if provided
      options.onSuccess?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);

      // Track failed logout
      trackLogout(false, error.message);

      // Still clear client-side session even on error
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch {
        // Ignore errors during cleanup
      }

      // Call error callback if provided
      options.onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [router, options]);

  return {
    logout,
    isLoading,
    error,
  };
}

