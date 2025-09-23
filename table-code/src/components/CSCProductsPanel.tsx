"use client"

import Image from "next/image"
import { AreaChart, Area, ResponsiveContainer } from "recharts"
import React, { useEffect, useState } from "react"

// Map old product names to new product IDs
const PRODUCT_NAME_ID_MAP: { name: string; id: string }[] = [
  { name: "Rotterdam 3.5%", id: "e9e305ee-8605-4503-b3e2-8f5763870cd2" },
  { name: "Rotterdam 0.5%", id: "99d27f4d-0a7e-44fe-b9de-9c27d27f08d2" },
  { name: "NWE 1% FOB", id: "b0738070-229c-4aa7-b5d0-45b4119dd0e0" },
  { name: "Singapore 0.5%", id: "662e5a2f-f028-4d18-81dc-89be3ba01f3a" },
  { name: "Singapore 380 CST", id: "6ccbf93e-d43d-46ab-ba50-c26659add883" },
  { name: "USGC 3%", id: "e506264b-1bcd-429f-b018-f50e3f517133" },
  { name: "USGC 0.5%", id: "29d3a405-cb03-45b4-9ebf-f0176b7ba06a" }
];

// Generate fake sparkline data for visualization
const generateSparklineData = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    x: i,
    y: 50 + Math.random() * 20
  }))
}

type CSCPanelHistoryEntry = { product_id: string; value: number; recorded_at: string };

// Helper to fetch latest prices from folio API
async function fetchLatestFolioPrices(): Promise<Record<string, number>> {
  try {
    const res = await fetch("/api/folio-prices"); // You must have an API route that proxies to the folio API
    if (!res.ok) throw new Error("Failed to fetch folio prices");
    const data = await res.json();
    // Assume data is an object: { [product_id]: price, ... }
    return data;
  } catch {
    return {};
  }
}

export default function CSCProductsPanel() {
  const [series, setSeries] = useState<Record<string, { x: string; y: number }[]>>({});
  const [latest, setLatest] = useState<Record<string, number>>({});
  const [previous, setPrevious] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch chart data (if you want to keep the chart, otherwise remove this block)
  useEffect(() => {
    async function fetchChart() {
      try {
        const res = await fetch("/api/csc-memory-history");
        if (!res.ok) throw new Error("Failed to fetch CSC memory history");
        const data: { timestamp: string; prices: Record<string, number> }[] = await res.json();
        const out: Record<string, { x: string; y: number }[]> = {};
        PRODUCT_NAME_ID_MAP.forEach(({ id }) => { out[id] = []; });
        data.forEach(entry => {
          PRODUCT_NAME_ID_MAP.forEach(({ id }) => {
            if (entry.prices && entry.prices[id] !== undefined) {
              out[id].push({ x: entry.timestamp, y: entry.prices[id] });
            }
          });
        });
        setSeries(out);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Unknown error");
      }
    }
    fetchChart();
  }, []);

  // Poll folio API for latest prices and compare to previous
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let mounted = true;
    async function pollFolio() {
      try {
        const newPrices = await fetchLatestFolioPrices();
        setPrevious(prev => {
          // Store the previous latest before updating
          return { ...latest };
        });
        setLatest(newPrices);
      } catch (e) {
        // ignore
      }
    }
    pollFolio();
    interval = setInterval(pollFolio, 15000); // 15 seconds
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [latest]);

  return (
    <div className="rounded-xl overflow-hidden border bg-card p-4 sm:p-6 w-full">
      <div className="flex flex-col items-center mb-6">
        <Image
          src="/csc.png"
          alt="CSC Panel Logo"
          width={120}
          height={120}
          className="mb-2"
          style={{ filter: 'invert(1)' }}
        />
        <h2 className="text-lg font-semibold text-foreground">CSC Commodities</h2>
      </div>
      <div className="space-y-4">
        {PRODUCT_NAME_ID_MAP.map(({ name, id }) => {
          const value = latest[id];
          const prev = previous[id];
          let color = "text-foreground";
          if (value !== undefined && prev !== undefined) {
            if (value > prev) color = "text-green-600";
            else if (value < prev) color = "text-red-600";
          }
          return (
            <div key={id} className="flex items-center justify-between border-b pb-2 last:border-b-0 last:pb-0">
              <span className="font-medium text-foreground text-base">{name}</span>
              <span className={`ml-2 text-sm ${color}`}>
                {value !== undefined ? value : <span className="text-muted">--</span>}
              </span>
              <div className="w-[100px] h-[40px]">
                {series[id]?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={series[id]}>
                      <defs>
                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="y" stroke="#10B981" fillOpacity={1} fill="url(#colorUv)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-xs text-muted">No data</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {loading && <div className="text-center text-muted">Loading...</div>}
      {error && <div className="text-center text-red-500">{error}</div>}
    </div>
  );
}
