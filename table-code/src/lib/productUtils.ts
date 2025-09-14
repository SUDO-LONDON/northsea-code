import { Product, PRODUCTS } from "./products";
import { supabase } from "./supabaseClient";

// ✅ Reset only the prices + change, keep products intact
export async function resetProductsPrices(): Promise<Product[]> {
    try {
        console.log("Resetting product prices...");

        // Reset each product’s pricing back to defaults from PRODUCTS
        for (const p of PRODUCTS) {
            const { error } = await supabase
                .from("products")
                .update({
                    hfo: p.hfo,
                    vlsfo: p.vlsfo,
                    mgo: p.mgo,
                    change: 0,
                    lastupdated: new Date().toISOString(),
                })
                .eq("id", p.id);

            if (error) {
                console.error(`Error resetting product ${p.id}:`, error);
            }
        }

        // ✅ Fetch fresh data after reset
        const { data, error: fetchError } = await supabase
            .from("products")
            .select("id, name, hfo, vlsfo, mgo, change, lastupdated")
            .order("id");

        if (fetchError || !data) {
            console.error("Error fetching products after reset:", fetchError);
            return PRODUCTS;
        }

        return (data as any[]).map((item) => ({
            id: item.id,
            name: item.name,
            hfo: item.hfo,
            vlsfo: item.vlsfo,
            mgo: item.mgo,
            change: item.change,
            lastUpdated: item.lastupdated,
        })) as Product[];
    } catch (error) {
        console.error("Unexpected error resetting product prices:", error);
        return PRODUCTS;
    }
}

// ✅ Initialize products (still uses your API route)
export async function initializeProducts(): Promise<Product[]> {
    try {
        const response = await fetch("/api/force-init", { method: "POST" });
        if (!response.ok) {
            console.error("API /api/force-init failed:", await response.text());
            return PRODUCTS;
        }

        const { data, error } = await supabase
            .from("products")
            .select("id, name, hfo, vlsfo, mgo, change, lastupdated")
            .order("id");

        if (error || !data) {
            console.error("Error fetching products after init:", error);
            return PRODUCTS;
        }

        return (data as any[]).map((item) => ({
            id: item.id,
            name: item.name,
            hfo: item.hfo,
            vlsfo: item.vlsfo,
            mgo: item.mgo,
            change: item.change,
            lastUpdated: item.lastupdated,
        }));
    } catch (error) {
        console.error("Error initializing products via API:", error);
        return PRODUCTS;
    }
}

// ✅ Fetch live products
export async function getProducts(): Promise<Product[]> {
    try {
        const { data, error } = await supabase
            .from("products")
            .select("id, name, hfo, vlsfo, mgo, change, lastupdated")
            .order("id");

        if (error) {
            console.error("Error fetching products, falling back:", error);
            return await initializeProducts();
        }

        if (!data || data.length === 0) {
            console.warn("No products in DB, falling back to init");
            return await initializeProducts();
        }

        const products = (data as any[]).map((item) => ({
            id: item.id,
            name: item.name,
            hfo: item.hfo,
            vlsfo: item.vlsfo,
            mgo: item.mgo,
            change: item.change,
            lastUpdated: item.lastupdated,
        })) as Product[];

        if (
            products.length !== PRODUCTS.length ||
            !products.every((p, i) => p.name === PRODUCTS[i].name)
        ) {
            console.warn("Products mismatched — resetting...");
            return await initializeProducts();
        }

        return products;
    } catch (error) {
        console.error("Error loading products, falling back:", error);
        return await initializeProducts();
    }
}

// ✅ Update one product
export async function updateProduct(updatedProduct: Product): Promise<boolean> {
    try {
        const { error } = await supabase
            .from("products")
            .update({
                hfo: updatedProduct.hfo,
                vlsfo: updatedProduct.vlsfo,
                mgo: updatedProduct.mgo,
                change: updatedProduct.change,
                lastupdated: updatedProduct.lastUpdated,
            })
            .eq("id", updatedProduct.id);

        if (error) {
            console.error("Error updating product:", error);
            return false;
        }

        return true;
    } catch (error) {
        console.error("Exception updating product:", error);
        return false;
    }
}
