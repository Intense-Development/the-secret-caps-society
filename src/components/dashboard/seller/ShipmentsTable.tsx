"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Eye, Package, Truck } from "lucide-react";
import type { Shipment } from "@/application/shipping/seller/getSellerShipments";
import { ShipmentDetailDialog } from "./ShipmentDetailDialog";
import { ShipmentForm } from "./ShipmentForm";

interface ShipmentsTableProps {
  shipments: Shipment[];
  storeId: string | null;
  onRefresh: () => void;
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

export function ShipmentsTable({
  shipments,
  storeId,
  onRefresh,
}: ShipmentsTableProps) {
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(
    null
  );
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(
    null
  );

  if (shipments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <Truck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No shipments found</h3>
        <p className="text-muted-foreground">
          Shipments will appear here when you create them for orders.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Tracking Number</TableHead>
              <TableHead>Carrier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Shipped Date</TableHead>
              <TableHead>Estimated Delivery</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shipments.map((shipment) => (
              <TableRow key={shipment.id}>
                <TableCell className="font-mono text-sm">
                  {shipment.order_id.slice(0, 8).toUpperCase()}
                </TableCell>
                <TableCell>
                  {shipment.tracking_number ? (
                    <span className="font-medium">{shipment.tracking_number}</span>
                  ) : (
                    <span className="text-muted-foreground">Not provided</span>
                  )}
                </TableCell>
                <TableCell>
                  {shipment.carrier || (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(shipment.status)}>
                    {shipment.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {shipment.shipped_at ? (
                    formatDistanceToNow(new Date(shipment.shipped_at), {
                      addSuffix: true,
                    })
                  ) : (
                    <span>—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {shipment.estimated_delivery ? (
                    new Date(shipment.estimated_delivery).toLocaleDateString()
                  ) : (
                    <span>—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingShipment(shipment)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedShipment(shipment)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedShipment && (
        <ShipmentDetailDialog
          shipment={selectedShipment}
          onClose={() => setSelectedShipment(null)}
        />
      )}

      {editingShipment && (
        <ShipmentForm
          shipment={editingShipment}
          storeId={storeId}
          onClose={() => {
            setEditingShipment(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}

