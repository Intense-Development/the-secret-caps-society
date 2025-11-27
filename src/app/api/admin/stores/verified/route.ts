import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/admin/stores/verified
 * Get verified stores with pagination
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);
    const offset = (page - 1) * limit;

    const supabase = await createClient();

    // Fetch verified stores with pagination
    const { data: stores, error } = await supabase
      .from("stores")
      .select(
        `
        id,
        name,
        verified_at,
        created_at,
        products_count,
        owner:users!stores_owner_id_fkey (
          name,
          email
        )
      `
      )
      .eq("verification_status", "verified")
      .order("verified_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching verified stores:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch verified stores",
        },
        { status: 500 }
      );
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from("stores")
      .select("id", { count: "exact", head: true })
      .eq("verification_status", "verified");

    if (countError) {
      console.error("Error fetching verified stores count:", countError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch verified stores count",
        },
        { status: 500 }
      );
    }

    // Process stores
    const processedStores =
      stores?.map((store: any) => {
        // Handle owner - Supabase can return it as an object, array, or null
        let ownerName = "Unknown";
        
        if (store.owner) {
          if (Array.isArray(store.owner)) {
            ownerName = store.owner[0]?.name || "Unknown";
          } else if (typeof store.owner === 'object') {
            ownerName = store.owner.name || "Unknown";
          }
        }

        return {
          id: store.id,
          name: store.name,
          owner: ownerName,
          verifiedAt: (store.verified_at || store.created_at) as string,
          productsCount: store.products_count || 0,
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
    console.error("Get verified stores API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
