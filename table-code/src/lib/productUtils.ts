import { Product, PRODUCTS } from "./products";

export function initializeProducts(): Product[] {
  // Deep copy PRODUCTS to avoid mutation
  const products = PRODUCTS.map(p => ({ ...p }));
  if (typeof window !== 'undefined') {
    localStorage.setItem("products", JSON.stringify(products));
  }
  return products;
}

export function getProducts(): Product[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const savedProducts = localStorage.getItem("products");
    if (savedProducts) {
      const parsed = JSON.parse(savedProducts) as Product[];
      // If outdated, reinitialize with city names
      if (parsed.length !== PRODUCTS.length || !parsed.every((p, i) => p.name === PRODUCTS[i].name)) {
        console.log("Product data is outdated, reinitializing with city names...");
        return initializeProducts();
      }
      return parsed;
    }
  } catch (error) {
    console.error("Error loading products:", error);
  }
  return initializeProducts();
}
