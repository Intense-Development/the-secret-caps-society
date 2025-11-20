import { createClient } from "@/lib/supabase/server";
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";
import type { RevenueTrendData } from "@/components/dashboard/admin/RevenueTrendChart";

export type RevenuePeriod = "7d" | "30d" | "90d" | "1y";

export type RevenueOverview = {
  totalRevenue: number;
  averageOrderValue: number;
  totalOrders: number;
  growthPercentage: number;
  period: RevenuePeriod;
};

export type RevenueByCategory = {
  category: string;
  revenue: number;
  orderCount: number;
};

export type TopProduct = {
  product_id: string;
  product_name: string;
  revenue: number;
  quantitySold: number;
  orderCount: number;
};

/**
 * Get revenue overview for a specific period
 */
export async function getSellerRevenueOverview(
  storeId: string | null,
  period: RevenuePeriod = "30d"
): Promise<RevenueOverview> {
  if (!storeId) {
    return {
      totalRevenue: 0,
      averageOrderValue: 0,
      totalOrders: 0,
      growthPercentage: 0,
      period,
    };
  }

  const supabase = await createClient();

  // Calculate date range
  const now = new Date();
  let startDate: Date;
  let previousStartDate: Date;
  let previousEndDate: Date;

  switch (period) {
    case "7d":
      startDate = subDays(now, 7);
      previousStartDate = subDays(now, 14);
      previousEndDate = subDays(now, 7);
      break;
    case "30d":
      startDate = subDays(now, 30);
      previousStartDate = subDays(now, 60);
      previousEndDate = subDays(now, 30);
      break;
    case "90d":
      startDate = subDays(now, 90);
      previousStartDate = subDays(now, 180);
      previousEndDate = subDays(now, 90);
      break;
    case "1y":
      startDate = subMonths(now, 12);
      previousStartDate = subMonths(now, 24);
      previousEndDate = subMonths(now, 12);
      break;
  }

  // Get seller's products
  const { data: products } = await supabase
    .from("products")
    .select("id")
    .eq("store_id", storeId);

  if (!products || products.length === 0) {
    return {
      totalRevenue: 0,
      averageOrderValue: 0,
      totalOrders: 0,
      growthPercentage: 0,
      period,
    };
  }

  const productIds = products.map((p) => p.id);

  // Get order_items for current period
  const { data: orderItems } = await supabase
    .from("order_items")
    .select("order_id, price, quantity")
    .in("product_id", productIds);

  if (!orderItems || orderItems.length === 0) {
    return {
      totalRevenue: 0,
      averageOrderValue: 0,
      totalOrders: 0,
      growthPercentage: 0,
      period,
    };
  }

  // Get orders in date range
  const orderIds = [...new Set(orderItems.map((item) => item.order_id))];
  const { data: orders } = await supabase
    .from("orders")
    .select("id, total_amount, created_at")
    .in("id", orderIds)
    .eq("status", "completed")
    .gte("created_at", startDate.toISOString())
    .lte("created_at", now.toISOString());

  if (!orders) {
    return {
      totalRevenue: 0,
      averageOrderValue: 0,
      totalOrders: 0,
      growthPercentage: 0,
      period,
    };
  }

  // Calculate seller revenue per order
  const orderItemRevenue = new Map<string, number>();
  orderItems.forEach((item) => {
    const current = orderItemRevenue.get(item.order_id) || 0;
    orderItemRevenue.set(
      item.order_id,
      current + parseFloat(item.price.toString()) * item.quantity
    );
  });

  // Filter to 100% seller orders
  const sellerOnlyOrders = orders.filter((order) => {
    const sellerRevenue = orderItemRevenue.get(order.id) || 0;
    const orderTotal = parseFloat(order.total_amount.toString());
    return Math.abs(sellerRevenue - orderTotal) < 0.01;
  });

  // Calculate current period metrics
  const currentRevenue = sellerOnlyOrders.reduce((sum, order) => {
    const sellerRevenue = orderItemRevenue.get(order.id) || 0;
    return sum + sellerRevenue;
  }, 0);

  const totalOrders = sellerOnlyOrders.length;
  const averageOrderValue = totalOrders > 0 ? currentRevenue / totalOrders : 0;

  // Get previous period for growth calculation
  const { data: previousOrders } = await supabase
    .from("orders")
    .select("id, total_amount")
    .in("id", orderIds)
    .eq("status", "completed")
    .gte("created_at", previousStartDate.toISOString())
    .lte("created_at", previousEndDate.toISOString());

  let previousRevenue = 0;
  if (previousOrders) {
    const previousSellerOrders = previousOrders.filter((order) => {
      const sellerRevenue = orderItemRevenue.get(order.id) || 0;
      const orderTotal = parseFloat(order.total_amount.toString());
      return Math.abs(sellerRevenue - orderTotal) < 0.01;
    });

    previousRevenue = previousSellerOrders.reduce((sum, order) => {
      const sellerRevenue = orderItemRevenue.get(order.id) || 0;
      return sum + sellerRevenue;
    }, 0);
  }

  const growthPercentage =
    previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : currentRevenue > 0
      ? 100
      : 0;

  return {
    totalRevenue: currentRevenue,
    averageOrderValue,
    totalOrders,
    growthPercentage,
    period,
  };
}

