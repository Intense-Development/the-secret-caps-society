import { AdminDashboardLayout } from "@/components/dashboard/admin/AdminDashboardLayout";
import { AdminStoresClient } from "@/components/dashboard/admin/AdminStoresClient";

export default function AdminStoresPage() {
  return (
    <AdminDashboardLayout>
      <AdminStoresClient />
    </AdminDashboardLayout>
  );
}
