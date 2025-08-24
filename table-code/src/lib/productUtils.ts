import { Product } from "./products";

export function initializeProducts(): Product[] {
  const products = Array.from({ length: 20 }, (_, i) => ({
    id: (i + 1).toString(),
    name: `blank ${i + 1}`,
    hfo: 0,
    vlsfo: 0,
    mgo: 0,
    change: 0,
    lastUpdated: new Date().toISOString()
  }));

  localStorage.setItem("products", JSON.stringify(products));
  return products;
}

export function getProducts(): Product[] {
  try {
    const savedProducts = localStorage.getItem("products");
    if (savedProducts) {
      const parsed = JSON.parse(savedProducts) as Product[];
      // Check if we have the correct number of products with correct naming
      if (parsed.length !== 20 || !parsed.every(p => p.name.startsWith('blank '))) {
        console.log("Product data is outdated, reinitializing...");
        return initializeProducts();
      }
      return parsed;
    }
  } catch (error) {
    console.error("Error loading products:", error);
  }

  return initializeProducts();
}
