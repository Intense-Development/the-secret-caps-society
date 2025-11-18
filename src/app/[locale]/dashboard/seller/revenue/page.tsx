import { SellerDashboardLayout } from "@/components/dashboard/seller/SellerDashboardLayout";

export default function SellerRevenuePage() {
  return (
    <SellerDashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Revenue</h2>
          <p className="text-muted-foreground">
            Track your revenue and sales analytics
          </p>
        </div>
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          Revenue analytics coming soon...
        </div>
      </div>
    </SellerDashboardLayout>
  );
}

