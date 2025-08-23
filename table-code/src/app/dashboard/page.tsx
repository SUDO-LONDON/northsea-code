"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import Cookies from 'js-cookie'
import { Product, PRODUCTS } from "@/lib/products"

type PriceInputs = {
  hfo: string;
  vlsfo: string;
  mgo: string;
  change: string;
};

const DEFAULT_PRODUCT = {
  hfo: 0,
  vlsfo: 0,
  mgo: 0,
  change: 0
};

export default function Dashboard() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [newPrices, setNewPrices] = useState<Record<string, PriceInputs>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const isAuthenticated = Cookies.get('adminAuth')
    if (!isAuthenticated) {
      router.push("/admin-login")
      return
    }

    try {
      const savedProducts = localStorage.getItem("products")
      if (savedProducts) {
        const parsed = JSON.parse(savedProducts)
        // Ensure all products have the required fields
        const validatedProducts = parsed.map((product: any) => ({
          ...DEFAULT_PRODUCT,
          ...product,
          lastUpdated: product.lastUpdated || new Date().toISOString()
        }))
        setProducts(validatedProducts)
      } else {
        // Initialize with default products
        const initialProducts = Array.from({ length: 20 }, (_, i) => ({
          id: (i + 1).toString(),
          name: "blank",
          ...DEFAULT_PRODUCT,
          lastUpdated: new Date().toISOString()
        }))
        setProducts(initialProducts)
        localStorage.setItem("products", JSON.stringify(initialProducts))
      }
    } catch (error) {
      console.error("Error loading products:", error)
      // Initialize with defaults if there's an error
      const initialProducts = Array.from({ length: 20 }, (_, i) => ({
        id: (i + 1).toString(),
        name: "blank",
        ...DEFAULT_PRODUCT,
        lastUpdated: new Date().toISOString()
      }))
      setProducts(initialProducts)
      localStorage.setItem("products", JSON.stringify(initialProducts))
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const handleValueChange = (id: string, field: keyof PriceInputs, value: string) => {
    setNewPrices(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || { hfo: '', vlsfo: '', mgo: '', change: '' }),
        [field]: value
      }
    }))
  }

  const handleUpdatePrices = () => {
    try {
      const currentTime = new Date().toISOString()
      const updatedProducts = products.map(product => {
        const newValues = newPrices[product.id]
        if (!newValues) return product

        return {
          ...product,
          hfo: newValues.hfo ? parseFloat(newValues.hfo) : product.hfo || 0,
          vlsfo: newValues.vlsfo ? parseFloat(newValues.vlsfo) : product.vlsfo || 0,
          mgo: newValues.mgo ? parseFloat(newValues.mgo) : product.mgo || 0,
          change: newValues.change ? parseFloat(newValues.change) : product.change || 0,
          lastUpdated: (newValues.hfo || newValues.vlsfo || newValues.mgo || newValues.change)
            ? currentTime
            : product.lastUpdated
        }
      })

      localStorage.setItem("products", JSON.stringify(updatedProducts))
      setProducts(updatedProducts)
      setNewPrices({})
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

  if (isLoading) {
    return (
      <div className="p-8">
        <Card className="p-6">
          <div className="text-center">Loading...</div>
        </Card>
      </div>
    )
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
            <div key={product.id} className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium w-24">Product {product.id}</Label>
                <span className="text-xs text-gray-500">
                  Last updated: {new Date(product.lastUpdated).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm">HFO (Current: £{(product.hfo || 0).toFixed(2)})</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="New HFO"
                    value={newPrices[product.id]?.hfo || ""}
                    onChange={(e) => handleValueChange(product.id, 'hfo', e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-sm">VLSFO (Current: £{(product.vlsfo || 0).toFixed(2)})</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="New VLSFO"
                    value={newPrices[product.id]?.vlsfo || ""}
                    onChange={(e) => handleValueChange(product.id, 'vlsfo', e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-sm">MGO (Current: £{(product.mgo || 0).toFixed(2)})</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="New MGO"
                    value={newPrices[product.id]?.mgo || ""}
                    onChange={(e) => handleValueChange(product.id, 'mgo', e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-sm">Change % (Current: {(product.change || 0).toFixed(2)}%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="New Change %"
                    value={newPrices[product.id]?.change || ""}
                    onChange={(e) => handleValueChange(product.id, 'change', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            className="w-full mt-6"
            onClick={handleUpdatePrices}
          >
            Update All Prices
          </Button>
        </div>
      </Card>
    </div>
  )
}
