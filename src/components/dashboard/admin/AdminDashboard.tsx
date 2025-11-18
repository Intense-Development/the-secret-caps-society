import { AdminDashboardLayout } from "./AdminDashboardLayout";
import { getAdminDashboardData } from "@/application/dashboard/admin/getAdminDashboardData";
import { SummaryCards } from "@/components/dashboard/SummaryCards";

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

        {/* TODO: Add charts and lists */}
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          Charts and lists coming soon...
        </div>
      </div>
    </AdminDashboardLayout>
  );
}

