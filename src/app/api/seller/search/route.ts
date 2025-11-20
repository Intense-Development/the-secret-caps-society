import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type SearchType = "product" | "order" | "customer" | "all";

type SearchResult = {
  id: string;
  name: string;
  description?: string;
  type: "product" | "order" | "customer";
};

type SearchRequest = {
  query: string;
  storeId: string;
  type?: SearchType;
  limit?: number;
};

/**
 * POST /api/seller/search
 * Global search endpoint for seller dashboard
 * Searches across products, orders, and customers (scoped to seller's store)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

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

    if (!body.storeId) {
      return NextResponse.json(
        {
          success: false,
          error: "Store ID is required",
        },
        { status: 400 }
      );
    }

    // Verify the store belongs to the user
    const { data: store } = await supabase
      .from("stores")
      .select("id")
      .eq("id", body.storeId)
      .eq("owner_id", user.id)
      .single();

    if (!store) {
      return NextResponse.json(
        {
          success: false,
          error: "Store not found or access denied",
        },
        { status: 403 }
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

    const results: SearchResult[] = [];

    // Search products (from seller's store)
    if (searchType === "all" || searchType === "product") {
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, name, description")
        .eq("store_id", body.storeId)
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
          }))
        );
      }
    }

    // Search orders (containing seller's products)
    if (searchType === "all" || searchType === "order") {
      // Get seller's products first
      const { data: products } = await supabase
        .from("products")
        .select("id")
        .eq("store_id", body.storeId);

      if (products && products.length > 0) {
        const productIds = products.map((p) => p.id);

        // Get order_items for these products
        const { data: orderItems } = await supabase
          .from("order_items")
          .select("order_id")
          .in("product_id", productIds);

        if (orderItems && orderItems.length > 0) {
          const orderIds = [...new Set(orderItems.map((item) => item.order_id))];

          // Search orders by ID (partial match)
          const { data: orders, error: ordersError } = await supabase
            .from("orders")
            .select("id, total_amount, created_at")
            .in("id", orderIds)
            .ilike("id", `%${searchQuery}%`)
            .limit(limit)
            .order("created_at", { ascending: false });

          if (ordersError) {
            console.error("Error searching orders:", ordersError);
          } else if (orders) {
            results.push(
              ...orders.map((order) => ({
                id: order.id,
                name: `Order #${order.id.slice(0, 8).toUpperCase()}`,
                type: "order" as const,
                description: `$${parseFloat(order.total_amount.toString()).toFixed(2)} • ${new Date(order.created_at).toLocaleDateString()}`,
              }))
            );
          }
        }
      }
    }

    // Search customers (buyers who ordered seller's products)
    if (searchType === "all" || searchType === "customer") {
      // Get seller's products first
      const { data: products } = await supabase
        .from("products")
        .select("id")
        .eq("store_id", body.storeId);

      if (products && products.length > 0) {
        const productIds = products.map((p) => p.id);

        // Get order_items for these products
        const { data: orderItems } = await supabase
          .from("order_items")
          .select("order_id")
          .in("product_id", productIds);

        if (orderItems && orderItems.length > 0) {
          const orderIds = [...new Set(orderItems.map((item) => item.order_id))];

          // Get orders and their buyers
          const { data: orders } = await supabase
            .from("orders")
            .select("buyer_id")
            .in("id", orderIds);

          if (orders) {
            const buyerIds = [...new Set(orders.map((o) => o.buyer_id))];

            // Search users (customers)
            const { data: customers, error: customersError } = await supabase
              .from("users")
              .select("id, name, email")
              .in("id", buyerIds)
              .or(`email.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%`)
              .limit(limit);

            if (customersError) {
              console.error("Error searching customers:", customersError);
            } else if (customers) {
              results.push(
                ...customers.map((customer) => ({
                  id: customer.id,
                  name: customer.name || customer.email,
                  type: "customer" as const,
                  description: customer.email,
                }))
              );
            }
          }
        }
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

    // Limit total results
    const limitedResults = sortedResults.slice(0, limit);

    return NextResponse.json(
      {
        success: true,
        results: limitedResults,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
