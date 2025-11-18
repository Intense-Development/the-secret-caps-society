import type { SummaryCard } from "@/components/dashboard/SummaryCards";
import type { RevenueTrendData } from "@/components/dashboard/admin/RevenueTrendChart";
import type { CategoryDistributionData } from "@/components/dashboard/admin/CategoryDistributionChart";
import type { OrderStatusData } from "@/components/dashboard/admin/OrderStatusChart";
import type { StoreLocation } from "@/components/dashboard/admin/StoreLocationsMap";

export type AdminDashboardData = {
  summaryCards: SummaryCard[];
  revenueTrend: RevenueTrendData[];
  categoryDistribution: CategoryDistributionData[];
  orderStatus: OrderStatusData[];
  storeLocations: StoreLocation[];
};

/**
 * Get admin dashboard data
 * Currently returns mock data. Will be replaced with real database queries.
 */
export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  // Mock data for now
  const summaryCards: SummaryCard[] = [
    {
      id: "total-revenue",
      title: "Total Revenue",
      value: "$55,450",
      changeLabel: "+12.08% from last month",
      trend: "up",
      helperText: "Platform-wide revenue",
    },
    {
      id: "active-stores",
      title: "Active Stores",
      value: "1,234",
      changeLabel: "+24 new stores",
      trend: "up",
      helperText: "Verified stores",
    },
    {
      id: "pending-approvals",
      title: "Pending Approvals",
      value: "12",
      changeLabel: "+3 new applications",
      trend: "up",
      helperText: "Stores awaiting verification",
    },
    {
      id: "total-users",
      title: "Total Users",
      value: "5,678",
      changeLabel: "+156 new signups",
      trend: "up",
      helperText: "Buyers and sellers",
    },
  ];

  // Mock revenue trend data (last 6 months)
  const revenueTrend: RevenueTrendData[] = [
    { month: "Jul", revenue: 42000, target: 45000 },
    { month: "Aug", revenue: 48000, target: 47000 },
    { month: "Sep", revenue: 51000, target: 50000 },
    { month: "Oct", revenue: 49000, target: 52000 },
    { month: "Nov", revenue: 55000, target: 55000 },
    { month: "Dec", revenue: 55450, target: 58000 },
  ];

  // Mock category distribution data
  const categoryDistribution: CategoryDistributionData[] = [
    { name: "Baseball Caps", value: 1245 },
    { name: "Snapbacks", value: 892 },
    { name: "Beanies", value: 456 },
    { name: "Bucket Hats", value: 234 },
    { name: "Visors", value: 178 },
    { name: "Other", value: 89 },
  ];

  // Mock order status data
  const orderStatus: OrderStatusData[] = [
    { status: "Pending", count: 25 },
    { status: "Processing", count: 40 },
    { status: "Shipped", count: 60 },
    { status: "Delivered", count: 120 },
    { status: "Cancelled", count: 5 },
  ];

  // Mock store locations data
  const storeLocations: StoreLocation[] = [
    { id: "1", name: "NYC Caps Store", lat: 40.7128, lng: -74.006 },
    { id: "2", name: "LA Headwear", lat: 34.0522, lng: -118.2437 },
    { id: "3", name: "London Caps", lat: 51.5074, lng: -0.1278 },
    { id: "4", name: "Tokyo Hats", lat: 35.6762, lng: 139.6503 },
    { id: "5", name: "Sydney Caps", lat: -33.8688, lng: 151.2093 },
  ];

  return {
    summaryCards,
    revenueTrend,
    categoryDistribution,
    orderStatus,
    storeLocations,
  };
}

