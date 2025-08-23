"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Trade } from "@/components/Tanstack-table"

export default function Dashboard() {
  const router = useRouter()
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [trades, setTrades] = useState<Trade[]>([])

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = sessionStorage.getItem("isAdminAuthenticated")
    if (!isAuthenticated) {
      router.push("/admin-login")
    }

    // Load existing trades
    // In a real application, this would come from your database
    const loadedTrades = JSON.parse(localStorage.getItem("trades") || "[]")
    setTrades(loadedTrades)
  }, [router])

  const handlePriceChange = (id: string, value: string) => {
    setPrices(prev => ({
      ...prev,
      [id]: parseFloat(value) || 0
    }))
  }

  const handleUpdatePrices = () => {
    const updatedTrades = trades.map(trade => ({
      ...trade,
      price: prices[trade.id] || trade.price
    }))

    // In a real application, this would be an API call
    localStorage.setItem("trades", JSON.stringify(updatedTrades))
    setTrades(updatedTrades)
    alert("Prices updated successfully!")
  }

  return (
    <div className="p-8">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Price Management Dashboard</h1>
          <Button
            variant="outline"
            onClick={() => {
              sessionStorage.removeItem("isAdminAuthenticated")
              router.push("/admin-login")
            }}
          >
            Logout
          </Button>
        </div>

        <div className="space-y-4">
          {trades.map(trade => (
            <div key={trade.id} className="flex items-center gap-4">
              <div className="w-1/3">
                <Label>{trade.name}</Label>
              </div>
              <div className="w-1/3">
                <Label>Current Price: ${trade.price}</Label>
              </div>
              <div className="w-1/3">
                <Input
                  type="number"
                  placeholder="New Price"
                  value={prices[trade.id] || ""}
                  onChange={(e) => handlePriceChange(trade.id, e.target.value)}
                />
              </div>
            </div>
          ))}

          <Button
            className="w-full mt-4"
            onClick={handleUpdatePrices}
          >
            Update Prices
          </Button>
        </div>
      </Card>
    </div>
  )
}
