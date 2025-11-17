import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import {
  CategoryDistributionChart,
  InventoryHealthChart,
  RevenueTrendChart,
  TrafficSourcesChart,
} from "@/components/dashboard/Charts";
import {
  getDashboardData,
  type DashboardRole,
} from "@/application/dashboard/getDashboardData";
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

  const dashboardData = await getDashboardData(role);

  const greetingName =
    profile?.name ??
    (user.user_metadata?.name as string | undefined) ??
    user.email ??
    "there";
  const firstName = greetingName.split(" ")[0] ?? greetingName;

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Navbar />

      <main className="flex-1 py-10 md:py-12">
        <div className="container space-y-8">
          <header className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Smart dashboard · {formatRole(dashboardData.role)} view
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

          <SummaryCards cards={dashboardData.summaryCards} />

          <section className="grid gap-6 lg:grid-cols-3">
            <Card className="border-border/50 shadow-sm lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle>Revenue trajectory</CardTitle>
                <CardDescription>
                  Track how actual revenue compares to target across the year.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueTrendChart data={dashboardData.revenueTrend} />
              </CardContent>
            </Card>
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle>Category contribution</CardTitle>
                <CardDescription>
                  Where this week&rsquo;s revenue is coming from.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryDistributionChart data={dashboardData.categorySplit} />
              </CardContent>
            </Card>
          </section>

          {dashboardData.showInventory ? (
            <section className="grid gap-6 lg:grid-cols-3">
              <Card className="border-border/50 shadow-sm lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle>Inventory health</CardTitle>
                  <CardDescription>
                    Compare current stock against optimal targets by category.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <InventoryHealthChart data={dashboardData.inventoryLevels} />
                </CardContent>
              </Card>
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle>Traffic sources</CardTitle>
                  <CardDescription>
                    Top acquisition channels driving engaged shoppers.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TrafficSourcesChart data={dashboardData.trafficSources} />
                </CardContent>
              </Card>
            </section>
          ) : (
            <section className="grid gap-6 lg:grid-cols-2">
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle>Discovery insights</CardTitle>
                  <CardDescription>
                    Highlights from stores and categories you follow.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TrafficSourcesChart data={dashboardData.trafficSources} />
                </CardContent>
              </Card>
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle>Category momentum</CardTitle>
                  <CardDescription>
                    Categories with rising availability or limited drops.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CategoryDistributionChart data={dashboardData.categorySplit} />
                </CardContent>
              </Card>
            </section>
          )}

          <section className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>Next best actions</CardTitle>
                <CardDescription>
                  Guided steps to keep momentum and delight your customers.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData.nextActions.map((action) => (
                  <div
                    key={action.id}
                    className="rounded-lg border border-border/50 bg-background/80 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {action.title}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                      {action.due ? (
                        <Badge
                          variant={
                            action.emphasis === "high"
                              ? "destructive"
                              : action.emphasis === "medium"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {action.due}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>Personalised insights</CardTitle>
                <CardDescription>
                  Trends and signals surfaced by our smart assistant.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {dashboardData.insights.map((insight, index) => (
                    <li
                      key={`${insight}-${index}`}
                      className="rounded-lg border border-border/40 bg-background/70 px-4 py-3 text-sm text-muted-foreground"
                    >
                      {insight}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

