"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { SellerOrder } from "@/application/orders/seller/getSellerOrders";
import { formatDistanceToNow } from "date-fns";

interface OrderDetailDialogProps {
  order: SellerOrder;
  onClose: () => void;
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

export function OrderDetailDialog({
  order,
  onClose,
}: OrderDetailDialogProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>
                Order #{order.id.slice(0, 8).toUpperCase()}
              </DialogDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(order.status)}>
              {order.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Customer Information</h3>
            <div className="space-y-1 text-sm">
              <div>
                <span className="text-muted-foreground">Name: </span>
                <span className="font-medium">
                  {order.buyer_name || "Unknown"}
                </span>
              </div>
              {order.buyer_email && (
                <div>
                  <span className="text-muted-foreground">Email: </span>
                  <span className="font-medium">{order.buyer_email}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Order Items</h3>
            {order.is_partial && (
              <div className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Partial Order:</strong> This order contains products
                  from other sellers. Only your products are shown below.
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
          </div>

          <Separator />

          {/* Order Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Your Products Total:</span>
              <span className="font-medium">{formatPrice(order.seller_amount)}</span>
            </div>
            {order.is_partial && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Order Total:</span>
                <span className="font-medium">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
            )}
            {order.is_partial && (
              <div className="pt-2 border-t text-xs text-muted-foreground">
                Note: The order total includes products from other sellers. You
                will receive payment for your portion only.
              </div>
            )}
          </div>

          <Separator />

          {/* Order Dates */}
          <div className="space-y-1 text-sm">
            <div>
              <span className="text-muted-foreground">Placed: </span>
              <span>
                {new Date(order.created_at).toLocaleString()} (
                {formatDistanceToNow(new Date(order.created_at), {
                  addSuffix: true,
                })}
                )
              </span>
            </div>
            {order.updated_at !== order.created_at && (
              <div>
                <span className="text-muted-foreground">Last Updated: </span>
                <span>
                  {new Date(order.updated_at).toLocaleString()} (
                  {formatDistanceToNow(new Date(order.updated_at), {
                    addSuffix: true,
                  })}
                  )
                </span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

