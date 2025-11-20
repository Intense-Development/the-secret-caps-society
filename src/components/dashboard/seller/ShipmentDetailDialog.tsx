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
import type { Shipment } from "@/application/shipping/seller/getSellerShipments";
import { formatDistanceToNow } from "date-fns";

interface ShipmentDetailDialogProps {
  shipment: Shipment;
  onClose: () => void;
}

function getStatusBadgeVariant(
  status: string
): "success" | "warning" | "secondary" | "destructive" | "outline" {
  switch (status.toLowerCase()) {
    case "delivered":
      return "success";
    case "in_transit":
      return "warning";
    case "shipped":
      return "secondary";
    case "pending":
      return "outline";
    case "failed":
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

export function ShipmentDetailDialog({
  shipment,
  onClose,
}: ShipmentDetailDialogProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Shipment Details</DialogTitle>
              <DialogDescription>
                Shipment ID: {shipment.id.slice(0, 8).toUpperCase()}
              </DialogDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(shipment.status)}>
              {shipment.status.replace("_", " ")}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Information */}
          {shipment.order && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Order Information</h3>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-muted-foreground">Order ID: </span>
                  <span className="font-mono font-medium">
                    {shipment.order.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Order Total: </span>
                  <span className="font-medium">
                    {formatPrice(shipment.order.total_amount)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Order Status: </span>
                  <Badge variant="outline" className="ml-1">
                    {shipment.order.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Tracking Information */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Tracking Information</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Tracking Number: </span>
                <span className="font-medium">
                  {shipment.tracking_number || (
                    <span className="text-muted-foreground">Not provided</span>
                  )}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Carrier: </span>
                <span className="font-medium">
                  {shipment.carrier || (
                    <span className="text-muted-foreground">Not specified</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Timeline</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Created: </span>
                <span>
                  {new Date(shipment.created_at).toLocaleString()} (
                  {formatDistanceToNow(new Date(shipment.created_at), {
                    addSuffix: true,
                  })}
                  )
                </span>
              </div>
              {shipment.shipped_at && (
                <div>
                  <span className="text-muted-foreground">Shipped: </span>
                  <span>
                    {new Date(shipment.shipped_at).toLocaleString()} (
                    {formatDistanceToNow(new Date(shipment.shipped_at), {
                      addSuffix: true,
                    })}
                    )
                  </span>
                </div>
              )}
              {shipment.estimated_delivery && (
                <div>
                  <span className="text-muted-foreground">
                    Estimated Delivery:{" "}
                  </span>
                  <span>
                    {new Date(shipment.estimated_delivery).toLocaleDateString()}
                  </span>
                </div>
              )}
              {shipment.actual_delivery && (
                <div>
                  <span className="text-muted-foreground">Delivered: </span>
                  <span>
                    {new Date(shipment.actual_delivery).toLocaleString()} (
                    {formatDistanceToNow(new Date(shipment.actual_delivery), {
                      addSuffix: true,
                    })}
                    )
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

