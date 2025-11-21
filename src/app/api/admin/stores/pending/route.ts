import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/admin/stores/pending
 * Get pending stores with pagination
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);
    const offset = (page - 1) * limit;

    const supabase = await createClient();

    // Fetch pending stores with pagination
    const { data: stores, error } = await supabase
      .from("stores")
      .select(
        `
        id,
        name,
        created_at,
        owner:users!stores_owner_id_fkey (
          name,
          email
        )
      `
      )
      .eq("verification_status", "pending")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching pending stores:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch pending stores",
        },
        { status: 500 }
      );
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from("stores")
      .select("id", { count: "exact", head: true })
      .eq("verification_status", "pending");

    if (countError) {
      console.error("Error fetching pending stores count:", countError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch pending stores count",
        },
        { status: 500 }
      );
    }

    // Process stores
    const processedStores =
      stores?.map((store) => {
        // Handle owner as array (Supabase relationship) or single object
        const ownerData = Array.isArray(store.owner)
          ? store.owner[0]
          : store.owner;
        const ownerName =
          (ownerData as { name: string; email: string } | null)?.name ||
          "Unknown";

        return {
          id: store.id,
          name: store.name,
          owner: ownerName,
          submittedAt: store.created_at,
          category: "General", // We don't have category in stores table
        };
      }) || [];

    return NextResponse.json(
      {
        success: true,
        stores: processedStores,
        totalCount: count || 0,
        page,
        limit,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get pending stores API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

