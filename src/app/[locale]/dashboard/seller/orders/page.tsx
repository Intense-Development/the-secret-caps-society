import { SellerDashboardLayout } from "@/components/dashboard/seller/SellerDashboardLayout";

export default function SellerOrdersPage() {
  return (
    <SellerDashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Orders</h2>
          <p className="text-muted-foreground">
            View and manage your orders
          </p>
        </div>
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          Orders management coming soon...
        </div>
      </div>
    </SellerDashboardLayout>
  );
}

