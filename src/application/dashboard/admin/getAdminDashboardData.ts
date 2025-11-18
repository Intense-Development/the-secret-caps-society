import type { SummaryCard } from "@/components/dashboard/SummaryCards";

export type AdminDashboardData = {
  summaryCards: SummaryCard[];
  // TODO: Add more data types as we implement charts and lists
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

  return {
    summaryCards,
  };
}

