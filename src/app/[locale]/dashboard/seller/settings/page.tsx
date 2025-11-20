import { SellerDashboardLayout } from "@/components/dashboard/seller/SellerDashboardLayout";
import { SellerSettingsClient } from "@/components/dashboard/seller/SellerSettingsClient";
import { getStoreSettings, getUserSettings } from "@/application/settings/seller/getStoreSettings";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SellerSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/dashboard/seller/settings");
  }

  // Get seller's stores
  const { data: stores } = await supabase
    .from("stores")
    .select("id, name")
    .eq("owner_id", user.id)
    .order("name");

  // Get selected store from query params or use first store
  const selectedStoreId = stores && stores.length > 0 ? stores[0].id : null;

  // Fetch store settings and user settings
  const [store, userData] = await Promise.all([
    getStoreSettings(selectedStoreId),
    getUserSettings(user.id),
  ]);

  return (
    <SellerDashboardLayout>
      <SellerSettingsClient
        initialStore={store}
        initialUser={userData}
        storeId={selectedStoreId}
        stores={stores || []}
      />
    </SellerDashboardLayout>
  );
}

