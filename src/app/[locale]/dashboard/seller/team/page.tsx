import { SellerDashboardLayout } from "@/components/dashboard/seller/SellerDashboardLayout";
import { SellerTeamClient } from "@/components/dashboard/seller/SellerTeamClient";
import { getStoreTeam } from "@/application/team/seller/getStoreTeam";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SellerTeamPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/dashboard/seller/team");
  }

  // Get seller's stores
  const { data: stores } = await supabase
    .from("stores")
    .select("id, name")
    .eq("owner_id", user.id)
    .order("name");

  // Get selected store from query params or use first store
  const selectedStoreId = stores && stores.length > 0 ? stores[0].id : null;

  // Fetch team for the selected store
  const team = await getStoreTeam(selectedStoreId);

  return (
    <SellerDashboardLayout>
      <SellerTeamClient
        initialTeam={team}
        storeId={selectedStoreId}
        stores={stores || []}
      />
    </SellerDashboardLayout>
  );
}

