import { SellerDashboardLayout } from "@/components/dashboard/seller/SellerDashboardLayout";
import { SellerRevenueClient } from "@/components/dashboard/seller/SellerRevenueClient";
import {
  getSellerRevenueOverview,
  getSellerRevenueTrend,
  getSellerRevenueByCategory,
  getSellerTopProducts,
} from "@/application/revenue/seller/getSellerRevenue";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SellerRevenuePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login?redirectTo=/${locale}/dashboard/seller/revenue`);
  }

  // Get seller's stores
  const { data: stores } = await supabase
    .from("stores")
    .select("id, name")
    .eq("owner_id", user.id)
    .order("name");

  // Get selected store from query params or use first store
  const selectedStoreId = stores && stores.length > 0 ? stores[0].id : null;

  // Fetch revenue data for the selected store (default to 30d period)
  const [overview, trend, byCategory, topProducts] = await Promise.all([
    getSellerRevenueOverview(selectedStoreId, "30d"),
    getSellerRevenueTrend(selectedStoreId, "30d"),
    getSellerRevenueByCategory(selectedStoreId, "30d"),
    getSellerTopProducts(selectedStoreId, "30d", 10),
  ]);

  return (
    <SellerDashboardLayout>
      <SellerRevenueClient
        initialData={{
          overview,
          trend,
          byCategory,
          topProducts,
        }}
        storeId={selectedStoreId}
        stores={stores || []}
      />
    </SellerDashboardLayout>
  );
}

