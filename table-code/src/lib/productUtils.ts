import { supabase } from "@/lib/supabaseClient";
import { Product, PRODUCTS } from "@/lib/products";

// Fetch all products from Supabase
export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*");
  if (error) throw error;
  return data as Product[];
}

// Update a product in Supabase
export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  // Only send fields that exist in the DB
  const allowedFields: (keyof Product)[] = [
    "name", "hfo", "vlsfo", "mgo", "change", "lastupdated"
  ];
  const filteredUpdates: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in updates) {
      filteredUpdates[key] = updates[key];
    }
  }
  const { data, error } = await supabase
    .from("products")
    .update(filteredUpdates)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error("Supabase update error:", error);
    throw error;
  }
  return data as Product;
}

// Initialize or reset products in Supabase with default PRODUCTS
export async function initializeProducts(): Promise<Product[]> {
  // Remove all existing products
  const { error: deleteError } = await supabase.from("products").delete().neq("id", "");
  if (deleteError) throw deleteError;

  // Insert default products
  const { data, error } = await supabase.from("products").insert(PRODUCTS).select("*");
  if (error) throw error;
  return data as Product[];
}
