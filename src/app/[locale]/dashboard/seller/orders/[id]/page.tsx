import { SellerDashboardLayout } from "@/components/dashboard/seller/SellerDashboardLayout";
import { OrderDetailPageClient } from "@/components/dashboard/seller/OrderDetailPageClient";
import { getSellerOrder } from "@/application/orders/seller/getSellerOrders";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";

export default async function SellerOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ storeId?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/dashboard/seller/orders");
  }

  const { id } = await params;
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
    redirect("/dashboard/seller/orders");
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

