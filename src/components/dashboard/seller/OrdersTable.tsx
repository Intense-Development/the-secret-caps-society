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
import { Eye, Package } from "lucide-react";
import type { SellerOrder } from "@/application/orders/seller/getSellerOrders";
import { OrderDetailDialog } from "./OrderDetailDialog";

interface OrdersTableProps {
  orders: SellerOrder[];
  onRefresh: () => void;
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

export function OrdersTable({ orders, onRefresh }: OrdersTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<SellerOrder | null>(null);

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No orders found</h3>
        <p className="text-muted-foreground">
          Orders will appear here when customers purchase your products.
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
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Seller Amount</TableHead>
              <TableHead>Order Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-sm">
                  {order.id.slice(0, 8).toUpperCase()}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {order.buyer_name || "Unknown"}
                    </div>
                    {order.buyer_email && (
                      <div className="text-sm text-muted-foreground">
                        {order.buyer_email}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{order.items.length} item(s)</span>
                    {order.is_partial && (
                      <Badge variant="outline" className="text-xs">
                        Partial
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {formatPrice(order.seller_amount)}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {formatPrice(order.total_amount)}
                    </div>
                    {order.is_partial && (
                      <div className="text-xs text-muted-foreground">
                        (includes other sellers)
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(order.status)}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(order.created_at), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedOrder && (
        <OrderDetailDialog
          order={selectedOrder}
          onClose={() => {
            setSelectedOrder(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}

