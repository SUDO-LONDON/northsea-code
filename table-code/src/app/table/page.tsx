"use client";

import React, { useEffect, useState } from "react";
import { ProductsTable } from "@/components/ProductsTable";
import { Card } from "@/components/ui/card";
import { Product } from "@/lib/products";
import { getProducts } from "@/lib/productUtils";
import ClientOnly from "@/components/ClientOnly";
import CommodityTickerPanel from "@/components/CommodityTickerPanel";
import Cookies from 'js-cookie';
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { supabase } from "@/lib/supabaseClient";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import Link from "next/link";

const PRODUCT_ID_MAP: { [id: string]: string } = {
    "e9e305ee-8605-4503-b3e2-8f5763870cd2": "Rotterdam 3.5%",
    "29d3a405-cb03-45b4-9ebf-f0176b7ba06a": "Rotterdam 0.5%",
    "b0738070-229c-4aa7-b5d0-45b4119dd0e0": "NWE 1% FOB",
    "662e5a2f-f028-4d18-81dc-89be3ba01f3a": "Singapore 0.5%",
    "6ccbf93e-d43d-46ab-ba50-c26659add883": "Singapore 380 CST",
    "e506264b-1bcd-429f-b018-f50e3f517133": "USGC 3%",
    "99d27f4d-0a7e-44fe-b9de-9c27d27f08d2": "USGC 0.5%",
    "9c68de75-aed7-417b-abab-eaf576d0d6fe": "Singapore 10ppm",
    "d71f82b9-21e2-49f0-9974-4a11a9e5b09f": "Rotterdam 0.1%",
};

// Split product IDs for display
const PRODUCT_IDS = Object.keys(PRODUCT_ID_MAP);
const CSC_COMMODITIES_IDS = PRODUCT_IDS.slice(0, 7);
const GASOIL_IDS = PRODUCT_IDS.slice(-2);

interface LivePrice {
    id: string;
    value: number;
    history?: number[];
}

// Helper for sparkline data
const generateSparklineData = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    x: i,
    y: 50 + Math.random() * 20
  }))
};

// Helper to get unit for product name
const BBLS_PRODUCTS = ["USGC 3%", "USGC 0.5%", "Singapore 10ppm"];
const getUnit = (name: string) => {
  if (name === "Rotterdam 0.1%") return " / MT";
  if (BBLS_PRODUCTS.includes(name)) return " / BBLS";
  return GASOIL_IDS.map(id => PRODUCT_ID_MAP[id]).includes(name) ? " / BBLS" : " / MT";
};

// Helper to robustly extract a numeric value from any input
function extractNumericValue(val: unknown): number | null {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const num = Number(val);
    return isNaN(num) ? null : num;
  }
  if (Array.isArray(val)) {
    // Try to find a number in the array
    for (const v of val) {
      const num = extractNumericValue(v);
      if (num !== null) return num;
    }
  }
  if (val && typeof val === 'object') {
    // Try common keys
    if ('value' in val && typeof (val as Record<string, unknown>).value === 'number') return (val as Record<string, unknown>).value as number;
    if ('amount' in val && typeof (val as Record<string, unknown>).amount === 'number') return (val as Record<string, unknown>).amount as number;
    // Fallback: first numeric property
    for (const v of Object.values(val as Record<string, unknown>)) {
      const num = extractNumericValue(v);
      if (num !== null) return num;
    }
  }
  return null;
}

// Helper to extract string value
function extractStringValue(val: unknown): string | null {
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return val.toString();
  if (Array.isArray(val)) {
    for (const v of val) {
      const str = extractStringValue(v);
      if (str) return str;
    }
  }
  if (val && typeof val === 'object') {
    if ('value' in val && typeof (val as Record<string, unknown>).value === 'string') return (val as Record<string, unknown>).value as string;
    if ('amount' in val && typeof (val as Record<string, unknown>).amount === 'string') return (val as Record<string, unknown>).amount as string;
    for (const v of Object.values(val as Record<string, unknown>)) {
      const str = extractStringValue(v);
      if (str) return str;
    }
  }
  return null;
}

