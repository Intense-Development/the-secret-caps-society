import { createClient } from "@/lib/supabase/server";

export type StoreSettings = {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  business_type: string | null;
  tax_id: string | null;
  address: string;
  city: string;
  state: string;
  zip: string;
  photo: string | null;
  verification_status: "pending" | "verified" | "rejected";
  verification_document_url: string | null;
  verified_at: string | null;
  products_count: number;
  created_at: string;
  updated_at: string;
};

/**
 * Get store settings for a specific store
 */
export async function getStoreSettings(
  storeId: string | null
): Promise<StoreSettings | null> {
  if (!storeId) {
    return null;
  }

  const supabase = await createClient();

  const { data: store, error } = await supabase
    .from("stores")
    .select("*")
    .eq("id", storeId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!store) {
    return null;
  }

  return {
    id: store.id,
    name: store.name,
    description: store.description,
    website: store.website,
    business_type: store.business_type,
    tax_id: store.tax_id,
    address: store.address,
    city: store.city,
    state: store.state,
    zip: store.zip,
    photo: store.photo,
    verification_status: store.verification_status as "pending" | "verified" | "rejected",
    verification_document_url: store.verification_document_url,
    verified_at: store.verified_at,
    products_count: store.products_count,
    created_at: store.created_at,
    updated_at: store.updated_at,
  };
}

/**
 * Get user account settings
 */
export async function getUserSettings(userId: string) {
  const supabase = await createClient();

  const { data: user, error } = await supabase
    .from("users")
    .select("id, name, email, role")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return user;
}

