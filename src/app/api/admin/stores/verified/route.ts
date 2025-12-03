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
    // First, get stores with owner_id
    const { data: stores, error } = await supabase
      .from("stores")
      .select(
        `
        id,
        name,
        verified_at,
        created_at,
        products_count,
        owner_id,
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
    type StoreWithOwner = {
      id: string;
      name: string;
      verified_at: string | null;
      created_at: string;
      products_count: number | null;
      owner_id: string;
      owner: { name: string; email: string } | { name: string; email: string }[] | null;
    };

    // If owner relationship didn't work, fetch owners separately
    const ownerIds = stores?.map((s: StoreWithOwner) => s.owner_id).filter(Boolean) || [];
    let ownersMap: Record<string, { name: string; email: string }> = {};
    
    if (ownerIds.length > 0) {
      const { data: owners, error: ownersError } = await supabase
        .from("users")
        .select("id, name, email")
        .in("id", ownerIds);
      
      if (ownersError) {
        console.error("Error fetching owners:", ownersError);
      }
      
      if (owners && owners.length > 0) {
        ownersMap = owners.reduce((acc, owner) => {
          acc[owner.id] = { name: owner.name, email: owner.email };
          return acc;
        }, {} as Record<string, { name: string; email: string }>);
        console.log(`Fetched ${owners.length} owners for ${ownerIds.length} stores`);
      } else {
        console.log(`No owners found for ${ownerIds.length} owner IDs`);
      }
    } else {
      console.log("No owner IDs found in stores");
    }

    const processedStores =
      stores?.map((store: StoreWithOwner) => {
        // Try to get owner name from relationship query first
        let ownerName: string | undefined;
        
        if (store.owner) {
          if (Array.isArray(store.owner) && store.owner.length > 0) {
            ownerName = store.owner[0]?.name;
          } else if (typeof store.owner === 'object' && store.owner !== null) {
            ownerName = (store.owner as { name?: string }).name;
          }
        }
        
        // Fallback: Always use owner_id to fetch from map if relationship didn't work or returned no name
        if (!ownerName && store.owner_id) {
          if (ownersMap[store.owner_id]) {
            ownerName = ownersMap[store.owner_id].name;
          } else {
            console.log(`Owner not found in map for store ${store.id}, owner_id: ${store.owner_id}`);
          }
        }

        return {
          id: store.id,
          name: store.name,
          owner: ownerName || "Unknown",
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
