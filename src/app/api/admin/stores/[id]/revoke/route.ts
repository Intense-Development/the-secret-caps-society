import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * POST /api/admin/stores/[id]/revoke
 * Revoke verification for a verified store (sets status to "pending")
 */
export async function POST(
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

    // Update store verification status to "pending" (not "rejected")
    // This allows the store to be re-verified later
    const { data: store, error } = await supabase
      .from("stores")
      .update({
        verification_status: "pending",
        verified_at: null, // Clear verification timestamp
        updated_at: new Date().toISOString(),
      })
      .eq("id", storeId)
      .select()
      .single();

    if (error) {
      console.error("Error revoking store verification:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to revoke store verification",
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

    // TODO: Send notification email to store owner
    // This would be implemented in a separate service/function

    return NextResponse.json(
      {
        success: true,
        store,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Revoke store verification API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

