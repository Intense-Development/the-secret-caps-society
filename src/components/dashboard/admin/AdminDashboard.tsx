import { AdminDashboardLayout } from "./AdminDashboardLayout";
import { getAdminDashboardData } from "@/application/dashboard/admin/getAdminDashboardData";
import { AdminDashboardClient } from "./AdminDashboardClient";

/**
 * Admin Dashboard Component (Server Component)
 * Fetches initial data and passes it to client component for realtime updates
 */
export default async function AdminDashboard() {
  const dashboardData = await getAdminDashboardData();

  return (
    <AdminDashboardLayout>
      <AdminDashboardClient initialData={dashboardData} />
    </AdminDashboardLayout>
  );
}

