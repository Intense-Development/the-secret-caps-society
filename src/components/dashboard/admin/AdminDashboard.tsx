import { AdminDashboardLayout } from "./AdminDashboardLayout";
import { getAdminDashboardData } from "@/application/dashboard/admin/getAdminDashboardData";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { RevenueTrendChart } from "./RevenueTrendChart";
import { CategoryDistributionChart } from "./CategoryDistributionChart";
import { OrderStatusChart } from "./OrderStatusChart";
import { StoreLocationsMap } from "./StoreLocationsMap";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Admin Dashboard Component
 * Main admin dashboard view with overview cards, charts, and lists
 */
export default async function AdminDashboard() {
  const dashboardData = await getAdminDashboardData();

  return (
    <AdminDashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Admin Dashboard
          </h2>
          <p className="text-muted-foreground">
            Platform overview and management
          </p>
        </div>

        {/* Overview Cards */}
        <SummaryCards cards={dashboardData.summaryCards} />

        {/* Charts Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Revenue Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Platform revenue over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueTrendChart data={dashboardData.revenueTrend} />
            </CardContent>
          </Card>

          {/* Category Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
              <CardDescription>Product distribution across categories</CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryDistributionChart data={dashboardData.categoryDistribution} />
            </CardContent>
          </Card>

          {/* Order Status Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
              <CardDescription>Current order distribution by status</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderStatusChart data={dashboardData.orderStatus} />
            </CardContent>
          </Card>

          {/* Store Locations Map */}
          <Card>
            <CardHeader>
              <CardTitle>Store Locations</CardTitle>
              <CardDescription>Active stores around the world</CardDescription>
            </CardHeader>
            <CardContent>
              <StoreLocationsMap stores={dashboardData.storeLocations} />
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}

