"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { OrdersTable } from "./OrdersTable";
import type { SellerOrder } from "@/application/orders/seller/getSellerOrders";
import { toast } from "sonner";

interface SellerOrdersClientProps {
  initialOrders: SellerOrder[];
  storeId: string | null;
  stores: Array<{ id: string; name: string }>;
}

export function SellerOrdersClient({
  initialOrders,
  storeId,
  stores,
}: SellerOrdersClientProps) {
  const t = useTranslations("seller.orders");
  const [orders, setOrders] = useState<SellerOrder[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(
    storeId
  );

  // Get selected store from localStorage (set by SellerHeader)
  useEffect(() => {
    const storeIdFromStorage = localStorage.getItem("selectedStoreId");
    if (storeIdFromStorage) {
      setSelectedStoreId(storeIdFromStorage);
    }
  }, []);

  // Fetch orders when store or status filter changes
  useEffect(() => {
    if (selectedStoreId) {
      fetchOrders(selectedStoreId, statusFilter);
    } else {
      setOrders([]);
    }
  }, [selectedStoreId, statusFilter]);

  const fetchOrders = async (storeId: string, status: string) => {
    try {
      const statusParam = status === "all" ? "" : `&status=${status}`;
      const response = await fetch(
        `/api/seller/orders?storeId=${storeId}${statusParam}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    }
  };

  const handleRefresh = () => {
    if (selectedStoreId) {
      fetchOrders(selectedStoreId, statusFilter);
    }
  };

  const handleStoreChange = (newStoreId: string) => {
    setSelectedStoreId(newStoreId);
    localStorage.setItem("selectedStoreId", newStoreId);
  };

  // Filter orders by search query
  const filteredOrders = useMemo(() => {
    if (!searchQuery) {
      return orders;
    }

    const query = searchQuery.toLowerCase();
    return orders.filter(
      (order) =>
        order.id.toLowerCase().includes(query) ||
        order.buyer_name?.toLowerCase().includes(query) ||
        order.buyer_email?.toLowerCase().includes(query) ||
        order.items.some((item) =>
          item.product_name.toLowerCase().includes(query)
        )
    );
  }, [orders, searchQuery]);

  if (stores.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Orders</h2>
          <p className="text-muted-foreground">View and manage your orders</p>
        </div>
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          <p className="mb-2">No stores found</p>
          <p className="text-sm">
            You need to create a store before you can view orders.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Orders</h2>
          <p className="text-muted-foreground">View and manage your orders</p>
        </div>
        {stores.length > 1 && (
          <Select
            value={selectedStoreId || ""}
            onValueChange={handleStoreChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select store" />
            </SelectTrigger>
            <SelectContent>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <OrdersTable orders={filteredOrders} onRefresh={handleRefresh} />
    </div>
  );
}

