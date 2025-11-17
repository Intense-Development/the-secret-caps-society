import { createClient } from "@/lib/supabase/server";
import type { SummaryCard } from "@/components/dashboard/SummaryCards";

export type SellerDashboardData = {
  summaryCards: SummaryCard[];
  lowStockProducts: Array<{
    id: string;
    name: string;
    stock: number;
    category: string;
  }>;
  pendingOrders: Array<{
    id: string;
    status: string;
    total_amount: number;
    created_at: string;
  }>;
};

/**
 * Get seller's store IDs
 */
export async function getSellerStores(userId: string): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("stores")
    .select("id")
    .eq("owner_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((store) => store.id);
}

/**
 * Get revenue from order_items for last 7 days
 * Joins: order_items -> products (filter by store_id)
 */
export async function getSellerRevenue7Days(
  storeIds: string[]
): Promise<number> {
  if (storeIds.length === 0) {
    return 0;
  }

  const supabase = await createClient();

  // Calculate date 7 days ago
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoISO = sevenDaysAgo.toISOString();

  // Get all products from seller's stores
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id")
    .in("store_id", storeIds);

  if (productsError) {
    throw new Error(productsError.message);
  }

  if (!products || products.length === 0) {
    return 0;
  }

  const productIds = products.map((p) => p.id);

  // Get order_items for these products in last 7 days
  const { data: orderItems, error: orderItemsError } = await supabase
    .from("order_items")
    .select("price, quantity")
    .in("product_id", productIds)
    .gte("created_at", sevenDaysAgoISO);

  if (orderItemsError) {
    throw new Error(orderItemsError.message);
  }

  if (!orderItems || orderItems.length === 0) {
    return 0;
  }

  // Calculate total revenue
  const total = orderItems.reduce((sum, item) => {
    const price = parseFloat(item.price.toString());
    const quantity = item.quantity;
    return sum + price * quantity;
  }, 0);

  return total;
}

/**
 * Get count of distinct completed orders for seller's products
 * Joins: orders -> order_items -> products (filter by store_id)
 */
export async function getSellerOrdersFulfilled(
  storeIds: string[]
): Promise<number> {
  if (storeIds.length === 0) {
    return 0;
  }

  const supabase = await createClient();

  // Get all products from seller's stores
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id")
    .in("store_id", storeIds);

  if (productsError) {
    throw new Error(productsError.message);
  }

  if (!products || products.length === 0) {
    return 0;
  }

  const productIds = products.map((p) => p.id);

  // Get unique order IDs from order_items for these products
  const { data: orderItems, error: orderItemsError } = await supabase
    .from("order_items")
    .select("order_id")
    .in("product_id", productIds);

  if (orderItemsError) {
    throw new Error(orderItemsError.message);
  }

  if (!orderItems || orderItems.length === 0) {
    return 0;
  }

  // Get unique order IDs
  const uniqueOrderIds = [...new Set(orderItems.map((item) => item.order_id))];

  // Get all completed orders and count them
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id")
    .in("id", uniqueOrderIds)
    .eq("status", "completed");

  if (ordersError) {
    throw new Error(ordersError.message);
  }

  return orders?.length ?? 0;
}

/**
 * Get count of products from seller's stores
 */
