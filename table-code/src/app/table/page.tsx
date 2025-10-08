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
// Make deterministic: if baseValue provided, create a flat series; otherwise return an empty array (no data)
const generateSparklineData = (baseValue?: number) => {
  if (typeof baseValue === 'number') {
    return Array.from({ length: 20 }, (_, i) => ({ x: i, y: baseValue }));
  }
  return [] as { x: number; y: number }[];
};

// Helper to get unit for product name
const BBLS_PRODUCTS = ["USGC 3%", "USGC 0.5%", "Singapore 10ppm"];
const getUnit = (name: string) => {
  if (name === "Rotterdam 0.1%") return " / MT";
  if (BBLS_PRODUCTS.includes(name)) return " / BBLS";
  return GASOIL_IDS.map(id => PRODUCT_ID_MAP[id]).includes(name) ? " / BBLS" : " / MT";
};

export default function TradingPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [livePrices, setLivePrices] = useState<LivePrice[]>([]);
    // New: series fetched from /api/csc-memory-history (in-memory hourly series)
    const [cscSeries, setCscSeries] = useState<Record<string, { x: string | number; y: number }>>({});
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

    // Fetch the in-memory CSC memory history so percent-change uses real historical points
    useEffect(() => {
      let mounted = true;
      const fetchCscMemory = async () => {
        try {
          const res = await fetch('/api/csc-memory-history');
          if (!res.ok) return;
          const data: { timestamp: string; prices: Record<string, number> }[] = await res.json();
          // Build series map id -> [{x: timestamp, y: price}, ...] ordered oldest -> newest
          const out: Record<string, { x: string | number; y: number }[]> = {};
          PRODUCT_IDS.forEach(id => { out[id] = []; });
          data.forEach(entry => {
            PRODUCT_IDS.forEach(id => {
              if (entry.prices && entry.prices[id] !== undefined) {
                out[id].push({ x: entry.timestamp, y: entry.prices[id] });
              }
            });
          });
          if (mounted) setCscSeries(out);
        } catch (e) {
          // ignore errors
        }
      };
      fetchCscMemory();
      const iv = setInterval(fetchCscMemory, 15000);
      return () => { mounted = false; clearInterval(iv); };
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

                <div className="grid gap-4 sm:gap-6 sm:grid-cols-5">
                    {/* Main table card */}
                    <Card className="bg-background border border-white shadow-sm sm:col-span-3">
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
                                <div style={{ minWidth: 'calc(100% - 30px)' }}>
                                    <ProductsTable data={products} />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* CSC Card - restored with Gasoils and CommodityTickerPanel */}
                    <div className="sm:col-span-2">
                    <ClientOnly>
                        <Card className="border shadow-sm mb-4 sm:mb-0 bg-background rounded-xl">
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
                            <div>
                              <div>
                                 {/* Table header for CSC commodities */}
                                <div className="flex items-center font-bold border-b border-[#333] pb-3 text-foreground text-base rounded-t-xl gap-3" style={{letterSpacing: '0.01em'}}>
                                  <span className="pl-2" style={{width: '38%', paddingRight: 8}}>Name</span>
                                  <span className="mx-2 text-center" style={{width: '140px', paddingRight: 8}}>Graph</span>
                                  <span className="text-right pr-2" style={{width: '30%', paddingRight: 8}}>Price</span>
                                  <span className="text-right pr-2" style={{width: '22%'}}>1hr % Change</span>
                                </div>
                                {CSC_COMMODITIES_IDS.map((id, _idx) => {
                                   const name = PRODUCT_ID_MAP[id];
                                   const priceObj = livePrices.find((p) => p.id === id);
                                   // Prefer series from in-memory history (cscSeries), then priceObj.history, then deterministic flat series from current value
                                   const sparklineData = (cscSeries[id] && cscSeries[id].length > 0)
                                     ? cscSeries[id].map((pt) => ({ x: pt.x, y: pt.y }))
                                     : priceObj && Array.isArray(priceObj.history)
                                       ? priceObj.history.map((y, x) => ({ x, y }))
                                       : generateSparklineData(priceObj?.value);
                                   let color = "#10B981"; // green default
                                   if (sparklineData.length > 1) {
                                     const last = sparklineData[sparklineData.length - 1].y;
                                     const prev = sparklineData[sparklineData.length - 2].y;
                                     color = last >= prev ? "#10B981" : "#EF4444"; // red if down
                                   }
                                  // Calculate 1hr percentage change from sparklineData (first -> last)
                                  // sparklineData is expected to be ordered oldest -> newest
                                  let percentChange: number | null = null;
                                  if (sparklineData.length > 1) {
                                    const first = sparklineData[0].y;
                                    const last = sparklineData[sparklineData.length - 1].y;
                                    if (first !== 0) {
                                      percentChange = ((last - first) / first) * 100;
                                    }
                                  }
                                   const percentColor = percentChange !== null ? (percentChange >= 0 ? "#10B981" : "#EF4444") : "#aaa";
                                   const percentArrow = percentChange !== null ? (percentChange > 0 ? "▲" : percentChange < 0 ? "▼" : "") : "";
                                   return (
                                     <div
                                       key={id}
                                      className={`flex items-center border-b border-[#23272f] last:border-b-0 py-3 transition-colors duration-150 hover:bg-muted rounded-xl gap-3`}
                                      style={{marginBottom: 2}}
                                     >
                                      <span className="font-medium text-foreground text-sm sm:text-base pl-2" style={{color: '#e5e7eb', width: '38%', paddingRight: 8}}>
                                        {name}
                                      </span>
                                      <div className="h-[32px] mx-2 flex items-center justify-center" style={{width: 140}}>
                                         {sparklineData && sparklineData.length > 0 ? (
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
                                         ) : (
                                           <div className="text-xs text-muted">No data</div>
                                         )}
                                       </div>
                                      <span className="text-sm sm:text-base font-bold text-right pr-2" style={{ color: '#d1d5db', fontVariantNumeric: 'tabular-nums', width: '30%', paddingRight: 8 }}>
                                         {priceObj && priceObj.value !== undefined
                                           ? `$${priceObj.value.toLocaleString(undefined, {
                                               minimumFractionDigits: 2,
                                               maximumFractionDigits: 2,
                                             })}${getUnit(name)}`
                                           : "--"}
                                       </span>
                                      <span className="text-right pr-2 font-bold" style={{ color: percentColor, fontSize: '0.98em', fontVariantNumeric: 'tabular-nums', width: '22%' }}>
                                        {percentArrow} {percentChange !== null ? `${percentChange.toFixed(2)}%` : "--"}
                                      </span>
                                     </div>
                                   );
                                 })}
                                {/* Gasoils Section (unchanged) */}
                                <h3 className="font-semibold text-base sm:text-lg mt-4 mb-2 pl-2">Gasoil:</h3>
                                {GASOIL_IDS.map((id, _idx) => {
                                  const name = PRODUCT_ID_MAP[id];
                                  const priceObj = livePrices.find((p) => p.id === id);
                                  // Prefer cscSeries first, then priceObj.history, then deterministic flat series
                                  const sparklineData = (cscSeries[id] && cscSeries[id].length > 0)
                                    ? cscSeries[id].map((pt) => ({ x: pt.x, y: pt.y }))
                                    : priceObj && Array.isArray(priceObj.history)
                                      ? priceObj.history.map((y, x) => ({ x, y }))
                                      : generateSparklineData(priceObj?.value);
                                   let color = "#10B981"; // green default
                                   if (sparklineData.length > 1) {
                                     const last = sparklineData[sparklineData.length - 1].y;
                                     const prev = sparklineData[sparklineData.length - 2].y;
                                     color = last >= prev ? "#10B981" : "#EF4444"; // red if down
                                   }
                                   // Calculate percent change for gasoils as well
                                   let percentChange: number | null = null;
                                   if (sparklineData.length > 1) {
                                     const first = sparklineData[0].y;
                                     const last = sparklineData[sparklineData.length - 1].y;
                                     if (first !== 0) {
                                       percentChange = ((last - first) / first) * 100;
                                     }
                                   }
                                   const percentColor = percentChange !== null ? (percentChange >= 0 ? "#10B981" : "#EF4444") : "#aaa";
                                   const percentArrow = percentChange !== null ? (percentChange > 0 ? "▲" : percentChange < 0 ? "▼" : "") : "";
                                   return (
                                     <div
                                       key={id}
                                       className={`flex items-center border-b border-[#23272f] last:border-b-0 py-3 transition-colors duration-150 hover:bg-muted rounded-xl gap-3`}
                                       style={{marginBottom: 2}}
                                     >
                                      <span className="font-medium text-foreground text-sm sm:text-base pl-2" style={{color: '#e5e7eb', width: '38%', paddingRight: 8}}>
                                        {name}
                                      </span>
                                      <div className="h-[32px] mx-2 flex items-center justify-center" style={{width: 140}}>
                                         {sparklineData && sparklineData.length > 0 ? (
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
                                         ) : (
                                           <div className="text-xs text-muted">No data</div>
                                         )}
                                       </div>
                                      <span className="text-xs sm:text-sm font-bold text-right pr-2" style={{ color: '#d1d5db', fontVariantNumeric: 'tabular-nums', width: '30%', paddingRight: 8 }}>
                                        {priceObj && priceObj.value !== undefined
                                           ? `$${priceObj.value.toLocaleString(undefined, {
                                               minimumFractionDigits: 2,
                                               maximumFractionDigits: 2,
                                             })}${getUnit(name)}`
                                           : "--"}
                                      </span>
                                      <span className="text-right pr-2 font-bold" style={{ color: percentColor, fontSize: '0.98em', fontVariantNumeric: 'tabular-nums', width: '22%' }}>
                                        {percentArrow} {percentChange !== null ? `${percentChange.toFixed(2)}%` : "--"}
                                      </span>
                                     </div>
                                   );
                                 })}
                              </div>
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
         </div>
     );
 }
