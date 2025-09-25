import { supabase } from "@/lib/supabaseClient";
import { Product } from "@/lib/products";

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
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Product;
}

