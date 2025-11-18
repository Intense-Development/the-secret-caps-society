import { AdminDashboardLayout } from "@/components/dashboard/admin/AdminDashboardLayout";

export default function AdminUsersPage() {
  return (
    <AdminDashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Users</h2>
          <p className="text-muted-foreground">
            Manage buyers, sellers, and admins
          </p>
        </div>
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          Users management coming soon...
        </div>
      </div>
    </AdminDashboardLayout>
  );
}

