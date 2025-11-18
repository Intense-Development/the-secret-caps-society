"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAdminRealtime } from "@/hooks/useAdminRealtime";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { RevenueTrendChart } from "./RevenueTrendChart";
import { CategoryDistributionChart } from "./CategoryDistributionChart";
import { OrderStatusChart } from "./OrderStatusChart";
import { StoreLocationsMap } from "./StoreLocationsMap";
import { PendingStoresList } from "./PendingStoresList";
import { RecentActivityList } from "./RecentActivityList";
import { TopStoresList } from "./TopStoresList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import type { AdminDashboardData } from "@/application/dashboard/admin/getAdminDashboardData";

interface AdminDashboardClientProps {
  initialData: AdminDashboardData;
}

/**
 * Client component for Admin Dashboard with realtime updates
 * Handles realtime subscriptions and updates the dashboard when data changes
 */
export function AdminDashboardClient({ initialData }: AdminDashboardClientProps) {
  const t = useTranslations("admin.dashboard");
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(initialData);

  // Handle store changes (approvals, rejections, new stores)
  const handleStoreChange = useCallback(
    (payload: {
      eventType: "INSERT" | "UPDATE" | "DELETE";
      new?: Record<string, unknown>;
      old?: Record<string, unknown>;
    }) => {
      if (payload.eventType === "UPDATE") {
        const store = payload.new;
        if (store && store.verification_status) {
          // If a store was approved/rejected, refresh the dashboard
          toast.info(t("storeStatusUpdated"), {
            description: t("storeStatusUpdatedDesc", { name: store.name }),
          });
          router.refresh();
        }
      } else if (payload.eventType === "INSERT") {
        // New store added
        toast.info(t("newStoreApplication"), {
          description: t("newStoreApplicationDesc"),
        });
        router.refresh();
      }
    },
    [router, t]
  );

  // Handle order changes
  const handleOrderChange = useCallback(
    (payload: {
      eventType: "INSERT" | "UPDATE" | "DELETE";
      new?: Record<string, unknown>;
      old?: Record<string, unknown>;
    }) => {
      if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
        // Refresh dashboard to show new orders
        router.refresh();
      }
    },
    [router]
  );

  // Handle user changes (new signups)
  const handleUserChange = useCallback(
    (payload: {
      eventType: "INSERT" | "UPDATE" | "DELETE";
      new?: Record<string, unknown>;
      old?: Record<string, unknown>;
    }) => {
      if (payload.eventType === "INSERT") {
        // New user registered
        router.refresh();
      }
    },
    [router]
  );

  // Subscribe to realtime updates
  useAdminRealtime({
    onStoreChange: handleStoreChange,
    onOrderChange: handleOrderChange,
    onUserChange: handleUserChange,
    enabled: true,
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{t("title")}</h2>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {/* Overview Cards */}
      <SummaryCards cards={dashboardData.summaryCards} />

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t("revenueTrend")}</CardTitle>
            <CardDescription>{t("revenueTrendDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueTrendChart data={dashboardData.revenueTrend} />
          </CardContent>
        </Card>

        {/* Category Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t("categoryDistribution")}</CardTitle>
            <CardDescription>{t("categoryDistributionDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryDistributionChart data={dashboardData.categoryDistribution} />
          </CardContent>
        </Card>

        {/* Order Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t("orderStatus")}</CardTitle>
            <CardDescription>{t("orderStatusDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <OrderStatusChart data={dashboardData.orderStatus} />
          </CardContent>
        </Card>

        {/* Store Locations Map */}
        <Card>
          <CardHeader>
            <CardTitle>{t("storeLocations")}</CardTitle>
            <CardDescription>{t("storeLocationsDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <StoreLocationsMap stores={dashboardData.storeLocations} />
          </CardContent>
        </Card>
      </div>

      {/* Lists Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Pending Stores List */}
        <div className="lg:col-span-1">
          <PendingStoresList stores={dashboardData.pendingStores} />
        </div>

        {/* Recent Activity List */}
        <div className="lg:col-span-1">
          <RecentActivityList activities={dashboardData.recentActivities} />
        </div>

        {/* Top Stores List */}
        <div className="lg:col-span-1">
          <TopStoresList stores={dashboardData.topStores} />
        </div>
      </div>
    </div>
  );
}

