import { Product, PRODUCTS } from "./products";
import { supabase } from "./supabaseClient";

export async function initializeProducts(): Promise<Product[]> {
  try {
    // Call the backend API to reset products in Supabase
    const response = await fetch("/api/force-init", {
      method: "POST",
    });
    if (!response.ok) {
      console.error("API /api/force-init failed:", await response.text());
      return PRODUCTS;
    }
    // After reset, fetch the latest products from Supabase
    const { data, error } = await supabase
      .from("products")
      .select("id, name, hfo, vlsfo, mgo, change, lastupdated")
      .order("id");
    if (error || !data) {
      console.error("Error fetching products after reset:", error);
      return PRODUCTS;
    }
    return data as Product[];
  } catch (error) {
    console.error("Error initializing products via API:", error);
    return PRODUCTS;
  }
}

export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, hfo, vlsfo, mgo, change, lastupdated')
      .order('id');

    console.log("Supabase products fetch result:", { data, error });

    if (error) {
      console.error("Error fetching products from database (falling back to PRODUCTS):", error);
      return await initializeProducts();
    }

    if (!data || data.length === 0) {
      console.warn("No products found in database (falling back to PRODUCTS)");
      return await initializeProducts();
    }

    // Map database results back to Product interface format
    const products = data.map(item => ({
      id: item.id,
      name: item.name,
      hfo: item.hfo,
      vlsfo: item.vlsfo,
      mgo: item.mgo,
      change: item.change,
      lastUpdated: item.lastupdated  // Map from lowercase to camelCase
    })) as Product[];

    // Validate data structure
    if (products.length !== PRODUCTS.length || !products.every((p, i) => p.name === PRODUCTS[i].name)) {
      console.warn("Product data is outdated or mismatched (falling back to PRODUCTS)");
      return await initializeProducts();
    }

    console.log("Products loaded from database:", products);
    return products;
  } catch (error) {
    console.error("Error loading products (exception, falling back to PRODUCTS):", error);
    return await initializeProducts();
  }
}

export async function updateProduct(updatedProduct: Product): Promise<boolean> {
  try {
    console.log("Attempting to update product:", updatedProduct.id, updatedProduct.name);

    const { data, error } = await supabase
      .from('products')
      .update({
        hfo: updatedProduct.hfo,
        vlsfo: updatedProduct.vlsfo,
        mgo: updatedProduct.mgo,
        change: updatedProduct.change,
        lastupdated: updatedProduct.lastUpdated  // Use lowercase to match database
      })
      .eq('id', updatedProduct.id)
      .select();

    if (error) {
      console.error("Error updating product in database:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error details:", error.details);
      return false;
    }

    console.log("Update successful, updated rows:", data?.length);
    return true;
  } catch (error) {
    console.error("Error updating product:", error);
    return false;
  }
}
