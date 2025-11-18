"use client";

import { useAdminRealtime } from "@/hooks/useAdminRealtime";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";

/**
 * RealtimeIndicator Component
 * Displays the connection status of Supabase Realtime subscriptions
 */
export function RealtimeIndicator() {
  const { isConnected } = useAdminRealtime({ enabled: true });

  return (
    <div
      data-status={isConnected ? "connected" : "disconnected"}
      className="flex items-center gap-2"
    >
      {isConnected ? (
        <>
          <Wifi className="h-3 w-3 text-green-500" />
          <Badge variant="success" className="text-xs">
            Live
          </Badge>
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3 text-muted-foreground" />
          <Badge variant="outline" className="text-xs">
            Offline
          </Badge>
        </>
      )}
    </div>
  );
}

