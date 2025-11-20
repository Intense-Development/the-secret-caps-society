import { createClient } from "@/lib/supabase/server";

export type SellerProduct = {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  category?: string;
  stock: number;
  store_id: string;
  is_featured?: boolean;
  created_at: string;
  updated_at: string;
  archived?: boolean; // Will be added in migration
};

/**
 * Get all products for a seller's store(s)
 */
export async function getSellerProducts(
  storeId: string | null
): Promise<SellerProduct[]> {
  if (!storeId) {
    return [];
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((product) => ({
    id: product.id,
    name: product.name,
    price: parseFloat(product.price.toString()),
    image: product.image || undefined,
    description: product.description || undefined,
    category: product.category || undefined,
    stock: product.stock ?? 0,
    store_id: product.store_id,
    is_featured: product.is_featured || false,
    created_at: product.created_at,
    updated_at: product.updated_at,
    archived: product.archived || false,
  }));
}

/**
 * Get a single product by ID (for seller's store)
 */
export async function getSellerProduct(
  productId: string,
  storeId: string | null
): Promise<SellerProduct | null> {
  if (!storeId) {
    return null;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("store_id", storeId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    price: parseFloat(data.price.toString()),
    image: data.image || undefined,
    description: data.description || undefined,
    category: data.category || undefined,
    stock: data.stock ?? 0,
    store_id: data.store_id,
    is_featured: data.is_featured || false,
    created_at: data.created_at,
    updated_at: data.updated_at,
    archived: data.archived || false,
  };
}

