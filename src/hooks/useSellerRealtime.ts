import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

type ChangePayload = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new?: Record<string, unknown>;
  old?: Record<string, unknown>;
};

type UseSellerRealtimeOptions = {
  storeIds?: string[];
  onOrderChange?: (payload: ChangePayload) => void;
  onProductChange?: (payload: ChangePayload) => void;
  onShipmentChange?: (payload: ChangePayload) => void;
  enabled?: boolean;
};

/**
 * Custom hook for seller dashboard realtime subscriptions
 * Subscribes to changes in orders, products, and shipments for seller's stores
 */
export function useSellerRealtime({
  storeIds = [],
  onOrderChange,
  onProductChange,
  onShipmentChange,
  enabled = true,
}: UseSellerRealtimeOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const channelsRef = useRef<RealtimeChannel[]>([]);

  useEffect(() => {
    if (!enabled || storeIds.length === 0) {
      return;
    }

    const supabase = createClient();
    const channels: RealtimeChannel[] = [];

    // Subscribe to orders table changes
    // Note: We filter by store_id through order_items -> products -> stores
    // This is a simplified subscription - in production, you might want to filter more precisely
    if (onOrderChange) {
      const ordersChannel = supabase
        .channel("seller-orders")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "orders",
          },
          (payload) => {
            // We'll filter on the client side or use a more sophisticated approach
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

    // Subscribe to products table changes for seller's stores
    if (onProductChange && storeIds.length > 0) {
      const productsChannel = supabase
        .channel("seller-products")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "products",
            filter: `store_id=in.(${storeIds.join(",")})`,
          },
          (payload) => {
            onProductChange({
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

      channels.push(productsChannel);
    }

    // Subscribe to shipments table changes
    if (onShipmentChange) {
      const shipmentsChannel = supabase
        .channel("seller-shipments")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "shipments",
          },
          (payload) => {
            onShipmentChange({
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

      channels.push(shipmentsChannel);
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
  }, [enabled, storeIds, onOrderChange, onProductChange, onShipmentChange]);

  return {
    isConnected,
  };
}

