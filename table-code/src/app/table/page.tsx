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
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Trading Panel</h1>
        </div>

        <div className="grid gap-6">
          <Card className="border-gray-200 bg-white shadow-sm">
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Price Overview
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Current market prices for all products
                </p>
              </div>
              <ProductsTable data={products} />
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-gray-200 bg-white shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.length}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="text-sm text-gray-600">Last Update</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products[0]?.lastUpdated
                      ? new Date(products[0].lastUpdated).toLocaleTimeString()
                      : "--:--"}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-gray-200 bg-white shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Price Range</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="text-sm text-gray-600">Lowest HFO Price</p>
                  <p className="text-2xl font-bold text-gray-900">
                    £{Math.min(...products.map((p) => p.hfo)).toFixed(2)}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="text-sm text-gray-600">Highest HFO Price</p>
                  <p className="text-2xl font-bold text-gray-900">
                    £{Math.max(...products.map((p) => p.hfo)).toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
