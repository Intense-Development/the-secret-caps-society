import { AdminDashboardLayout } from "@/components/dashboard/admin/AdminDashboardLayout";

export default function AdminProductsPage() {
  return (
    <AdminDashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage and moderate products
          </p>
        </div>
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          Products management coming soon...
        </div>
      </div>
    </AdminDashboardLayout>
  );
}

