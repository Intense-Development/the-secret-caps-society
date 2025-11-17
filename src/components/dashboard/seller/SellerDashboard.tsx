import { getSellerDashboardData } from "@/application/dashboard/seller/getSellerDashboardData";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Store,
  AlertTriangle,
  Package,
  ShoppingBag,
  Calendar,
  Clock,
  TrendingDown,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SellerDashboardProps {
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
 * Get stock alert severity
 */
function getStockSeverity(stock: number): {
  variant: "destructive" | "warning" | "secondary";
  label: string;
  icon: typeof AlertTriangle | typeof TrendingDown;
} {
  if (stock === 0) {
    return {
      variant: "destructive",
      label: "Out of Stock",
      icon: AlertTriangle,
    };
  }
  if (stock < 3) {
    return {
      variant: "destructive",
      label: "Critical",
      icon: AlertTriangle,
    };
  }
  if (stock < 5) {
    return {
      variant: "warning",
      label: "Low",
      icon: TrendingDown,
    };
  }
  return {
    variant: "secondary",
    label: "Running Low",
    icon: TrendingDown,
  };
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

export default async function SellerDashboard({ userId }: SellerDashboardProps) {
  const dashboardData = await getSellerDashboardData(userId);

  const hasNoStores =
    dashboardData.summaryCards[0]?.value === "$0.00" &&
    dashboardData.summaryCards[1]?.value === "0" &&
    dashboardData.summaryCards[2]?.value === "0";

  const hasLowStock =
    dashboardData.lowStockProducts && dashboardData.lowStockProducts.length > 0;
  const hasPendingOrders =
    dashboardData.pendingOrders && dashboardData.pendingOrders.length > 0;

  return (
    <div className="space-y-8">
      <SummaryCards cards={dashboardData.summaryCards} />

      {hasNoStores ? (
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Store Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Store className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No stores yet</h3>
              <p className="text-muted-foreground max-w-md">
                You haven&rsquo;t created any stores yet. Create your first store
                to start selling.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Low Stock Alerts Section */}
          {hasLowStock ? (
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
                    const severity = getStockSeverity(product.stock);
                    const SeverityIcon = severity.icon;
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
                              <Badge variant={severity.variant} className="mt-1">
                                <SeverityIcon className="h-3 w-3 mr-1" />
                                {severity.label}
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
          ) : (
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Inventory Status
                </CardTitle>
                <CardDescription className="mt-1">
                  Your inventory levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4 mb-4">
                    <Package className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    All products well stocked
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    None of your products are running low on stock.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

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
        </>
      )}
    </div>
  );
}
