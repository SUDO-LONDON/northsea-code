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
    "name", "hfo", "vlsfo", "mgo", "change", "lastUpdated"
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
  const response = await fetch('/api/init-db', {
    method: 'POST',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to initialize products');
  }

  const result = await response.json();

  // The API returns a message and product count/created on success.
  // To update the dashboard state, we need the actual product list.
  // We can re-fetch the products after initialization.
  if (result.message) {
    return getProducts();
  }

  // Fallback for unexpected response format
  return [];
}
