import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSellerShipments, verifyOrderBelongsToSeller } from "@/application/shipping/seller/getSellerShipments";
import type { ShipmentStatus } from "@/application/shipping/seller/getSellerShipments";

/**
 * GET /api/seller/shipping
 * Get all shipments for the seller's selected store
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storeId = request.nextUrl.searchParams.get("storeId");
    const statusFilter = request.nextUrl.searchParams.get("status") as ShipmentStatus | null;

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

    // Get shipments
    const shipments = await getSellerShipments(storeId, statusFilter || undefined);

    return NextResponse.json({ shipments });
  } catch (error) {
    console.error("Error fetching seller shipments:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/seller/shipping
 * Create a new shipment
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { storeId, orderId, trackingNumber, carrier, estimatedDelivery } = body;

    if (!storeId || !orderId) {
      return NextResponse.json(
        { error: "Store ID and Order ID are required" },
        { status: 400 }
      );
    }

    // Verify the store belongs to the user
    const { data: store } = await supabase
      .from("stores")
      .select("id")
      .eq("id", storeId)
      .eq("owner_id", user.id)
      .single();

    if (!store) {
      return NextResponse.json(
        { error: "Store not found or access denied" },
        { status: 403 }
      );
    }

    // Verify order belongs to seller
    const orderBelongsToSeller = await verifyOrderBelongsToSeller(orderId, storeId);
    if (!orderBelongsToSeller) {
      return NextResponse.json(
        { error: "Order not found or does not contain your products" },
        { status: 403 }
      );
    }

    // Check if shipment already exists
    const { data: existingShipment } = await supabase
      .from("shipments")
      .select("id")
      .eq("order_id", orderId)
      .single();

    if (existingShipment) {
      return NextResponse.json(
        { error: "Shipment already exists for this order" },
        { status: 400 }
      );
    }

    // Create shipment
    const { data: shipment, error: shipmentError } = await supabase
      .from("shipments")
      .insert({
        order_id: orderId,
        tracking_number: trackingNumber || null,
        carrier: carrier || null,
        status: "pending",
        estimated_delivery: estimatedDelivery || null,
      })
      .select()
      .single();

    if (shipmentError) {
      return NextResponse.json(
        { error: shipmentError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ shipment }, { status: 201 });
  } catch (error) {
    console.error("Error creating shipment:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

