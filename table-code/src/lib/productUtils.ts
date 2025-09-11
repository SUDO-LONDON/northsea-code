import { Product, PRODUCTS } from "./products";
import { supabase } from "./supabaseClient";

export async function initializeProducts(): Promise<Product[]> {
  // Deep copy PRODUCTS and map to database format
  const products = PRODUCTS.map(p => ({
    id: p.id,
    name: p.name,
    hfo: p.hfo,
    vlsfo: p.vlsfo,
    mgo: p.mgo,
    change: p.change,
    lastupdated: p.lastUpdated  // Only include lowercase column name
  }));

  try {
    // Clear existing products and insert new ones
    await supabase.from('products').delete().neq('id', '');

    const { error } = await supabase
      .from('products')
      .insert(products);

    if (error) {
      console.error("Error initializing products in database:", error);
      return PRODUCTS; // Return original copy if DB fails
    }

    return PRODUCTS;
  } catch (error) {
    console.error("Error initializing products:", error);
    return PRODUCTS;
  }
}

export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, hfo, vlsfo, mgo, change, lastupdated')  // Use lowercase column name
      .order('id');

    if (error) {
      console.error("Error fetching products from database:", error);
      return await initializeProducts();
    }

    if (!data || data.length === 0) {
      console.log("No products found, initializing...");
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
      console.log("Product data is outdated, reinitializing...");
      return await initializeProducts();
    }

    return products;
  } catch (error) {
    console.error("Error loading products:", error);
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
