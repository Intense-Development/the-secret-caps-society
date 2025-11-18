import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type SellerSearchResult = {
  id: string;
  name: string;
  type: "product" | "order" | "customer";
  description?: string;
};

type SellerSearchRequest = {
  query: string;
  storeId: string;
  limit?: number;
};

/**
 * POST /api/seller/search
 * Global search endpoint for seller dashboard
 * Searches across products, orders, and customers within seller's store(s)
 */
export async function POST(request: NextRequest) {
  try {
    const body: SellerSearchRequest = await request.json();

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

    if (!body.storeId || typeof body.storeId !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "storeId parameter is required",
        },
        { status: 400 }
      );
    }

    const searchQuery = body.query.trim();
    const storeId = body.storeId;
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

    // Create Supabase client and verify seller owns the store
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // Verify seller owns the store
    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("id, owner_id")
      .eq("id", storeId)
      .eq("owner_id", user.id)
      .single();

    if (storeError || !store) {
      return NextResponse.json(
        {
          success: false,
          error: "Store not found or access denied",
        },
        { status: 403 }
      );
    }

    const results: SellerSearchResult[] = [];

    // Search products in seller's store
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, description, price")
      .eq("store_id", storeId)
      .eq("archived", false)
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
          description: product.description || `$${product.price}`,
        }))
      );
    }

    // Search orders containing seller's products
    // Get order IDs that contain products from this store
    const { data: orderItems, error: orderItemsError } = await supabase
      .from("order_items")
      .select("order_id, products!inner(store_id)")
      .eq("products.store_id", storeId);

    if (!orderItemsError && orderItems) {
      const orderIds = [
        ...new Set(orderItems.map((item) => item.order_id)),
      ] as string[];

      if (orderIds.length > 0) {
        // Search in order IDs (partial match)
        const searchOrderIds = orderIds.filter((id) =>
          id.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (searchOrderIds.length > 0) {
          const { data: orders, error: ordersError } = await supabase
            .from("orders")
            .select("id, total_amount, created_at, buyer:users!orders_buyer_id_fkey(id, name, email)")
            .in("id", searchOrderIds)
            .limit(limit);

          if (!ordersError && orders) {
            results.push(
              ...orders.map((order) => {
                const buyer = Array.isArray(order.buyer)
                  ? order.buyer[0]
                  : order.buyer;
                return {
                  id: order.id,
                  name: `Order #${order.id.slice(0, 8).toUpperCase()}`,
                  type: "order" as const,
                  description: `$${order.total_amount} - ${buyer?.name || buyer?.email || "Customer"}`,
                };
              })
            );
          }
        }

        // Search orders by customer name/email
        const { data: customers, error: customersError } = await supabase
          .from("users")
          .select("id, name, email")
          .or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
          .limit(limit);

        if (!customersError && customers) {
          const customerIds = customers.map((c) => c.id);
          const { data: customerOrders, error: customerOrdersError } =
            await supabase
              .from("orders")
              .select("id, total_amount, buyer_id")
              .in("buyer_id", customerIds)
              .in("id", orderIds)
              .limit(limit);

          if (!customerOrdersError && customerOrders) {
            // Add unique customers to results
            const uniqueCustomers = new Map();
            customers.forEach((customer) => {
              if (!uniqueCustomers.has(customer.id)) {
                uniqueCustomers.set(customer.id, {
                  id: customer.id,
                  name: customer.name || customer.email,
                  type: "customer" as const,
                  description: customer.email,
                });
              }
            });
            results.push(...Array.from(uniqueCustomers.values()));
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

    // Remove duplicates
    const uniqueResults = Array.from(
      new Map(sortedResults.map((item) => [item.id + item.type, item])).values()
    );

    return NextResponse.json(
      {
        success: true,
        results: uniqueResults.slice(0, limit),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Seller search API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

