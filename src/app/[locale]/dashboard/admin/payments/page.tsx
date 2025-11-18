import { AdminDashboardLayout } from "@/components/dashboard/admin/AdminDashboardLayout";

export default function AdminPaymentsPage() {
  return (
    <AdminDashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Payments</h2>
          <p className="text-muted-foreground">
            Financial oversight and payouts
          </p>
        </div>
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          Payments management coming soon...
        </div>
      </div>
    </AdminDashboardLayout>
  );
}

