import { SellerDashboardLayout } from "@/components/dashboard/seller/SellerDashboardLayout";

export default function SellerTeamPage() {
  return (
    <SellerDashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Team</h2>
          <p className="text-muted-foreground">
            Manage your team members
          </p>
        </div>
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          Team management coming soon...
        </div>
      </div>
    </SellerDashboardLayout>
  );
}

