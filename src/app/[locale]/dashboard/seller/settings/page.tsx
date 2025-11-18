import { SellerDashboardLayout } from "@/components/dashboard/seller/SellerDashboardLayout";

export default function SellerSettingsPage() {
  return (
    <SellerDashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your store and account settings
          </p>
        </div>
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          Settings coming soon...
        </div>
      </div>
    </SellerDashboardLayout>
  );
}

