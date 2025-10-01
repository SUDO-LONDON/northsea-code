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
              if (!price || !prevClose) return null;
              const isUp = price > prevClose;
              const unit = units[item.name] || "";
              return (
                <div
                  key={item.name}
                  className="flex flex-col items-start bg-background rounded-lg p-2 min-w-[150px] shadow"
                >
                  <span className="text-xs text-gray-400 mb-1">{item.name}</span>
                  <span className={`text-base font-bold ${isUp ? "text-green-400" : "text-red-400"}`}>
                    ${price.toFixed(2)}
                    <span className="ml-1 text-sm">
                      {isUp ? "▲" : "▼"}
                    </span>
                  </span>
                  <span className="text-xs text-gray-500 mt-1">{unit}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
