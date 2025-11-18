import { SellerDashboardLayout } from "@/components/dashboard/seller/SellerDashboardLayout";
import { getSellerDashboardData } from "@/application/dashboard/seller/getSellerDashboardData";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SellerDashboardClient } from "@/components/dashboard/seller/SellerDashboardClient";

export default async function SellerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ store?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/dashboard/seller");
  }

  // Verify user is a seller
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role ?? "buyer";

  if (role !== "seller") {
    redirect("/dashboard");
  }

  // Get selected store from search params (if provided)
  const params = await searchParams;
  const selectedStoreId = params.store;

  // Get dashboard data (currently shows all stores, will be filtered by selectedStoreId in future)
  const dashboardData = await getSellerDashboardData(user.id);

  return (
    <SellerDashboardLayout>
      <SellerDashboardClient initialData={dashboardData} />
    </SellerDashboardLayout>
  );
}

