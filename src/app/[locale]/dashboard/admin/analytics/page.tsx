import { AdminDashboardLayout } from "@/components/dashboard/admin/AdminDashboardLayout";

export default function AdminAnalyticsPage() {
  return (
    <AdminDashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Platform analytics and reports
          </p>
        </div>
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          Analytics coming soon...
        </div>
      </div>
    </AdminDashboardLayout>
  );
}