/**
 * Get revenue trend data for a period
 */
export async function getSellerRevenueTrend(
  storeId: string | null,
  period: RevenuePeriod = "30d"
): Promise<RevenueTrendData[]> {
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

  // Get order_items
  const { data: orderItems } = await supabase
    .from("order_items")
    .select("order_id, price, quantity")
    .in("product_id", productIds);

  if (!orderItems || orderItems.length === 0) {
    return [];
  }

  // Calculate seller revenue per order
  const orderItemRevenue = new Map<string, number>();
  orderItems.forEach((item) => {
    const current = orderItemRevenue.get(item.order_id) || 0;
    orderItemRevenue.set(
      item.order_id,
      current + parseFloat(item.price.toString()) * item.quantity
    );
  });

  const orderIds = Array.from(orderItemRevenue.keys());

  // Determine date range and grouping
  const now = new Date();
  let startDate: Date;
  let groupBy: "day" | "month";

  switch (period) {
    case "7d":
      startDate = subDays(now, 7);
      groupBy = "day";
      break;
    case "30d":
      startDate = subDays(now, 30);
      groupBy = "day";
      break;
    case "90d":
      startDate = subDays(now, 90);
      groupBy = "day";
      break;
    case "1y":
      startDate = subMonths(now, 12);
      groupBy = "month";
      break;
  }

  // Get orders
  const { data: orders } = await supabase
    .from("orders")
    .select("id, total_amount, created_at")
    .in("id", orderIds)
    .eq("status", "completed")
    .gte("created_at", startDate.toISOString())
    .lte("created_at", now.toISOString());

  if (!orders) {
    return [];
  }

  // Filter to 100% seller orders
  const sellerOnlyOrders = orders.filter((order) => {
    const sellerRevenue = orderItemRevenue.get(order.id) || 0;
    const orderTotal = parseFloat(order.total_amount.toString());
    return Math.abs(sellerRevenue - orderTotal) < 0.01;
  });

  // Group by period
  const revenueMap = new Map<string, number>();

  sellerOnlyOrders.forEach((order) => {
    const orderDate = new Date(order.created_at);
    let key: string;

    if (groupBy === "day") {
      key = format(orderDate, "MMM dd");
    } else {
      key = format(orderDate, "MMM");
    }

    const current = revenueMap.get(key) || 0;
    const sellerRevenue = orderItemRevenue.get(order.id) || 0;
    revenueMap.set(key, current + sellerRevenue);
  });

  // Convert to array and sort
  const result: RevenueTrendData[] = Array.from(revenueMap.entries())
    .map(([month, revenue]) => ({ month, revenue }))
    .sort((a, b) => {
      // Simple sort - in production, parse dates properly
      return a.month.localeCompare(b.month);
    });

  return result;
}

/**
 * Get revenue breakdown by category
 */
