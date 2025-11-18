import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export type SearchType = "stores" | "products" | "users" | "all";

export type SearchResult = {
  id: string;
  name: string;
  type: "store" | "product" | "user";
  description?: string;
  metadata?: Record<string, unknown>;
};

type SearchRequest = {
  query: string;
  type?: SearchType;
  limit?: number;
};

/**
 * POST /api/admin/search
 * Global search endpoint for admin dashboard
 * Searches across stores, products, and users
 */
export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json();

    // Validate request
    if (!body.query || typeof body.query !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Query parameter is required",
        },
        { status: 400 }
      );
    }

    const searchQuery = body.query.trim();
    const searchType = body.type || "all";
    const limit = body.limit || 10;

    if (searchQuery.length < 2) {
      return NextResponse.json(
        {
          success: true,
          results: [],
        },
        { status: 200 }
      );
    }

    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: () => {},
        },
      }
    );

    const results: SearchResult[] = [];

    // Search stores
    if (searchType === "all" || searchType === "stores") {
      const { data: stores, error: storesError } = await supabase
        .from("stores")
        .select("id, name, description, owner_id")
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .limit(limit)
        .order("created_at", { ascending: false });

      if (storesError) {
        console.error("Error searching stores:", storesError);
      } else if (stores) {
        results.push(
          ...stores.map((store) => ({
            id: store.id,
            name: store.name,
            type: "store" as const,
            description: store.description || undefined,
            metadata: {
              owner_id: store.owner_id,
            },
          }))
        );
      }
    }

    // Search products
    if (searchType === "all" || searchType === "products") {
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, name, description, store_id")
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .limit(limit)
        .order("created_at", { ascending: false });

      if (productsError) {
        console.error("Error searching products:", productsError);
      } else if (products) {
        results.push(
          ...products.map((product) => ({
            id: product.id,
            name: product.name,
            type: "product" as const,
            description: product.description || undefined,
            metadata: {
              store_id: product.store_id,
            },
          }))
        );
      }
    }

    // Search users
    if (searchType === "all" || searchType === "users") {
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, email, name")
        .or(`email.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%`)
        .limit(limit)
        .order("created_at", { ascending: false });

      if (usersError) {
        console.error("Error searching users:", usersError);
      } else if (users) {
        results.push(
          ...users.map((user) => ({
            id: user.id,
            name: user.name || user.email,
            type: "user" as const,
            description: user.email,
            metadata: {},
          }))
        );
      }
    }

    // Sort results by relevance (exact matches first, then partial matches)
    const sortedResults = results.sort((a, b) => {
      const aExact = a.name.toLowerCase() === searchQuery.toLowerCase();
      const bExact = b.name.toLowerCase() === searchQuery.toLowerCase();
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });

    return NextResponse.json(
      {
        success: true,
        results: sortedResults.slice(0, limit),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

