import { SellerDashboardLayout } from "@/components/dashboard/seller/SellerDashboardLayout";
import { SellerShippingClient } from "@/components/dashboard/seller/SellerShippingClient";
import { getSellerShipments } from "@/application/shipping/seller/getSellerShipments";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SellerShippingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login?redirectTo=/${locale}/dashboard/seller/shipping`);
  }

  // Get seller's stores
  const { data: stores } = await supabase
    .from("stores")
    .select("id, name")
    .eq("owner_id", user.id)
    .order("name");

  // Get selected store from query params or use first store
  const selectedStoreId = stores && stores.length > 0 ? stores[0].id : null;

  // Fetch shipments for the selected store
  const shipments = await getSellerShipments(selectedStoreId);

  return (
    <SellerDashboardLayout>
      <SellerShippingClient
        initialShipments={shipments}
        storeId={selectedStoreId}
        stores={stores || []}
      />
    </SellerDashboardLayout>
  );
}

