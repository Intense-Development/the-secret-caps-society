import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * GET /api/admin/stores/[id]
 * Get store details by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storeId } = await params;

    if (!storeId) {
      return NextResponse.json(
        {
          success: false,
          error: "Store ID is required",
        },
        { status: 400 }
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

    // Get store with owner information
    const { data: store, error } = await supabase
      .from("stores")
      .select(
        `
        *,
        owner:users!owner_id (
          id,
          name,
          email
        )
      `
      )
      .eq("id", storeId)
      .single();

    if (error) {
      console.error("Error fetching store:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch store",
        },
        { status: 500 }
      );
    }

    if (!store) {
      return NextResponse.json(
        {
          success: false,
          error: "Store not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        store,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get store API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

