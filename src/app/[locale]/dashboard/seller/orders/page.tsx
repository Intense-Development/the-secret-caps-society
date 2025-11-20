import { SellerDashboardLayout } from "@/components/dashboard/seller/SellerDashboardLayout";
import { SellerOrdersClient } from "@/components/dashboard/seller/SellerOrdersClient";
import { getSellerOrders } from "@/application/orders/seller/getSellerOrders";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SellerOrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login?redirectTo=/${locale}/dashboard/seller/orders`);
  }

  // Get seller's stores
  const { data: stores } = await supabase
    .from("stores")
    .select("id, name")
    .eq("owner_id", user.id)
    .order("name");

  // Get selected store from query params or use first store
  const selectedStoreId = stores && stores.length > 0 ? stores[0].id : null;

  // Fetch orders for the selected store
  const orders = await getSellerOrders(selectedStoreId);

  return (
    <SellerDashboardLayout>
      <SellerOrdersClient
        initialOrders={orders}
        storeId={selectedStoreId}
        stores={stores || []}
      />
    </SellerDashboardLayout>
  );
}

