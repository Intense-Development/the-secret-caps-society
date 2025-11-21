import { createClient } from "@/lib/supabase/server";
import type { SummaryCard } from "@/components/dashboard/SummaryCards";
import type { RevenueTrendData } from "@/components/dashboard/admin/RevenueTrendChart";
import type { CategoryDistributionData } from "@/components/dashboard/admin/CategoryDistributionChart";
import type { OrderStatusData } from "@/components/dashboard/admin/OrderStatusChart";
import type { StoreLocation } from "@/components/dashboard/admin/StoreLocationsMap";
import type { PendingStore } from "@/components/dashboard/admin/PendingStoresList";
import type { VerifiedStore } from "@/components/dashboard/admin/VerifiedStoresList";
import type { RecentActivity } from "@/components/dashboard/admin/RecentActivityList";
import type { TopStore } from "@/components/dashboard/admin/TopStoresList";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

export type AdminDashboardData = {
  summaryCards: SummaryCard[];
  revenueTrend: RevenueTrendData[];
  categoryDistribution: CategoryDistributionData[];
  orderStatus: OrderStatusData[];
  storeLocations: StoreLocation[];
  pendingStores: PendingStore[];
  verifiedStores: VerifiedStore[];
  verifiedStoresTotal: number;
  recentActivities: RecentActivity[];
  topStores: TopStore[];
};

// Simple city/state to coordinates mapping (for demo purposes)
// In production, use a geocoding service
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "New York,NY": { lat: 40.7128, lng: -74.006 },
  "Boston,MA": { lat: 42.3601, lng: -71.0589 },
  "Los Angeles,CA": { lat: 34.0522, lng: -118.2437 },
  "Miami,FL": { lat: 25.7617, lng: -80.1918 },
  "Chicago,IL": { lat: 41.8781, lng: -87.6298 },
};

function getCityCoordinates(
  city: string,
  state: string
): { lat: number; lng: number } | null {
  const key = `${city},${state}`;
  return CITY_COORDINATES[key] || null;
}

/**
 * Get admin dashboard data from database
 * Fetches real data from Supabase
 */
