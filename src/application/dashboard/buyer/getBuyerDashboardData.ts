import { createClient } from "@/lib/supabase/server";
import type { SummaryCard } from "@/components/dashboard/SummaryCards";

export type BuyerDashboardData = {
  summaryCards: SummaryCard[];
  recentOrders: Array<{
    id: string;
    status: string;
    total_amount: number;
    created_at: string;
  }>;
};

/**
 * Get total count of orders for a buyer
 */
export async function getBuyerOrdersCount(userId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("buyer_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

/**
 * Get total amount spent by buyer (completed orders only)
 */
export async function getBuyerTotalSpent(userId: string): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("total_amount")
    .eq("buyer_id", userId)
    .in("status", ["completed"]);

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    return 0;
  }

  // Calculate sum manually since Supabase doesn't support SUM directly in select
  const total = data.reduce((sum, order) => {
    return sum + parseFloat(order.total_amount.toString());
  }, 0);

  return total;
}

/**
 * Get the most recent order date for a buyer
 */
export async function getBuyerRecentOrderDate(
  userId: string
): Promise<Date | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("created_at")
    .eq("buyer_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || !data.created_at) {
    return null;
  }

  return new Date(data.created_at);
}

/**
 * Get count of pending orders (pending + processing status)
 */
export async function getBuyerPendingOrdersCount(
  userId: string
): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("buyer_id", userId)
    .in("status", ["pending", "processing"]);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

/**
 * Get recent orders for a buyer (up to 10, sorted by most recent)
 */
export async function getBuyerRecentOrders(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("id, status, total_amount, created_at")
    .eq("buyer_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(error.message);
  }

  return (
    data?.map((order) => ({
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
 * Format date to readable string
 */
function formatDate(date: Date | null): string {
  if (!date) {
    return "N/A";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/**
 * Calculate days ago from date
 */
function getDaysAgo(date: Date | null): string {
  if (!date) {
    return "";
  }
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  }
  if (diffDays === 1) {
    return "1 day ago";
  }
  return `${diffDays} days ago`;
}

/**
 * Get buyer dashboard data with all metrics aggregated
 */
export async function getBuyerDashboardData(
  userId: string
): Promise<BuyerDashboardData> {
  // Fetch all metrics in parallel
  const [ordersCount, totalSpent, recentOrderDate, pendingCount, recentOrders] =
    await Promise.all([
      getBuyerOrdersCount(userId),
      getBuyerTotalSpent(userId),
      getBuyerRecentOrderDate(userId),
      getBuyerPendingOrdersCount(userId),
      getBuyerRecentOrders(userId),
    ]);

  const summaryCards: SummaryCard[] = [
    {
      id: "orders-placed",
      title: "Orders placed",
      value: ordersCount.toString(),
      changeLabel: ordersCount > 0 ? "+0" : "0",
      trend: "up",
    },
    {
      id: "total-spent",
      title: "Total spent",
      value: formatCurrency(totalSpent),
      changeLabel: totalSpent > 0 ? "+0%" : "0%",
      trend: "up",
    },
    {
      id: "recent-order",
      title: "Recent order",
      value: formatDate(recentOrderDate),
      changeLabel: getDaysAgo(recentOrderDate),
      trend: "up",
    },
    {
      id: "pending-orders",
      title: "Pending orders",
      value: pendingCount.toString(),
      changeLabel: pendingCount > 0 ? `${pendingCount} active` : "",
      trend: pendingCount > 0 ? "up" : "up",
    },
  ];

  return {
    summaryCards,
    recentOrders,
  };
}
