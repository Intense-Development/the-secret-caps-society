import { createClient } from "@/lib/supabase/server";

export type SellerOrderItem = {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
};

export type SellerOrder = {
  id: string;
  buyer_id: string;
  buyer_name?: string;
  buyer_email?: string;
  total_amount: number;
  seller_amount: number; // Amount for seller's products only
  status: string;
  is_partial: boolean; // True if order contains products from other sellers
  created_at: string;
  updated_at: string;
  items: SellerOrderItem[];
};

/**
 * Get all orders for a seller's store(s)
 * Includes both full orders (100% seller's products) and partial orders
 */
export async function getSellerOrders(
  storeId: string | null,
  statusFilter?: string
): Promise<SellerOrder[]> {
  if (!storeId) {
    return [];
  }

  const supabase = await createClient();

  // Get all products from seller's store
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
    .select("order_id, product_id, quantity, price")
    .in("product_id", productIds);

  if (!orderItems || orderItems.length === 0) {
    return [];
  }

  // Get all product names in one query
  const uniqueProductIds = [...new Set(orderItems.map((item) => item.product_id))];
  const { data: productsData } = await supabase
    .from("products")
    .select("id, name")
    .in("id", uniqueProductIds);

  const productNameMap = new Map(
    (productsData || []).map((p) => [p.id, p.name])
  );

  // Group order_items by order_id and calculate seller revenue per order
  const orderItemMap = new Map<string, SellerOrderItem[]>();
  const sellerRevenueMap = new Map<string, number>();

  for (const item of orderItems) {
    const productName = productNameMap.get(item.product_id) || "Unknown Product";
    const price = parseFloat(item.price.toString());
    const total = price * item.quantity;

    const orderItem: SellerOrderItem = {
      id: `${item.order_id}-${item.product_id}`, // Unique ID for order item
      product_id: item.product_id,
      product_name: productName,
      quantity: item.quantity,
      price: price,
      total: total,
    };

    if (!orderItemMap.has(item.order_id)) {
      orderItemMap.set(item.order_id, []);
    }
    orderItemMap.get(item.order_id)!.push(orderItem);

    // Calculate seller revenue
    const currentRevenue = sellerRevenueMap.get(item.order_id) || 0;
    sellerRevenueMap.set(item.order_id, currentRevenue + total);
  }

  const orderIds = Array.from(orderItemMap.keys());

  // Build query for orders
  let ordersQuery = supabase
    .from("orders")
    .select("id, buyer_id, total_amount, status, created_at, updated_at")
    .in("id", orderIds);

  // Apply status filter if provided
  if (statusFilter && statusFilter !== "all") {
    ordersQuery = ordersQuery.eq("status", statusFilter);
  }

  const { data: orders, error } = await ordersQuery.order("created_at", {
    ascending: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!orders) {
    return [];
  }

  // Get buyer information
  const buyerIds = [...new Set(orders.map((o) => o.buyer_id))];
  const { data: buyers } = await supabase
    .from("users")
    .select("id, name, email")
    .in("id", buyerIds);

  const buyerMap = new Map(
    (buyers || []).map((b) => [b.id, { name: b.name, email: b.email }])
  );

  // Build result with order items and partial order detection
  const result: SellerOrder[] = [];

  for (const order of orders) {
    const sellerRevenue = sellerRevenueMap.get(order.id) || 0;
    const orderTotal = parseFloat(order.total_amount.toString());
    const isPartial = Math.abs(sellerRevenue - orderTotal) >= 0.01; // Not 100% seller

    const buyer = buyerMap.get(order.buyer_id);

    result.push({
      id: order.id,
      buyer_id: order.buyer_id,
      buyer_name: buyer?.name,
      buyer_email: buyer?.email,
      total_amount: orderTotal,
      seller_amount: sellerRevenue,
      status: order.status,
      is_partial: isPartial,
      created_at: order.created_at,
      updated_at: order.updated_at,
      items: orderItemMap.get(order.id) || [],
    });
  }

  return result;
}

/**
 * Get a single order with full details
 */
export async function getSellerOrder(
  orderId: string,
  storeId: string | null
): Promise<SellerOrder | null> {
  if (!storeId) {
    return null;
  }

  const orders = await getSellerOrders(storeId);
  return orders.find((o) => o.id === orderId) || null;
}