export async function getSellerProductsCount(
  storeIds: string[]
): Promise<number> {
  if (storeIds.length === 0) {
    return 0;
  }

  const supabase = await createClient();

  const { count, error } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .in("store_id", storeIds);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

/**
 * Get products with stock < 10 from seller's stores
 * Ordered by stock ascending (lowest first)
 */
async function getSellerLowStockProductsInternal(storeIds: string[]) {
  if (storeIds.length === 0) {
    return [];
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("id, name, stock, category")
    .in("store_id", storeIds)
    .lt("stock", 10)
    .order("stock", { ascending: true })
    .limit(20);

  if (error) {
    throw new Error(error.message);
  }

  return (
    data?.map((product) => ({
      id: product.id,
      name: product.name,
      stock: product.stock ?? 0,
      category: product.category ?? "Uncategorized",
    })) ?? []
  );
}

export async function getSellerLowStockProducts(storeIds: string[]) {
  if (storeIds.length === 0) {
    return [];
  }

  const cacheKey = `seller-low-stock-${storeIds.sort().join("-")}`;
  return unstable_cache(
    async () => getSellerLowStockProductsInternal(storeIds),
    [cacheKey],
    {
      revalidate: 60,
      tags: storeIds.map((id) => `dashboard-seller-store-${id}`),
    }
  )();
}

/**
 * Get pending orders (pending + processing) for seller's products
 * Joins: orders -> order_items -> products (filter by store_id)
 */
export async function getSellerPendingOrders(storeIds: string[]) {
  if (storeIds.length === 0) {
    return [];
  }

  const supabase = await createClient();

  // Get all products from seller's stores
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id")
    .in("store_id", storeIds);

  if (productsError) {
    throw new Error(productsError.message);
  }

  if (!products || products.length === 0) {
    return [];
  }

  const productIds = products.map((p) => p.id);

  // Get unique order IDs from order_items for these products
  const { data: orderItems, error: orderItemsError } = await supabase
    .from("order_items")
    .select("order_id")
    .in("product_id", productIds);

  if (orderItemsError) {
    throw new Error(orderItemsError.message);
  }

  if (!orderItems || orderItems.length === 0) {
    return [];
  }

  // Get unique order IDs
  const uniqueOrderIds = [...new Set(orderItems.map((item) => item.order_id))];

  // Get pending/processing orders
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id, status, total_amount, created_at")
    .in("id", uniqueOrderIds)
    .in("status", ["pending", "processing"])
    .order("created_at", { ascending: false })
    .limit(10);

  if (ordersError) {
    throw new Error(ordersError.message);
  }

  return (
    orders?.map((order) => ({
      id: order.id,
      status: order.status,
      total_amount: parseFloat(order.total_amount.toString()),
      created_at: order.created_at,
    })) ?? []
  );
}

/**
 * Format currency value
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Calculate percentage change (placeholder - would need historical data)
 */
function calculatePercentageChange(current: number, previous: number): string {
  if (previous === 0) {
    return current > 0 ? "+100%" : "0%";
  }
  const change = ((current - previous) / previous) * 100;
  return `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
}

/**
 * Get seller dashboard data with all metrics aggregated
 */
export async function getSellerDashboardData(
  userId: string
): Promise<SellerDashboardData> {
  // Get seller's stores first
  const storeIds = await getSellerStores(userId);

  // Fetch all metrics in parallel (except those dependent on storeIds)
  const [revenue7d, ordersFulfilled, productsCount, lowStockProducts, pendingOrders] =
    await Promise.all([
      getSellerRevenue7Days(storeIds),
      getSellerOrdersFulfilled(storeIds),
      getSellerProductsCount(storeIds),
      getSellerLowStockProducts(storeIds),
      getSellerPendingOrders(storeIds),
    ]);

  // Calculate revenue 30 days for comparison (placeholder - would need separate query)
  const revenue30d = 0; // TODO: Implement in future phase

  const summaryCards: SummaryCard[] = [
    {
      id: "revenue-7d",
      title: "Revenue (7 days)",
      value: formatCurrency(revenue7d),
      changeLabel: calculatePercentageChange(revenue7d, revenue30d),
      trend: revenue7d >= revenue30d ? "up" : "down",
    },
    {
      id: "orders-fulfilled",
      title: "Orders fulfilled",
      value: ordersFulfilled.toString(),
      changeLabel: ordersFulfilled > 0 ? "+0" : "0",
      trend: "up",
    },
    {
      id: "products-listed",
      title: "Products listed",
      value: productsCount.toString(),
      changeLabel: productsCount > 0 ? "+0" : "0",
      trend: "up",
    },
    {
      id: "low-stock-alerts",
      title: "Low stock alerts",
      value: lowStockProducts.length.toString(),
      changeLabel:
        lowStockProducts.length > 0
          ? `${lowStockProducts.length} products`
          : "",
      trend: lowStockProducts.length > 0 ? "down" : "up",
    },
  ];

  return {
    summaryCards,
    lowStockProducts,
    pendingOrders,
  };
}
