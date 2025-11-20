import { createClient } from "@/lib/supabase/server";

export type ShipmentStatus = "pending" | "shipped" | "in_transit" | "delivered" | "failed";

export type Shipment = {
  id: string;
  order_id: string;
  tracking_number: string | null;
  carrier: string | null;
  status: ShipmentStatus;
  shipped_at: string | null;
  estimated_delivery: string | null;
  actual_delivery: string | null;
  created_at: string;
  updated_at: string;
  order?: {
    id: string;
    total_amount: number;
    status: string;
    created_at: string;
  };
};

/**
 * Get all shipments for orders containing seller's products
 */
export async function getSellerShipments(
  storeId: string | null,
  statusFilter?: ShipmentStatus
): Promise<Shipment[]> {
  if (!storeId) {
    return [];
  }

  const supabase = await createClient();

  // Get seller's products
  const { data: products } = await supabase
    .from("products")
    .select("id")
    .eq("store_id", storeId);

  if (!products || products.length === 0) {
    return [];
  }

  const productIds = products.map((p) => p.id);

  // Get order_items for these products
  const { data: orderItems } = await supabase
    .from("order_items")
    .select("order_id")
    .in("product_id", productIds);

  if (!orderItems || orderItems.length === 0) {
    return [];
  }

  const orderIds = [...new Set(orderItems.map((item) => item.order_id))];

  // Get shipments for these orders
  let shipmentsQuery = supabase
    .from("shipments")
    .select("*, orders(id, total_amount, status, created_at)")
    .in("order_id", orderIds)
    .order("created_at", { ascending: false });

  if (statusFilter) {
    shipmentsQuery = shipmentsQuery.eq("status", statusFilter);
  }

  const { data: shipments, error } = await shipmentsQuery;

  if (error) {
    throw new Error(error.message);
  }

  if (!shipments) {
    return [];
  }

  return shipments.map((shipment) => ({
    id: shipment.id,
    order_id: shipment.order_id,
    tracking_number: shipment.tracking_number,
    carrier: shipment.carrier,
    status: shipment.status as ShipmentStatus,
    shipped_at: shipment.shipped_at,
    estimated_delivery: shipment.estimated_delivery,
    actual_delivery: shipment.actual_delivery,
    created_at: shipment.created_at,
    updated_at: shipment.updated_at,
    order: shipment.orders
      ? {
          id: shipment.orders.id,
          total_amount: parseFloat(shipment.orders.total_amount.toString()),
          status: shipment.orders.status,
          created_at: shipment.orders.created_at,
        }
      : undefined,
  }));
}

/**
 * Get a single shipment
 */
export async function getSellerShipment(
  shipmentId: string,
  storeId: string | null
): Promise<Shipment | null> {
  if (!storeId) {
    return null;
  }

  const shipments = await getSellerShipments(storeId);
  return shipments.find((s) => s.id === shipmentId) || null;
}

/**
 * Verify that an order contains seller's products
 */
export async function verifyOrderBelongsToSeller(
  orderId: string,
  storeId: string | null
): Promise<boolean> {
  if (!storeId) {
    return false;
  }

  const supabase = await createClient();

  // Get seller's products
  const { data: products } = await supabase
    .from("products")
    .select("id")
    .eq("store_id", storeId);

  if (!products || products.length === 0) {
    return false;
  }

  const productIds = products.map((p) => p.id);

  // Check if order contains any of seller's products
  const { data: orderItems } = await supabase
    .from("order_items")
    .select("id")
    .eq("order_id", orderId)
    .in("product_id", productIds)
    .limit(1);

  return (orderItems?.length || 0) > 0;
}

