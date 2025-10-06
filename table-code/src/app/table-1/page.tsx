"use client"

import { useMemo } from "react"
import TradeTable, { generateFakeData } from "@/components/Tanstack-table"

export default function TablePage() {
  const data = useMemo(() => generateFakeData(12), [])

  return (
    <div className="bg-background min-h-screen p-6 space-y-6">
      <TradeTable data={data} />
    </div>
  )
}