export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const supabase = await createClient();

  try {
    // Fetch all data in parallel for better performance
    const [
      totalRevenueResult,
      activeStoresResult,
      pendingStoresResult,
      totalUsersResult,
      revenueTrendResult,
      categoryDistributionResult,
      orderStatusResult,
      verifiedStoresResult,
      verifiedStoresListResult,
      verifiedStoresCountResult,
      pendingStoresListResult,
      recentStoresResult,
      recentOrdersResult,
      recentUsersResult,
      topStoresResult,
    ] = await Promise.all([
      // Total Revenue: Sum of completed orders
      supabase.from("orders").select("total_amount").eq("status", "completed"),

      // Active Stores: Count of verified stores
      supabase
        .from("stores")
        .select("id", { count: "exact", head: true })
        .eq("verification_status", "verified"),

      // Pending Approvals: Count of pending stores
      supabase
        .from("stores")
        .select("id", { count: "exact", head: true })
        .eq("verification_status", "pending"),

      // Total Users: Count of all users
      supabase.from("users").select("id", { count: "exact", head: true }),

      // Revenue Trend: Orders grouped by month (last 6 months)
      supabase
        .from("orders")
        .select("total_amount, created_at")
        .eq("status", "completed")
        .gte("created_at", subMonths(new Date(), 6).toISOString())
        .order("created_at", { ascending: true }),

      // Category Distribution: Count products by category
      supabase.from("products").select("category").not("category", "is", null),

      // Order Status: Count orders by status
      supabase.from("orders").select("status"),

      // Verified Stores for locations
      supabase
        .from("stores")
        .select("id, name, city, state")
        .eq("verification_status", "verified")
        .limit(50),

      // Verified Stores List (first page - 15 stores)
      supabase
        .from("stores")
        .select(
          `
          id,
          name,
          verified_at,
          products_count,
          owner:users!stores_owner_id_fkey (
            name,
            email
          )
        `
        )
        .eq("verification_status", "verified")
        .order("verified_at", { ascending: false })
        .range(0, 14), // First page: 0-14 (15 stores)

      // Verified Stores Total Count
      supabase
        .from("stores")
        .select("id", { count: "exact", head: true })
        .eq("verification_status", "verified"),

      // Pending Stores List
      supabase
        .from("stores")
        .select(
          `
          id,
          name,
          created_at,
          owner:users!stores_owner_id_fkey (
            name,
            email
          )
        `
        )
        .eq("verification_status", "pending")
        .order("created_at", { ascending: false })
        .limit(10),

      // Recent Stores (for activity feed)
      supabase
        .from("stores")
        .select(
          `
          id,
          name,
          created_at,
          owner:users!stores_owner_id_fkey (
            name
          )
        `
        )
        .order("created_at", { ascending: false })
        .limit(5),

      // Recent Orders (for activity feed)
      supabase
        .from("orders")
        .select(
          `
          id,
          created_at,
          buyer:users!orders_buyer_id_fkey (
            name
          )
        `
        )
        .order("created_at", { ascending: false })
        .limit(5),

      // Recent Users (for activity feed)
      supabase
        .from("users")
        .select("id, name, email, created_at")
        .order("created_at", { ascending: false })
        .limit(5),

      // Top Stores: Get completed orders from last month
      supabase
        .from("orders")
        .select("id, total_amount, created_at")
        .eq("status", "completed")
        .gte("created_at", subMonths(new Date(), 1).toISOString())
        .limit(1000), // Limit to prevent too much data
    ]);

    // Calculate summary cards
    const totalRevenue =
      totalRevenueResult.data?.reduce(
        (sum, order) => sum + Number(order.total_amount || 0),
        0
      ) || 0;
    const activeStores = activeStoresResult.count || 0;
    const pendingApprovals = pendingStoresResult.count || 0;
    const totalUsers = totalUsersResult.count || 0;

    // Calculate previous period for comparison (last month)
    const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
    const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));
    const currentMonthStart = startOfMonth(new Date());

    const [lastMonthRevenueResult, currentMonthRevenueResult] =
      await Promise.all([
        supabase
          .from("orders")
          .select("total_amount")
          .eq("status", "completed")
          .gte("created_at", lastMonthStart.toISOString())
          .lte("created_at", lastMonthEnd.toISOString()),
        supabase
          .from("orders")
          .select("total_amount")
          .eq("status", "completed")
          .gte("created_at", currentMonthStart.toISOString()),
      ]);

    const lastMonthRevenue =
      lastMonthRevenueResult.data?.reduce(
        (sum, order) => sum + Number(order.total_amount || 0),
        0
      ) || 0;
    const currentMonthRevenue =
      currentMonthRevenueResult.data?.reduce(
        (sum, order) => sum + Number(order.total_amount || 0),
        0
      ) || 0;

    const revenueChange =
      lastMonthRevenue > 0
        ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;

    // Get previous period counts for stores and users
    const [lastMonthStoresResult, lastMonthUsersResult] = await Promise.all([
      supabase
        .from("stores")
        .select("id", { count: "exact", head: true })
        .eq("verification_status", "verified")
        .lte("created_at", lastMonthEnd.toISOString()),
      supabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .lte("created_at", lastMonthEnd.toISOString()),
    ]);

    const lastMonthStores = lastMonthStoresResult.count || 0;
    const lastMonthUsers = lastMonthUsersResult.count || 0;
    const newStores = activeStores - lastMonthStores;
    const newUsers = totalUsers - lastMonthUsers;

    const summaryCards: SummaryCard[] = [
      {
        id: "total-revenue",
        title: "Total Revenue",
        value: new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(totalRevenue),
        changeLabel:
          revenueChange >= 0
            ? `+${revenueChange.toFixed(2)}% from last month`
            : `${revenueChange.toFixed(2)}% from last month`,
        trend: revenueChange >= 0 ? "up" : "down",
        helperText: "Platform-wide revenue",
      },
      {
        id: "active-stores",
        title: "Active Stores",
        value: activeStores.toLocaleString(),
        changeLabel:
          newStores >= 0 ? `+${newStores} new stores` : `${newStores} stores`,
        trend: newStores >= 0 ? "up" : "down",
        helperText: "Verified stores",
      },
      {
        id: "pending-approvals",
        title: "Pending Approvals",
        value: pendingApprovals.toString(),
        changeLabel: `${pendingApprovals} awaiting verification`,
        trend: "up",
        helperText: "Stores awaiting verification",
      },
      {
        id: "total-users",
        title: "Total Users",
        value: totalUsers.toLocaleString(),
        changeLabel:
          newUsers >= 0 ? `+${newUsers} new signups` : `${newUsers} users`,
        trend: newUsers >= 0 ? "up" : "down",
        helperText: "Buyers and sellers",
      },
    ];

    // Process revenue trend data (last 6 months)
    const revenueTrend: RevenueTrendData[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const monthRevenue =
        revenueTrendResult.data
          ?.filter((order) => {
            const orderDate = new Date(order.created_at);
            return orderDate >= monthStart && orderDate <= monthEnd;
          })
          .reduce((sum, order) => sum + Number(order.total_amount || 0), 0) ||
        0;

      revenueTrend.push({
        month: format(monthDate, "MMM"),
        revenue: monthRevenue,
      });
    }

    // Process category distribution
    const categoryCounts: Record<string, number> = {};
    categoryDistributionResult.data?.forEach((product) => {
      const category = product.category || "Other";
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    const categoryDistribution: CategoryDistributionData[] = Object.entries(
      categoryCounts
    )
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 categories

    // Process order status distribution
    const statusCounts: Record<string, number> = {};
    orderStatusResult.data?.forEach((order) => {
      const status = order.status || "unknown";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    // Map database status values to display values
    const statusMap: Record<string, string> = {
      pending: "Pending",
      processing: "Processing",
      completed: "Delivered",
      cancelled: "Cancelled",
      refunded: "Refunded",
    };

    const orderStatus: OrderStatusData[] = Object.entries(statusCounts)
      .map(([status, count]) => ({
        status:
          statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1),
        count,
      }))
      .sort((a, b) => b.count - a.count);

    // Process store locations
    const storeLocations: StoreLocation[] = [];
    verifiedStoresResult.data?.forEach((store) => {
      const coords = getCityCoordinates(store.city, store.state);
      if (coords) {
        storeLocations.push({
          id: store.id,
          name: store.name,
          lat: coords.lat,
          lng: coords.lng,
        });
      }
    });

    // Process pending stores
    const pendingStores: PendingStore[] =
      pendingStoresListResult.data?.map((store) => {
        // Handle owner as array (Supabase relationship) or single object
        const ownerData = Array.isArray(store.owner)
          ? store.owner[0]
          : store.owner;
        const ownerName =
          (ownerData as { name: string; email: string } | null)?.name ||
          "Unknown";

        return {
          id: store.id,
          name: store.name,
          owner: ownerName,
          submittedAt: new Date(store.created_at),
          category: "General", // We don't have category in stores table
        };
      }) || [];

    // Process verified stores
    const verifiedStores: VerifiedStore[] =
      verifiedStoresListResult.data?.map((store) => {
        // Handle owner as array (Supabase relationship) or single object
        const ownerData = Array.isArray(store.owner)
          ? store.owner[0]
          : store.owner;
        const ownerName =
          (ownerData as { name: string; email: string } | null)?.name ||
          "Unknown";

        return {
          id: store.id,
          name: store.name,
          owner: ownerName,
          verifiedAt: new Date(store.verified_at || store.created_at),
          productsCount: store.products_count || 0,
        };
      }) || [];

    const verifiedStoresTotal = verifiedStoresCountResult.count || 0;

    // Process recent activities
    const recentActivities: RecentActivity[] = [];

    // Add store creation activities
    recentStoresResult.data?.forEach((store) => {
      recentActivities.push({
        id: `store-${store.id}`,
        type: "store_created",
        description: `New store '${store.name}' was created`,
        user:
          (Array.isArray(store.owner)
            ? (store.owner[0] as { name: string } | null)
            : (store.owner as { name: string } | null)
          )?.name || "Unknown",
        timestamp: new Date(store.created_at),
      });
    });

    // Add order activities
    recentOrdersResult.data?.forEach((order) => {
      // Handle buyer as array (Supabase relationship) or single object
      const buyerData = Array.isArray(order.buyer)
        ? order.buyer[0]
        : order.buyer;
      const buyerName =
        (buyerData as { name: string } | null)?.name || "Unknown";

      recentActivities.push({
        id: `order-${order.id}`,
        type: "order_placed",
        description: `Order #${order.id.slice(0, 8)} was placed`,
        user: buyerName,
        timestamp: new Date(order.created_at),
      });
    });

    // Add user registration activities
    recentUsersResult.data?.forEach((user) => {
      recentActivities.push({
        id: `user-${user.id}`,
        type: "user_registered",
        description: "New user registered",
        user: user.name || user.email,
        timestamp: new Date(user.created_at),
      });
    });

    // Sort activities by timestamp and take top 10
    recentActivities.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
    const topRecentActivities = recentActivities.slice(0, 10);

    // Process top stores - get order items for completed orders
    const orderIds = topStoresResult.data?.map((o) => o.id) || [];
    let topStores: TopStore[] = [];

    if (orderIds.length > 0) {
      // Get order items with product and store info
      const { data: orderItemsData } = await supabase
        .from("order_items")
        .select(
          `
          order_id,
          price,
          quantity,
          product:products!inner (
            store_id,
            store:stores!products_store_id_fkey (
              id,
              name
            )
          )
        `
        )
        .in("order_id", orderIds);

      const storeRevenue: Record<
        string,
        { name: string; revenue: number; orders: Set<string> }
      > = {};

      orderItemsData?.forEach((item) => {
        // Handle product as array (Supabase relationship) or single object
        const product = Array.isArray(item.product)
          ? item.product[0]
          : item.product;

        if (!product) return;

        // Handle store as array (nested Supabase relationship) or single object
        const productStore = Array.isArray(product.store)
          ? product.store[0]
          : product.store;

        if (!productStore) return;

        const storeId = productStore.id;
        const storeName = productStore.name;
        const itemRevenue =
          Number(item.price || 0) * Number(item.quantity || 0);

        if (!storeRevenue[storeId]) {
          storeRevenue[storeId] = {
            name: storeName,
            revenue: 0,
            orders: new Set(),
          };
        }

        storeRevenue[storeId].revenue += itemRevenue;
        storeRevenue[storeId].orders.add(item.order_id);
      });

      // Calculate growth (simplified - would need previous period data)
      topStores = Object.entries(storeRevenue)
        .map(([id, data]) => ({
          id,
          name: data.name,
          revenue: data.revenue,
          orders: data.orders.size,
          growth: Math.random() * 20, // TODO: Calculate actual growth from previous period
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
    }

    return {
      summaryCards,
      revenueTrend,
      categoryDistribution,
      orderStatus,
      storeLocations,
      pendingStores,
      verifiedStores,
      verifiedStoresTotal,
      recentActivities: topRecentActivities,
      topStores,
    };
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    // Return empty data structure on error
    return {
      summaryCards: [],
      revenueTrend: [],
      categoryDistribution: [],
      orderStatus: [],
      storeLocations: [],
      pendingStores: [],
      verifiedStores: [],
      verifiedStoresTotal: 0,
      recentActivities: [],
      topStores: [],
    };
  }
}
