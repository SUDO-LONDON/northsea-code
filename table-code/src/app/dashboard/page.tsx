"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import Cookies from 'js-cookie'
import { Product, PRODUCTS } from "@/lib/products"

export default function Dashboard() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [newPrices, setNewPrices] = useState<Record<string, string>>({})

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = Cookies.get('adminAuth')
    if (!isAuthenticated) {
      router.push("/admin-login")
      return
    }

    // Load existing products or initialize with defaults
    const savedProducts = localStorage.getItem("products")
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts))
    } else {
      const initialProducts = PRODUCTS.map(product => ({
        ...product,
        lastUpdated: new Date().toISOString()
      }))
      setProducts(initialProducts)
      localStorage.setItem("products", JSON.stringify(initialProducts))
    }
  }, [router])

  const handlePriceChange = (id: string, value: string) => {
    setNewPrices(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handleUpdatePrices = () => {
    try {
      const currentTime = new Date().toISOString()
      const updatedProducts = products.map(product => ({
        ...product,
        price: newPrices[product.id] ? parseFloat(newPrices[product.id]) : product.price,
        lastUpdated: newPrices[product.id] ? currentTime : product.lastUpdated
      }))

      localStorage.setItem("products", JSON.stringify(updatedProducts))
      setProducts(updatedProducts)
      setNewPrices({}) // Clear input fields
      alert("Prices updated successfully!")
    } catch (error) {
      console.error("Error updating prices:", error)
      alert("Failed to update prices. Please try again.")
    }
  }

  const handleLogout = () => {
    Cookies.remove('adminAuth')
    router.push("/admin-login")
  }

  return (
    <div className="p-8">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Price Management Dashboard</h1>
          <Button
            variant="outline"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>

        <div className="space-y-4">
          {products.map(product => (
            <div key={product.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-1/3">
                <Label className="text-sm font-medium">{product.name}</Label>
              </div>
              <div className="w-1/3">
                <Label className="text-sm">
                  Current Price: ${product.price.toFixed(2)}
                  <br />
                  <span className="text-xs text-gray-500">
                    Last updated: {new Date(product.lastUpdated).toLocaleString()}
                  </span>
                </Label>
              </div>
              <div className="w-1/3">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="New Price"
                  value={newPrices[product.id] || ""}
                  onChange={(e) => handlePriceChange(product.id, e.target.value)}
                />
              </div>
            </div>
          ))}

          <Button
            className="w-full mt-6"
            onClick={handleUpdatePrices}
          >
            Update Prices
          </Button>
        </div>
      </Card>
    </div>
  )
}
