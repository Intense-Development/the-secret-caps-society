import { SellerDashboardLayout } from "@/components/dashboard/seller/SellerDashboardLayout";

export default function SellerShippingPage() {
  return (
    <SellerDashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Shipping</h2>
          <p className="text-muted-foreground">
            Manage shipments and tracking
          </p>
        </div>
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          Shipping management coming soon...
        </div>
      </div>
    </SellerDashboardLayout>
  );
}

