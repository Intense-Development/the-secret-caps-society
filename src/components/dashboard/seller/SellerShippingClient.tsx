"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Package } from "lucide-react";
import { ShipmentsTable } from "./ShipmentsTable";
import { ShipmentForm } from "./ShipmentForm";
import type { Shipment, ShipmentStatus } from "@/application/shipping/seller/getSellerShipments";
import { toast } from "sonner";

interface SellerShippingClientProps {
  initialShipments: Shipment[];
  storeId: string | null;
  stores: Array<{ id: string; name: string }>;
}

export function SellerShippingClient({
  initialShipments,
  storeId,
  stores,
}: SellerShippingClientProps) {
  const t = useTranslations("seller.shipping");
  const [shipments, setShipments] = useState<Shipment[]>(initialShipments);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(storeId);

  // Get selected store from localStorage
  useEffect(() => {
    const storeIdFromStorage = localStorage.getItem("selectedStoreId");
    if (storeIdFromStorage) {
      setSelectedStoreId(storeIdFromStorage);
    }
  }, []);

  // Fetch shipments when store or status filter changes
  useEffect(() => {
    if (selectedStoreId) {
      fetchShipments(selectedStoreId, statusFilter);
    } else {
      setShipments([]);
    }
  }, [selectedStoreId, statusFilter]);

  const fetchShipments = async (storeId: string, status: string) => {
    try {
      const statusParam = status === "all" ? "" : `&status=${status}`;
      const response = await fetch(
        `/api/seller/shipping?storeId=${storeId}${statusParam}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch shipments");
      }
      const data = await response.json();
      setShipments(data.shipments || []);
    } catch (error) {
      console.error("Error fetching shipments:", error);
      toast.error("Failed to load shipments");
    }
  };

  const handleRefresh = () => {
    if (selectedStoreId) {
      fetchShipments(selectedStoreId, statusFilter);
    }
  };

  const handleStoreChange = (newStoreId: string) => {
    setSelectedStoreId(newStoreId);
    localStorage.setItem("selectedStoreId", newStoreId);
  };

  const handleCreateFromOrder = () => {
    // Prompt for order ID
    const orderId = prompt("Enter Order ID:");
    if (orderId) {
      setSelectedOrderId(orderId);
      setIsCreateDialogOpen(true);
    }
  };

  // Filter shipments by search query
  const filteredShipments = useMemo(() => {
    if (!searchQuery) {
      return shipments;
    }

    const query = searchQuery.toLowerCase();
    return shipments.filter(
      (shipment) =>
        shipment.id.toLowerCase().includes(query) ||
        shipment.order_id.toLowerCase().includes(query) ||
        shipment.tracking_number?.toLowerCase().includes(query) ||
        shipment.carrier?.toLowerCase().includes(query)
    );
  }, [shipments, searchQuery]);

  if (stores.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Shipping</h2>
          <p className="text-muted-foreground">Manage shipments and tracking</p>
        </div>
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          <p className="mb-2">No stores found</p>
          <p className="text-sm">
            You need to create a store before you can manage shipments.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Shipping</h2>
          <p className="text-muted-foreground">Manage shipments and tracking</p>
        </div>
        <div className="flex items-center gap-4">
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
          <Button onClick={handleCreateFromOrder}>
            <Plus className="mr-2 h-4 w-4" />
            Create Shipment
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search shipments..."
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
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="in_transit">In Transit</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Shipments Table */}
      <ShipmentsTable
        shipments={filteredShipments}
        storeId={selectedStoreId}
        onRefresh={handleRefresh}
      />

      {/* Create Dialog */}
      {isCreateDialogOpen && (
        <ShipmentForm
          orderId={selectedOrderId || undefined}
          storeId={selectedStoreId}
          onClose={() => {
            setIsCreateDialogOpen(false);
            setSelectedOrderId(null);
            handleRefresh();
          }}
        />
      )}
    </div>
  );
}

