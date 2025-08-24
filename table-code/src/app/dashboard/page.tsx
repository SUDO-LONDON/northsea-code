"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import Cookies from 'js-cookie'
import { Product } from "@/lib/products"
import { getProducts, initializeProducts } from "@/lib/productUtils"

type PriceInputs = {
  hfo: string;
  vlsfo: string;
  mgo: string;
  change: string;
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
      // Use the utility function to ensure we always have 20 products
      const loadedProducts = getProducts()
      setProducts(loadedProducts)
    } catch (error) {
      console.error("Error loading products:", error)
      // Initialize with defaults if there's an error
      const initialProducts = initializeProducts()
      setProducts(initialProducts)
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

  const handleUpdateProduct = (id: string) => {
    const prices = newPrices[id]
    if (!prices) return

    setProducts(prev => {
      const updated = prev.map(product => {
        if (product.id === id) {
          return {
            ...product,
            hfo: parseFloat(prices.hfo) || product.hfo,
            vlsfo: parseFloat(prices.vlsfo) || product.vlsfo,
            mgo: parseFloat(prices.mgo) || product.mgo,
            change: parseFloat(prices.change) || product.change,
            lastUpdated: new Date().toISOString()
          }
        }
        return product
      })
      localStorage.setItem("products", JSON.stringify(updated))
      return updated
    })

    // Clear the form
    setNewPrices(prev => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [id]: _, ...rest } = prev
      return rest
    })
  }

  const handleLogout = () => {
    Cookies.remove('adminAuth')
    router.push("/")
  }

  const handleResetProducts = () => {
    const resetProducts = initializeProducts()
    setProducts(resetProducts)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Price Management Dashboard</h1>
          <div className="flex gap-4">
            <Button onClick={handleResetProducts} variant="outline">
              Reset to 20 Products
            </Button>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>

        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Total Products:</strong> {products.length} |
            <strong> Product Names:</strong> {products.slice(0, 3).map(p => p.name).join(', ')}
            {products.length > 3 ? '...' : ''}
          </p>
        </div>

        <div className="grid gap-6">
          {products.map((product) => (
            <Card key={product.id} className="p-6">
              <h3 className="text-lg font-semibold mb-4">Product {product.id}: {product.name}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label htmlFor={`hfo-${product.id}`}>HFO (£)</Label>
                  <Input
                    id={`hfo-${product.id}`}
                    type="number"
                    step="0.01"
                    placeholder={`Current: £${product.hfo.toFixed(2)}`}
                    value={newPrices[product.id]?.hfo || ''}
                    onChange={(e) => handleValueChange(product.id, 'hfo', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor={`vlsfo-${product.id}`}>VLSFO (£)</Label>
                  <Input
                    id={`vlsfo-${product.id}`}
                    type="number"
                    step="0.01"
                    placeholder={`Current: £${product.vlsfo.toFixed(2)}`}
                    value={newPrices[product.id]?.vlsfo || ''}
                    onChange={(e) => handleValueChange(product.id, 'vlsfo', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor={`mgo-${product.id}`}>MGO (£)</Label>
                  <Input
                    id={`mgo-${product.id}`}
                    type="number"
                    step="0.01"
                    placeholder={`Current: £${product.mgo.toFixed(2)}`}
                    value={newPrices[product.id]?.mgo || ''}
                    onChange={(e) => handleValueChange(product.id, 'mgo', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor={`change-${product.id}`}>Change (%)</Label>
                  <Input
                    id={`change-${product.id}`}
                    type="number"
                    step="0.01"
                    placeholder={`Current: ${product.change.toFixed(2)}%`}
                    value={newPrices[product.id]?.change || ''}
                    onChange={(e) => handleValueChange(product.id, 'change', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Last updated: {new Date(product.lastUpdated).toLocaleString()}
                </span>
                <Button
                  onClick={() => handleUpdateProduct(product.id)}
                  disabled={!newPrices[product.id]}
                >
                  Update Prices
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
