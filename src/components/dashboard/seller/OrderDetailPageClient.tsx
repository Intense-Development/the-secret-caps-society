"use client";

import { useRouter } from "@/i18n/routing-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { SellerOrder } from "@/application/orders/seller/getSellerOrders";

interface OrderDetailPageClientProps {
  order: SellerOrder;
  storeId: string | null;
}

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

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function OrderDetailPageClient({
  order,
  storeId,
}: OrderDetailPageClientProps) {
  const router = useRouter();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/seller/orders")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h2>
          <p className="text-muted-foreground">Order details and information</p>
        </div>
        <Badge variant={getStatusBadgeVariant(order.status)}>
          {order.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Name: </span>
              <span className="font-medium">
                {order.buyer_name || "Unknown"}
              </span>
            </div>
            {order.buyer_email && (
              <div>
                <span className="text-sm text-muted-foreground">Email: </span>
                <span className="font-medium">{order.buyer_email}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Your Products Total:</span>
              <span className="font-medium">{formatPrice(order.seller_amount)}</span>
            </div>
            {order.is_partial && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Order Total:</span>
                  <span className="font-medium">
                    {formatPrice(order.total_amount)}
                  </span>
                </div>
                <Separator />
                <p className="text-xs text-muted-foreground">
                  This order contains products from other sellers. You will receive
                  payment for your portion only.
                </p>
              </>
            )}
            <div className="pt-2">
              <span className="text-sm text-muted-foreground">Placed: </span>
              <span className="text-sm">
                {formatDistanceToNow(new Date(order.created_at), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
          <CardDescription>
            {order.items.length} item(s) from your store
          </CardDescription>
        </CardHeader>
        <CardContent>
          {order.is_partial && (
            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Partial Order:</strong> This order contains products from
                other sellers. Only your products are shown below.
              </p>
            </div>
          )}
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div
                key={`${item.product_id}-${index}`}
                className="flex items-center justify-between p-3 border rounded-md"
              >
                <div className="flex-1">
                  <div className="font-medium">{item.product_name}</div>
                  <div className="text-sm text-muted-foreground">
                    Quantity: {item.quantity} × {formatPrice(item.price)}
                  </div>
                </div>
                <div className="font-medium">{formatPrice(item.total)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


