import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface Commodity {
  name: string;
  price: string;
  prevClose: string;
}

const units: Record<string, string> = {
  "Brent Crude": "USD/bbl",
  "WTI Crude": "USD/bbl",
  "Gasoline": "USD/gal",
  "ULSD": "USD/gal",
  "Gasoil": "USD/ton",
};

export default function CommodityTickerPanel() {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          "https://olivedrab-llama-968955.hostingersite.com/wp-json/ticker/v1/commodities"
        );
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        setCommodities(data);
      } catch {
        setError("Error loading prices");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-background border-black shadow-sm">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Commodity Ticker
        </h2>
        {loading ? (
          <div className="text-muted-foreground">Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {commodities.map((item) => {
              const price = parseFloat(item.price);
              const prevClose = parseFloat(item.prevClose);
              const hasPrice = !isNaN(price);
              const hasPrevClose = !isNaN(prevClose);
              let pctChange = null;
              if (hasPrice && hasPrevClose && prevClose !== 0) {
                pctChange = ((price - prevClose) / prevClose) * 100;
              }
              const isUp = pctChange !== null && pctChange > 0;
              // Extract unit from name or fallback
              let unit = "";
              if (item.name.includes("MT")) unit = "/ MT";
              else if (item.name.toLowerCase().includes("bbbl") || item.name.toLowerCase().includes("bbl")) unit = "/ BBLS";
              else if (item.name.toLowerCase().includes("cst")) unit = "/ MT";
              else if (item.name.toLowerCase().includes("ppm")) unit = "/ BBLS";
              else if (item.name.toLowerCase().includes("gasoil")) unit = "/ MT";
              else unit = units[item.name] ? `/${units[item.name].split('/')[1]}` : "";
              return (
                <div
                  key={item.name}
                  className="flex flex-col items-start bg-background rounded-lg p-2 min-w-[150px] shadow"
                >
                  <span className="text-sm text-gray-400 mb-1">{item.name}</span>
                  <span className="text-lg font-bold text-foreground">
                    {hasPrice ? price.toFixed(2) : "--"} {unit}
                    {pctChange !== null && (
                      <span className={`ml-2 text-base ${isUp ? "text-green-400" : "text-red-400"}`}>
                        {isUp ? "▲" : "▼"} {Math.abs(pctChange).toFixed(2)}%
                      </span>
                    )}

                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
