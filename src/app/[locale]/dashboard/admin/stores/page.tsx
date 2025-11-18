import { AdminDashboardLayout } from "@/components/dashboard/admin/AdminDashboardLayout";

export default function AdminStoresPage() {
  return (
    <AdminDashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Stores</h2>
          <p className="text-muted-foreground">
            Manage and verify store applications
          </p>
        </div>
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          Stores management coming soon...
        </div>
      </div>
    </AdminDashboardLayout>
  );
}

