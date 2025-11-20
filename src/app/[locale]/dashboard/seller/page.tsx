import { SellerDashboardLayout } from "@/components/dashboard/seller/SellerDashboardLayout";
import { getSellerDashboardData } from "@/application/dashboard/seller/getSellerDashboardData";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SellerDashboardClient } from "@/components/dashboard/seller/SellerDashboardClient";

export default async function SellerDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ store?: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login?redirectTo=/${locale}/dashboard/seller`);
  }

  // Verify user is a seller
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role ?? "buyer";

  if (role !== "seller") {
    redirect(`/${locale}/dashboard`);
  }

  // Get selected store from search params (if provided)
  const searchParamsData = await searchParams;
  const selectedStoreId = searchParamsData.store;

  // Get dashboard data (currently shows all stores, will be filtered by selectedStoreId in future)
  const dashboardData = await getSellerDashboardData(user.id);

  return (
    <SellerDashboardLayout>
      <SellerDashboardClient initialData={dashboardData} />
    </SellerDashboardLayout>
  );
}

