import {
  categoryData,
  revenueData,
  salesData,
  stockData,
  trafficSourceData,
  userGrowthData,
} from "@/data/dashboardData";
import type { SummaryCard } from "@/components/dashboard/SummaryCards";

export type DashboardRole = "buyer" | "seller" | "admin";

export type DashboardNextAction = {
  id: string;
  title: string;
  description: string;
  due?: string;
  emphasis?: "low" | "medium" | "high";
};

export type DashboardData = {
  role: DashboardRole;
  summaryCards: SummaryCard[];
  revenueTrend: typeof revenueData;
  categorySplit: typeof categoryData;
  inventoryLevels: typeof stockData;
  trafficSources: typeof trafficSourceData;
  insights: string[];
  nextActions: DashboardNextAction[];
  showInventory: boolean;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const percentFormatter = (value: number) =>
  `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;

function buildSummaryCards(role: DashboardRole): SummaryCard[] {
  const totalWeeklyRevenue = salesData.reduce((sum, day) => sum + day.revenue, 0);
  const totalWeeklyOrders = salesData.reduce((sum, day) => sum + day.orders, 0);
  const averageOrderValue =
    totalWeeklyOrders > 0 ? totalWeeklyRevenue / totalWeeklyOrders : 0;
  const latestRevenue = revenueData.at(-1);
  const previousRevenue = revenueData.at(-2);
  const revenueDelta =
    latestRevenue && previousRevenue
      ? ((latestRevenue.revenue - previousRevenue.revenue) /
          previousRevenue.revenue) *
        100
      : 0;

  const latestUsers = userGrowthData.at(-1);
  const previousUsers = userGrowthData.at(-2);
  const userDelta =
    latestUsers && previousUsers
      ? ((latestUsers.users - previousUsers.users) / previousUsers.users) * 100
      : 0;

  const baselineCards: SummaryCard[] = [
    {
      id: "weekly-revenue",
      title: "Revenue (7 days)",
      value: currencyFormatter.format(totalWeeklyRevenue),
      changeLabel: percentFormatter(revenueDelta),
      trend: revenueDelta >= 0 ? "up" : "down",
      helperText: `Avg order ${currencyFormatter.format(averageOrderValue)}`,
    },
    {
      id: "orders",
      title: "Orders fulfilled",
      value: totalWeeklyOrders.toString(),
      changeLabel: "+18 new vs last week",
      trend: "up",
      helperText: "Low cancellation rate (2.4%)",
    },
    {
      id: "target-progress",
      title: "Target attainment",
      value: `${Math.round(
        (latestRevenue?.revenue ?? 0) /
          Math.max(latestRevenue?.target ?? 1, 1) *
          100
      )}%`,
      changeLabel:
        latestRevenue && previousRevenue
          ? percentFormatter(
              ((latestRevenue.target - previousRevenue.target) /
                previousRevenue.target) *
                100
            )
          : "+0.0%",
      trend: "up",
      helperText: "Forecast on track",
    },
    {
      id: "user-growth",
      title: "New customers",
      value: ((latestUsers?.users ?? 0) - (previousUsers?.users ?? 0)).toString(),
      changeLabel: percentFormatter(userDelta),
      trend: userDelta >= 0 ? "up" : "down",
      helperText: "Top source: Social media",
    },
  ];

  if (role === "buyer") {
    baselineCards[0] = {
      id: "buyer-orders",
      title: "Orders placed",
      value: totalWeeklyOrders.toString(),
      changeLabel: "+2 vs last month",
      trend: "up",
      helperText: "Next delivery in 2 days",
    };
    baselineCards[1] = {
      id: "wishlist",
      title: "Saved items",
      value: "8",
      changeLabel: "+3 new arrivals",
      trend: "up",
      helperText: "Snapbacks trending up",
    };
  }

  return baselineCards;
}

function buildInsights(role: DashboardRole): string[] {
  const generalInsights = [
    "Revenue exceeded targets in 9 of the last 12 months.",
    "Social media continues to drive the highest conversion rate.",
  ];

  if (role === "seller") {
    return [
      ...generalInsights,
      "Snapbacks inventory is trending toward minimum levels — consider restocking within 3 days.",
      "Customers responded well to last week’s bundle promotion; repeat for caps & beanies.",
    ];
  }

  if (role === "admin") {
    return [
      ...generalInsights,
      "Verification backlog is down 35% week-over-week.",
      "Two stores crossed the $50k monthly revenue mark this quarter.",
    ];
  }

  return [
    "Your last three orders were delivered on time — leave a review to help sellers shine.",
    "Wishlist items are back in stock — lock in your favourites before they sell out.",
    ...generalInsights.slice(1),
  ];
}

function buildNextActions(role: DashboardRole): DashboardNextAction[] {
  if (role === "seller") {
    return [
      {
        id: "inventory-audit",
        title: "Review low-stock items",
        description: "Update reorder points for snapbacks and trucker hats.",
        due: "Due today",
        emphasis: "high",
      },
      {
        id: "campaign",
        title: "Launch weekend promotion",
        description: "Plan 10% upsell bundle for repeat buyers.",
        due: "In 3 days",
        emphasis: "medium",
      },
    ];
  }

  if (role === "admin") {
    return [
      {
        id: "store-approvals",
        title: "Approve pending stores",
        description: "3 seller applications waiting for verification.",
        due: "Due tomorrow",
        emphasis: "high",
      },
      {
        id: "finance-review",
        title: "Reconcile payouts",
        description: "Confirm Stripe transfers for the last cycle.",
        due: "In 2 days",
        emphasis: "medium",
      },
    ];
  }

  return [
    {
      id: "complete-profile",
      title: "Complete your style preferences",
      description: "Unlock personalised recommendations and early drops.",
      emphasis: "medium",
    },
    {
      id: "share-feedback",
      title: "Leave feedback on recent order",
      description: "Earn 50 loyalty points when you share your experience.",
      emphasis: "low",
    },
  ];
}

export async function getDashboardData(
  role: DashboardRole
): Promise<DashboardData> {
  return {
    role,
    summaryCards: buildSummaryCards(role),
    revenueTrend: revenueData,
    categorySplit: categoryData,
    inventoryLevels: stockData,
    trafficSources: trafficSourceData,
    insights: buildInsights(role),
    nextActions: buildNextActions(role),
    showInventory: role !== "buyer",
  };
}

