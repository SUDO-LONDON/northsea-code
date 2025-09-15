"use client"

import Image from "next/image"
import { AreaChart, Area, ResponsiveContainer } from "recharts"

// List of products to display
const products = [
  "Rotterdam 3.5%",
  "Rotterdam 0.5%",
  "NWE 1% FOB",
  "Singapore 0.5%",
  "Singapore 380 CST",
  "USGC 3%",
  "USGC 0.5%"
]

// Generate fake sparkline data for visualization
const generateSparklineData = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    x: i,
    y: 50 + Math.random() * 20
  }))
}

export default function CSCProductsPanel() {
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
        {products.map((name) => (
          <div key={name} className="flex items-center justify-between border-b pb-2 last:border-b-0 last:pb-0">
            <span className="font-medium text-foreground text-base">{name}</span>
            <div className="w-[100px] h-[40px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={generateSparklineData()}>
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="y"
                    stroke="#10B981"
                    fillOpacity={1}
                    fill="url(#colorUv)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