export async function getSellerRevenueByCategory(
  storeId: string | null,
  period: RevenuePeriod = "30d"
): Promise<RevenueByCategory[]> {
  if (!storeId) {
    return [];
  }

  const supabase = await createClient();

  // Calculate date range
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case "7d":
      startDate = subDays(now, 7);
      break;
    case "30d":
      startDate = subDays(now, 30);
      break;
    case "90d":
      startDate = subDays(now, 90);
      break;
    case "1y":
      startDate = subMonths(now, 12);
      break;
  }

  // Get seller's products with categories
  const { data: products } = await supabase
    .from("products")
    .select("id, category")
    .eq("store_id", storeId)
    .not("category", "is", null);

  if (!products || products.length === 0) {
    return [];
  }

  const productIds = products.map((p) => p.id);
  const categoryMap = new Map(products.map((p) => [p.id, p.category || "Other"]));

  // Get order_items
  const { data: orderItems } = await supabase
    .from("order_items")
    .select("order_id, product_id, price, quantity")
    .in("product_id", productIds);

  if (!orderItems || orderItems.length === 0) {
    return [];
  }

  // Get orders in date range
  const orderIds = [...new Set(orderItems.map((item) => item.order_id))];
  const { data: orders } = await supabase
    .from("orders")
    .select("id, total_amount, created_at")
    .in("id", orderIds)
    .eq("status", "completed")
    .gte("created_at", startDate.toISOString())
    .lte("created_at", now.toISOString());

  if (!orders) {
    return [];
  }

  // Calculate seller revenue per order
  const orderItemRevenue = new Map<string, number>();
  orderItems.forEach((item) => {
    const current = orderItemRevenue.get(item.order_id) || 0;
    orderItemRevenue.set(
      item.order_id,
      current + parseFloat(item.price.toString()) * item.quantity
    );
  });

  // Filter to 100% seller orders
  const sellerOnlyOrders = orders.filter((order) => {
    const sellerRevenue = orderItemRevenue.get(order.id) || 0;
    const orderTotal = parseFloat(order.total_amount.toString());
    return Math.abs(sellerRevenue - orderTotal) < 0.01;
  });

  const sellerOrderIds = new Set(sellerOnlyOrders.map((o) => o.id));

  // Group revenue by category
  const categoryRevenue = new Map<string, { revenue: number; orderCount: Set<string> }>();

  orderItems.forEach((item) => {
    if (!sellerOrderIds.has(item.order_id)) return;

    const category = categoryMap.get(item.product_id) || "Other";
    const itemRevenue = parseFloat(item.price.toString()) * item.quantity;

    if (!categoryRevenue.has(category)) {
      categoryRevenue.set(category, { revenue: 0, orderCount: new Set() });
    }

    const current = categoryRevenue.get(category)!;
    current.revenue += itemRevenue;
    current.orderCount.add(item.order_id);
  });

  // Convert to array
  const result: RevenueByCategory[] = Array.from(categoryRevenue.entries())
    .map(([category, data]) => ({
      category,
      revenue: data.revenue,
      orderCount: data.orderCount.size,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return result;
}

/**
 * Get top selling products
 */
export async function getSellerTopProducts(
  storeId: string | null,
  period: RevenuePeriod = "30d",
  limit: number = 10
): Promise<TopProduct[]> {
  if (!storeId) {
    return [];
  }

  const supabase = await createClient();

  // Calculate date range
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case "7d":
      startDate = subDays(now, 7);
      break;
    case "30d":
      startDate = subDays(now, 30);
      break;
    case "90d":
      startDate = subDays(now, 90);
      break;
    case "1y":
      startDate = subMonths(now, 12);
      break;
  }

  // Get seller's products
  const { data: products } = await supabase
    .from("products")
    .select("id, name")
    .eq("store_id", storeId);

  if (!products || products.length === 0) {
    return [];
  }

  const productIds = products.map((p) => p.id);
  const productNameMap = new Map(products.map((p) => [p.id, p.name]));

  // Get order_items
  const { data: orderItems } = await supabase
    .from("order_items")
    .select("order_id, product_id, price, quantity")
    .in("product_id", productIds);

  if (!orderItems || orderItems.length === 0) {
    return [];
  }

  // Get orders in date range
  const orderIds = [...new Set(orderItems.map((item) => item.order_id))];
  const { data: orders } = await supabase
    .from("orders")
    .select("id, total_amount, created_at")
    .in("id", orderIds)
    .eq("status", "completed")
    .gte("created_at", startDate.toISOString())
    .lte("created_at", now.toISOString());

  if (!orders) {
    return [];
  }

  // Calculate seller revenue per order
  const orderItemRevenue = new Map<string, number>();
  orderItems.forEach((item) => {
    const current = orderItemRevenue.get(item.order_id) || 0;
    orderItemRevenue.set(
      item.order_id,
      current + parseFloat(item.price.toString()) * item.quantity
    );
  });

  // Filter to 100% seller orders
  const sellerOnlyOrders = orders.filter((order) => {
    const sellerRevenue = orderItemRevenue.get(order.id) || 0;
    const orderTotal = parseFloat(order.total_amount.toString());
    return Math.abs(sellerRevenue - orderTotal) < 0.01;
  });

  const sellerOrderIds = new Set(sellerOnlyOrders.map((o) => o.id));

  // Aggregate by product
  const productStats = new Map<
    string,
    { revenue: number; quantity: number; orderCount: Set<string> }
  >();

  orderItems.forEach((item) => {
    if (!sellerOrderIds.has(item.order_id)) return;

    const productId = item.product_id;
    const itemRevenue = parseFloat(item.price.toString()) * item.quantity;

    if (!productStats.has(productId)) {
      productStats.set(productId, {
        revenue: 0,
        quantity: 0,
        orderCount: new Set(),
      });
    }

    const current = productStats.get(productId)!;
    current.revenue += itemRevenue;
    current.quantity += item.quantity;
    current.orderCount.add(item.order_id);
  });

  // Convert to array and sort
  const result: TopProduct[] = Array.from(productStats.entries())
    .map(([product_id, stats]) => ({
      product_id,
      product_name: productNameMap.get(product_id) || "Unknown Product",
      revenue: stats.revenue,
      quantitySold: stats.quantity,
      orderCount: stats.orderCount.size,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);

  return result;
}

