import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getSellerRevenueOverview,
  getSellerRevenueTrend,
  getSellerRevenueByCategory,
  getSellerTopProducts,
  type RevenuePeriod,
} from "@/application/revenue/seller/getSellerRevenue";

/**
 * GET /api/seller/revenue
 * Get revenue analytics for the seller's selected store
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storeId = request.nextUrl.searchParams.get("storeId");
    const period = (request.nextUrl.searchParams.get("period") ||
      "30d") as RevenuePeriod;

    if (!storeId) {
      return NextResponse.json({ error: "Store ID required" }, { status: 400 });
    }

    // Verify the store belongs to the user
    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("id")
      .eq("id", storeId)
      .eq("owner_id", user.id)
      .single();

    if (storeError || !store) {
      return NextResponse.json(
        { error: "Store not found or access denied" },
        { status: 403 }
      );
    }

    // Fetch all revenue data in parallel
    const [overview, trend, byCategory, topProducts] = await Promise.all([
      getSellerRevenueOverview(storeId, period),
      getSellerRevenueTrend(storeId, period),
      getSellerRevenueByCategory(storeId, period),
      getSellerTopProducts(storeId, period, 10),
    ]);

    return NextResponse.json({
      overview,
      trend,
      byCategory,
      topProducts,
    });
  } catch (error) {
    console.error("Error fetching seller revenue:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

