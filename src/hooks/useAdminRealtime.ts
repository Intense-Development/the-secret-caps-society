import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

type StoreChangePayload = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new?: Record<string, unknown>;
  old?: Record<string, unknown>;
};

type UseAdminRealtimeOptions = {
  onStoreChange?: (payload: StoreChangePayload) => void;
  onOrderChange?: (payload: StoreChangePayload) => void;
  onUserChange?: (payload: StoreChangePayload) => void;
  enabled?: boolean;
};

/**
 * Custom hook for admin dashboard realtime subscriptions
 * Subscribes to changes in stores, orders, and users tables
 */
export function useAdminRealtime({
  onStoreChange,
  onOrderChange,
  onUserChange,
  enabled = true,
}: UseAdminRealtimeOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const channelsRef = useRef<RealtimeChannel[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const channels: RealtimeChannel[] = [];

    // Subscribe to stores table changes
    if (onStoreChange) {
      const storesChannel = supabase
        .channel("admin-stores")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "stores",
          },
          (payload) => {
            onStoreChange({
              eventType: payload.eventType as "INSERT" | "UPDATE" | "DELETE",
              new: payload.new as Record<string, unknown>,
              old: payload.old as Record<string, unknown>,
            });
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            setIsConnected(true);
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            setIsConnected(false);
          }
        });

      channels.push(storesChannel);
    }

    // Subscribe to orders table changes
    if (onOrderChange) {
      const ordersChannel = supabase
        .channel("admin-orders")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "orders",
          },
          (payload) => {
            onOrderChange({
              eventType: payload.eventType as "INSERT" | "UPDATE" | "DELETE",
              new: payload.new as Record<string, unknown>,
              old: payload.old as Record<string, unknown>,
            });
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            setIsConnected(true);
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            setIsConnected(false);
          }
        });

      channels.push(ordersChannel);
    }

    // Subscribe to users table changes
    if (onUserChange) {
      const usersChannel = supabase
        .channel("admin-users")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "users",
          },
          (payload) => {
            onUserChange({
              eventType: payload.eventType as "INSERT" | "UPDATE" | "DELETE",
              new: payload.new as Record<string, unknown>,
              old: payload.old as Record<string, unknown>,
            });
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            setIsConnected(true);
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            setIsConnected(false);
          }
        });

      channels.push(usersChannel);
    }

    channelsRef.current = channels;

    // Cleanup function
    return () => {
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
      setIsConnected(false);
    };
  }, [enabled, onStoreChange, onOrderChange, onUserChange, supabase]);

  return {
    isConnected,
  };
}

