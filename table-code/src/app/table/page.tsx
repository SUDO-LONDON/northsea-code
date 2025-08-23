"use client";

import { useEffect, useState } from "react";
import { ProductsTable } from "@/components/ProductsTable";
import { Card } from "@/components/ui/card";
import { Product } from "@/lib/products";

export default function TradingPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Load products from localStorage
    const loadProducts = () => {
      const savedProducts = localStorage.getItem("products");
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      }
    };

    // Initial load
    loadProducts();

    // Set up periodic refresh
    const interval = setInterval(loadProducts, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Trading Panel
          </h1>
          <p className="text-muted-foreground">
            Real-time market data and analytics
          </p>
        </div>

        <div className="grid gap-6">
          <Card className="border shadow-sm">
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Price Overview
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Current market prices for all products
                </p>
              </div>
              <ProductsTable data={products} />
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Quick Stats
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted border">
                    <p className="text-sm text-muted-foreground">Total Products</p>
                    <p className="text-2xl font-bold text-foreground">
                      {products.length}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted border">
                    <p className="text-sm text-muted-foreground">Last Update</p>
                    <p className="text-2xl font-bold text-foreground">
                      {products[0]?.lastUpdated
                        ? new Date(products[0].lastUpdated).toLocaleTimeString()
                        : "--:--"}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Price Range
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted border">
                    <p className="text-sm text-muted-foreground">Lowest HFO Price</p>
                    <p className="text-2xl font-bold text-foreground">
                      £
                      {products.length > 0
                        ? Math.min(...products.map((p) => p.hfo)).toFixed(2)
                        : "0.00"}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted border">
                    <p className="text-sm text-muted-foreground">Highest HFO Price</p>
                    <p className="text-2xl font-bold text-foreground">
                      £
                      {products.length > 0
                        ? Math.max(...products.map((p) => p.hfo)).toFixed(2)
                        : "0.00"}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
