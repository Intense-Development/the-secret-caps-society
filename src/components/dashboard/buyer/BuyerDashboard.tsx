import { getBuyerDashboardData } from "@/application/dashboard/buyer/getBuyerDashboardData";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingBag, Calendar, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface BuyerDashboardProps {
  userId: string;
}

/**
 * Get badge variant for order status
 */
function getStatusBadgeVariant(
  status: string
): "success" | "warning" | "secondary" | "destructive" | "outline" {
  switch (status.toLowerCase()) {
    case "completed":
      return "success";
    case "processing":
      return "warning";
    case "pending":
      return "secondary";
    case "cancelled":
    case "refunded":
      return "destructive";
    default:
      return "outline";
  }
}

/**
 * Format order date with relative time
 */
function formatOrderDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const relative = formatDistanceToNow(date, { addSuffix: true });
    const absolute = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${absolute} (${relative})`;
  } catch {
    return new Date(dateString).toLocaleDateString();
  }
}

export default async function BuyerDashboard({ userId }: BuyerDashboardProps) {
  const dashboardData = await getBuyerDashboardData(userId);

  const hasNoOrders = dashboardData.summaryCards[0]?.value === "0";

  return (
    <div className="space-y-8">
      <SummaryCards cards={dashboardData.summaryCards} />

      {/* Order History Section */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Recent Orders
              </CardTitle>
              <CardDescription className="mt-1">
                Your recent purchase history and order status
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {hasNoOrders || !dashboardData.recentOrders?.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground max-w-md">
                You haven&rsquo;t placed any orders yet. Start shopping to see
                your order history here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData.recentOrders.map((order) => {
                const statusVariant = getStatusBadgeVariant(order.status);
                return (
                  <div
                    key={order.id}
                    className="rounded-lg border border-border/50 bg-background/80 p-4 transition-colors hover:bg-background/90 hover:border-border"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium text-sm">
                            Order #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatOrderDate(order.created_at)}</span>
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
          )}
        </CardContent>
      </Card>

      {/* Quick Actions Section - Future enhancement */}
      {!hasNoOrders && dashboardData.recentOrders && dashboardData.recentOrders.length > 0 && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common actions for your orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dashboardData.recentOrders
                .filter((order) => order.status === "pending" || order.status === "processing")
                .slice(0, 2)
                .map((order) => (
                  <div
                    key={order.id}
                    className="rounded-lg border border-border/50 bg-background/50 p-4"
                  >
                    <p className="text-sm font-medium mb-1">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Track your order status
                    </p>
                  </div>
                ))}
              {dashboardData.recentOrders.filter(
                (order) => order.status === "pending" || order.status === "processing"
              ).length === 0 && (
                <p className="text-sm text-muted-foreground col-span-2">
                  No active orders requiring action at this time.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
