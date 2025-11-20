import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSellerOrders } from "@/application/orders/seller/getSellerOrders";

/**
 * GET /api/seller/orders
 * Get all orders for the seller's selected store
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storeId = request.nextUrl.searchParams.get("storeId");
    const statusFilter = request.nextUrl.searchParams.get("status") || undefined;

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

    // Get orders
    const orders = await getSellerOrders(storeId, statusFilter);

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

