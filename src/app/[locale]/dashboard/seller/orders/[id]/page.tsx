import { SellerDashboardLayout } from "@/components/dashboard/seller/SellerDashboardLayout";
import { OrderDetailPageClient } from "@/components/dashboard/seller/OrderDetailPageClient";
import { getSellerOrder } from "@/application/orders/seller/getSellerOrders";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";

export default async function SellerOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ storeId?: string }>;
}) {
  const { locale, id } = await params();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login?redirectTo=/${locale}/dashboard/seller/orders`);
  }

  const { storeId } = await searchParams;

  // Get seller's stores
  const { data: stores } = await supabase
    .from("stores")
    .select("id, name")
    .eq("owner_id", user.id)
    .order("name");

  // Use provided storeId or first store
  const selectedStoreId = storeId || (stores && stores.length > 0 ? stores[0].id : null);

  if (!selectedStoreId) {
    redirect(`/${locale}/dashboard/seller/orders`);
  }

  // Fetch order
  const order = await getSellerOrder(id, selectedStoreId);

  if (!order) {
    notFound();
  }

  return (
    <SellerDashboardLayout>
      <OrderDetailPageClient order={order} storeId={selectedStoreId} />
    </SellerDashboardLayout>
  );
}

