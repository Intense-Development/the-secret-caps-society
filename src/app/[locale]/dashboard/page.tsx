import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BuyerDashboard from "@/components/dashboard/buyer/BuyerDashboard";
import SellerDashboard from "@/components/dashboard/seller/SellerDashboard";
import AdminDashboard from "@/components/dashboard/admin/AdminDashboard";
import type { DashboardRole } from "@/application/dashboard/getDashboardData";
import { createClient } from "@/lib/supabase/server";

function formatRole(role: DashboardRole) {
  if (role === "buyer") return "buyer";
  if (role === "seller") return "seller";
  return "admin";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/dashboard");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("name, role")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile?.role ??
    (user.user_metadata?.role as DashboardRole | undefined) ??
    (user.app_metadata?.role as DashboardRole | undefined) ??
    "buyer") as DashboardRole;

  const greetingName =
    profile?.name ??
    (user.user_metadata?.name as string | undefined) ??
    user.email ??
    "there";
  const firstName = greetingName.split(" ")[0] ?? greetingName;

  // Admin dashboard has its own layout (sidebar + header)
  if (role === "admin") {
    return <AdminDashboard />;
  }

  // Seller dashboard has its own layout (redirect to seller dashboard)
  if (role === "seller") {
    redirect("/dashboard/seller");
  }

  // Buyer dashboard uses the standard layout (Navbar + Footer)
  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Navbar />

      <main className="flex-1 py-10 md:py-12">
        <div className="container space-y-8">
          <header className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Smart dashboard · {formatRole(role)} view
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Welcome back, {firstName}!
              </h1>
              <p className="mt-1 text-muted-foreground">
                Here&rsquo;s a snapshot of how things are performing across your
                Secret Caps Society workspace today.
              </p>
            </div>
          </header>

          {/* Role-based component rendering */}
          {role === "buyer" && <BuyerDashboard userId={user.id} />}
        </div>
      </main>

      <Footer />
    </div>
  );
}
