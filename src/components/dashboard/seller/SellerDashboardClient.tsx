"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { RevenueTrendChart } from "@/components/dashboard/admin/RevenueTrendChart";
import { CategoryDistributionChart } from "@/components/dashboard/admin/CategoryDistributionChart";
import { OrderStatusChart } from "@/components/dashboard/admin/OrderStatusChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, ShoppingBag, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useSellerRealtime } from "@/hooks/useSellerRealtime";
import type { SellerDashboardData } from "@/application/dashboard/seller/getSellerDashboardData";

interface SellerDashboardClientProps {
  initialData: SellerDashboardData;
}

/**
 * Client component for Seller Dashboard with realtime updates
 * Handles realtime subscriptions and updates the dashboard when data changes
 */
export function SellerDashboardClient({
  initialData,
}: SellerDashboardClientProps) {
  const t = useTranslations("seller.dashboard");
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(initialData);
  const [storeIds, setStoreIds] = useState<string[]>([]);

  // Get store IDs from localStorage (set by SellerHeader)
  useEffect(() => {
    const selectedStoreId = localStorage.getItem("selectedStoreId");
    if (selectedStoreId) {
      setStoreIds([selectedStoreId]);
    } else {
      // If no store selected, we'll need to fetch all stores
      // For now, use empty array - real-time will work once store is selected
      setStoreIds([]);
    }
  }, []);

  // Handle order changes
  const handleOrderChange = useCallback(
    (payload: {
      eventType: "INSERT" | "UPDATE" | "DELETE";
      new?: Record<string, unknown>;
      old?: Record<string, unknown>;
    }) => {
      if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
        // Refresh dashboard to show new/updated orders
        router.refresh();
      }
    },
    [router]
  );

  // Handle product changes
  const handleProductChange = useCallback(
    (payload: {
      eventType: "INSERT" | "UPDATE" | "DELETE";
      new?: Record<string, unknown>;
      old?: Record<string, unknown>;
    }) => {
      if (payload.eventType === "UPDATE") {
        const product = payload.new;
        if (product && product.stock !== undefined) {
          // If stock was updated, refresh to update low stock alerts
          router.refresh();
        }
      } else if (payload.eventType === "INSERT") {
        // New product added
        router.refresh();
      }
    },
    [router]
  );

  // Handle shipment changes
  const handleShipmentChange = useCallback(
    (payload: {
      eventType: "INSERT" | "UPDATE" | "DELETE";
      new?: Record<string, unknown>;
      old?: Record<string, unknown>;
    }) => {
      if (payload.eventType === "UPDATE") {
        const shipment = payload.new;
        if (shipment && shipment.status) {
          toast.info("Shipment status updated", {
            description: `Shipment status changed to ${shipment.status}`,
          });
          router.refresh();
        }
      }
    },
    [router]
  );

  // Subscribe to realtime updates
  useSellerRealtime({
    storeIds,
    onOrderChange: handleOrderChange,
    onProductChange: handleProductChange,
    onShipmentChange: handleShipmentChange,
    enabled: storeIds.length > 0,
  });

  const hasLowStock =
    dashboardData.lowStockProducts && dashboardData.lowStockProducts.length > 0;
  const hasPendingOrders =
    dashboardData.pendingOrders && dashboardData.pendingOrders.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{t("title")}</h2>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {/* Overview Cards */}
      <SummaryCards cards={dashboardData.summaryCards} />

      {/* Low Stock Alerts Section */}
      {hasLowStock && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Low Stock Alerts
                </CardTitle>
                <CardDescription className="mt-1">
                  Products that need restocking soon
                </CardDescription>
              </div>
              <Badge variant="warning" className="ml-auto">
                {dashboardData.lowStockProducts.length} products
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.lowStockProducts.map((product) => {
                const severity =
                  product.stock === 0
                    ? "destructive"
                    : product.stock < 3
                    ? "destructive"
                    : product.stock < 5
                    ? "warning"
                    : "secondary";
                return (
                  <div
                    key={product.id}
                    className="rounded-lg border border-border/50 bg-background/80 p-4 transition-colors hover:bg-background/90 hover:border-border"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium text-sm">{product.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {product.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p
                            className={`font-semibold text-lg ${
                              product.stock < 3
                                ? "text-destructive"
                                : product.stock < 5
                                ? "text-warning"
                                : "text-muted-foreground"
                            }`}
                          >
                            {product.stock} left
                          </p>
                          <Badge variant={severity} className="mt-1">
                            {product.stock === 0
                              ? "Out of Stock"
                              : product.stock < 3
                              ? "Critical"
                              : product.stock < 5
                              ? "Low"
                              : "Running Low"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>
              Your revenue over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueTrendChart data={dashboardData.revenueTrend} />
          </CardContent>
        </Card>

        {/* Category Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>
              Product distribution across categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryDistributionChart
              data={dashboardData.categoryDistribution}
            />
          </CardContent>
        </Card>

        {/* Order Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
            <CardDescription>
              Current order distribution by status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrderStatusChart data={dashboardData.orderStatus} />
          </CardContent>
        </Card>
      </div>

      {/* Order Management Section */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Pending Orders
              </CardTitle>
              <CardDescription className="mt-1">
                Orders requiring your attention
              </CardDescription>
            </div>
            {hasPendingOrders && (
              <Badge variant="secondary" className="ml-auto">
                {dashboardData.pendingOrders.length} pending
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {hasPendingOrders ? (
            <div className="space-y-4">
              {dashboardData.pendingOrders.map((order) => {
                const statusVariant =
                  order.status === "completed"
                    ? "success"
                    : order.status === "processing"
                    ? "warning"
                    : order.status === "pending"
                    ? "secondary"
                    : "outline";
                return (
                  <div
                    key={order.id}
                    className="rounded-lg border border-border/50 bg-background/80 p-4 transition-colors hover:bg-background/90 hover:border-border"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">
                            Order #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>
                            {formatDistanceToNow(new Date(order.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-lg">
                            ${order.total_amount.toFixed(2)}
                          </p>
                        </div>
                        <Badge variant={statusVariant} className="capitalize">
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No pending orders</h3>
              <p className="text-muted-foreground max-w-md">
                Your orders will appear here when customers purchase your
                products.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