export default function TradingPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [livePrices, setLivePrices] = useState<LivePrice[]>([]);
    const router = useRouter();
    useEffect(() => {
        // Auth check
        const isAuthenticated = Cookies.get('adminAuth');
        if (!isAuthenticated) {
            router.push("/");
            return;
        }

        const loadProducts = async () => {
            try {
                const loadedProducts = await getProducts();
                setProducts(loadedProducts);
            } catch (error) {
                console.error("Error loading products:", error);
            }
        };

        loadProducts();

        // Subscribe to real-time changes in products table
        const subscription = supabase
            .channel('products-changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'products',
            }, () => {
                // Re-fetch products on any change
                loadProducts()
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [router]);

    useEffect(() => {
        const fetchLivePrices = async () => {
            try {
                const res = await fetch("/api/folio-prices");
                if (!res.ok) return;
                const data = await res.json();
                setLivePrices(Array.isArray(data) ? data : []);
            } catch {
                setLivePrices([]);
            }
        };
        fetchLivePrices();
        const interval = setInterval(fetchLivePrices, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-background min-h-screen text-white">
            <div className="container mx-auto p-4 sm:p-6">
                <div className="mb-6 sm:mb-8">
                    <div className="flex justify-between items-center mb-1 sm:mb-2">
                        <div>
                            <Image
                                src="/logo.png"
                                alt="Trading Panel Logo"
                                width={280}
                                height={280}
                                priority
                            />
                        </div>
                        <div className="flex flex-col items-center">
                          <Link href="https://northseatrading.org" className="px-4 py-2 rounded bg-primary text-white font-medium shadow hover:bg-primary/80 transition-colors text-sm sm:text-base">
                            Back to Home
                          </Link>
                        </div>
                    </div>

                </div>

                <div className="grid gap-4 sm:gap-6 sm:grid-cols-3">
                    {/* Main table card */}
                    <Card className="bg-background border border-white shadow-sm sm:col-span-2">
                        <div className="p-4 sm:p-6">
                            <div className="mb-4 sm:mb-6">
                                <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                                    Bunker Prices
                                </h2>
                                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                    All Prices Per Metric Ton <br />
                                    Graph values based on the average of all three grades.
                                </p>
                            </div>
                            {/* Make table horizontally scrollable */}
                            <div className="overflow-x-auto">
                                <div className="min-w-full">
                                    <ProductsTable data={products} />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* CSC Card - restored with Gasoils and CommodityTickerPanel */}
                    <ClientOnly>
                      <Card className="border shadow-sm mb-4 sm:mb-0">
                        <div className="p-4 sm:p-6 pb-3">
                          <div className="flex items-center justify-center mb-4 sm:mb-6">
                            <Image
                              src="/csc.png"
                              alt="Paper Trading Logo"
                              width={336}
                              height={336}
                              className="block max-w-full h-auto"
                              style={{ filter: 'invert(1)' }}
                            />
                          </div>
                          <div className="space-y-2 sm:space-y-3 flex flex-col">
                            {CSC_COMMODITIES_IDS.map((id) => {
                              const name = PRODUCT_ID_MAP[id];
                              const priceObj = livePrices.find((p) => p.id === id);
                              const sparklineData = priceObj && Array.isArray(priceObj.history)
                                ? priceObj.history.map((y, x) => ({ x, y }))
                                : generateSparklineData();
                              let color = "#10B981";
                              let percentChange = null;
                              if (sparklineData.length > 1) {
                                const last = sparklineData[sparklineData.length - 1].y;
                                const prev = sparklineData[sparklineData.length - 2].y;
                                color = last >= prev ? "#10B981" : "#EF4444";
                                percentChange = prev !== 0 ? ((last - prev) / prev) * 100 : null;
                              }
                              const value = extractStringValue(priceObj?.value);
                              return (
                                <div
                                  key={id}
                                  className="flex items-center border-b pb-2 last:border-b-0 last:pb-0 w-full"
                                >
                                  <span className="font-medium text-foreground text-sm sm:text-base w-1/3">
                                    {name}
                                  </span>
                                  <div className="w-[80px] h-[32px] mx-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <AreaChart data={sparklineData}>
                                        <defs>
                                          <linearGradient id={`colorUv-${id}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={color} stopOpacity={0.6}/>
                                            <stop offset="95%" stopColor={color} stopOpacity={0}/>
                                          </linearGradient>
                                        </defs>
                                        <Area
                                          type="monotone"
                                          dataKey="y"
                                          stroke={color}
                                          fillOpacity={1}
                                          fill={`url(#colorUv-${id})`}
                                          strokeWidth={2}
                                        />
                                      </AreaChart>
                                    </ResponsiveContainer>
                                  </div>
                                  <span className="text-sm sm:text-base font-bold w-1/3 text-right" style={{ color }}>
                                    {value !== null
                                      ? `${value}${getUnit(name)}`
                                      : "--"}
                                    {percentChange !== null && (
                                      <span className="ml-2" style={{ color }}>
                                        {percentChange >= 0 ? "▲" : "▼"} {Math.abs(percentChange).toFixed(2)}%
                                      </span>
                                    )}
                                  </span>
                                </div>
                              );
                            })}
                            {/* Gasoils Section */}
                            <h3 className="font-semibold text-base sm:text-lg mt-4 mb-2">Gasoil:</h3>
                            {GASOIL_IDS.map((id) => {
                              const name = PRODUCT_ID_MAP[id];
                              const priceObj = livePrices.find((p) => p.id === id);
                              const sparklineData = priceObj && Array.isArray(priceObj.history)
                                ? priceObj.history.map((y, x) => ({ x, y }))
                                : generateSparklineData();
                              let color = "#10B981";
                              let percentChange = null;
                              if (sparklineData.length > 1) {
                                const last = sparklineData[sparklineData.length - 1].y;
                                const prev = sparklineData[sparklineData.length - 2].y;
                                color = last >= prev ? "#10B981" : "#EF4444";
                                percentChange = prev !== 0 ? ((last - prev) / prev) * 100 : null;
                              }
                              const value = extractStringValue(priceObj?.value);
                              return (
                                <div
                                  key={id}
                                  className="flex items-center border-b pb-2 last:border-b-0 last:pb-0 w-full"
                                >
                                  <span className="font-medium text-foreground text-sm sm:text-base w-1/3">
                                    {name}
                                  </span>
                                  <div className="w-[80px] h-[32px] mx-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <AreaChart data={sparklineData}>
                                        <defs>
                                          <linearGradient id={`colorUv-${id}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={color} stopOpacity={0.6}/>
                                            <stop offset="95%" stopColor={color} stopOpacity={0}/>
                                          </linearGradient>
                                        </defs>
                                        <Area
                                          type="monotone"
                                          dataKey="y"
                                          stroke={color}
                                          fillOpacity={1}
                                          fill={`url(#colorUv-${id})`}
                                          strokeWidth={2}
                                        />
                                      </AreaChart>
                                    </ResponsiveContainer>
                                  </div>
                                  <span className="text-xs sm:text-sm font-bold w-1/3 text-right" style={{ color }}>
                                    {value !== null
                                      ? `${value}${getUnit(name)}`
                                      : "--"}
                                    {percentChange !== null && (
                                      <span className="ml-2" style={{ color }}>
                                        {percentChange >= 0 ? "▲" : "▼"} {Math.abs(percentChange).toFixed(2)}%
                                      </span>
                                    )}
                                  </span>
                                </div>
                              );
                            })}

                          </div>
                          {/* Commodity Ticker Panel */}
                          <div className="border-t border-gray-700">
                            <CommodityTickerPanel />
                          </div>
                        </div>
                      </Card>
                    </ClientOnly>
                </div>
            </div>
        </div>
    );
}
