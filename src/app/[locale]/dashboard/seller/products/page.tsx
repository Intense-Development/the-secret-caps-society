import { SellerDashboardLayout } from "@/components/dashboard/seller/SellerDashboardLayout";
import { SellerProductsClient } from "@/components/dashboard/seller/SellerProductsClient";
import { getSellerProducts } from "@/application/products/seller/getSellerProducts";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SellerProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login?redirectTo=/${locale}/dashboard/seller/products`);
  }

  // Get seller's stores
  const { data: stores } = await supabase
    .from("stores")
    .select("id, name")
    .eq("owner_id", user.id)
    .order("name");

  // Get selected store from query params or use first store
  // For now, we'll use the first store (in production, this would come from localStorage or query params)
  const selectedStoreId = stores && stores.length > 0 ? stores[0].id : null;

  // Fetch products for the selected store
  const products = await getSellerProducts(selectedStoreId);

  return (
    <SellerDashboardLayout>
      <SellerProductsClient
        initialProducts={products}
        storeId={selectedStoreId}
        stores={stores || []}
      />
    </SellerDashboardLayout>
  );
}

