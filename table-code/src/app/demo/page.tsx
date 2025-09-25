"use client";

import React from "react";
import { ProductsTable } from "@/components/ProductsTable";
import { Card } from "@/components/ui/card";
import { Product } from "@/lib/products";

// Sample data for demonstration
const sampleProducts: Product[] = [
  {
    id: "1",
    name: "Rotterdam",
    hfo: 450.25,
    vlsfo: 520.75,
    mgo: 680.50,
    change: 2.5,
    lastupdated: new Date().toISOString(),
    history: [445, 448, 452, 450, 455, 448, 450]
  },
  {
    id: "2",
    name: "Singapore",
    hfo: 465.00,
    vlsfo: 535.25,
    mgo: 695.75,
    change: -1.2,
    lastupdated: new Date().toISOString(),
    history: [470, 468, 465, 467, 465, 463, 465]
  },
  {
    id: "3",
    name: "USGC 3%",
    hfo: 428.90,
    vlsfo: 498.30,
    mgo: 625.80,
    change: 0.8,
    lastupdated: new Date().toISOString(),
    history: [425, 426, 428, 430, 429, 427, 429]
  }
];

export default function DemoPage() {
  return (
    <div className="bg-background min-h-screen text-white">
      <div className="container mx-auto p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Download Feature Demo
          </h1>
          <p className="text-muted-foreground">
            This page demonstrates the CSV download functionality with sample bunker price data.
          </p>
        </div>

        <Card className="bg-background border border-white shadow-sm">
          <div className="p-4 sm:p-6">
            <div className="mb-4">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Sample bunker pricing data - Click the "Download CSV" button to export this data.
              </p>
            </div>
            <ProductsTable data={sampleProducts} />
          </div>
        </Card>
      </div>
    </div>
  );
}