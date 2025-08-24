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

    // Use setTimeout to ensure this runs after hydration
    setTimeout(() => {
      try {
        const loadedProducts = getProducts()
        setProducts(loadedProducts)
      } catch (error) {
        console.error("Error loading products:", error)
        const initialProducts = initializeProducts()
        setProducts(initialProducts)
      } finally {
        setIsLoading(false)
      }
    }, 0)
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
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage product prices and settings
              </p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={handleResetProducts}>
                Reset to 20 Products
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <Card className="border shadow-sm">
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Quick Stats
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Current product overview
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted border">
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold text-foreground">
                    {products.length}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted border">
                  <p className="text-sm text-muted-foreground">Product Names</p>
                  <p className="text-sm text-foreground">
                    {products.slice(0, 3).map(p => p.name).join(', ')}
                    {products.length > 3 ? '...' : ''}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {products.map((product) => (
            <Card key={product.id} className="border shadow-sm">
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    Product {product.id}: {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Last updated: {new Date(product.lastUpdated).toLocaleString()}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="grid gap-1">
                    <Label htmlFor={`hfo-${product.id}`} className="text-foreground">
                      HFO (£)
                    </Label>
                    <Input
                      id={`hfo-${product.id}`}
                      type="number"
                      step="0.01"
                      placeholder={`Current: £${product.hfo.toFixed(2)}`}
                      value={newPrices[product.id]?.hfo || ''}
                      onChange={(e) => handleValueChange(product.id, 'hfo', e.target.value)}
                    />
                  </div>

                  <div className="grid gap-1">
                    <Label htmlFor={`vlsfo-${product.id}`} className="text-foreground">
                      VLSFO (£)
                    </Label>
                    <Input
                      id={`vlsfo-${product.id}`}
                      type="number"
                      step="0.01"
                      placeholder={`Current: £${product.vlsfo.toFixed(2)}`}
                      value={newPrices[product.id]?.vlsfo || ''}
                      onChange={(e) => handleValueChange(product.id, 'vlsfo', e.target.value)}
                    />
                  </div>

                  <div className="grid gap-1">
                    <Label htmlFor={`mgo-${product.id}`} className="text-foreground">
                      MGO (£)
                    </Label>
                    <Input
                      id={`mgo-${product.id}`}
                      type="number"
                      step="0.01"
                      placeholder={`Current: £${product.mgo.toFixed(2)}`}
                      value={newPrices[product.id]?.mgo || ''}
                      onChange={(e) => handleValueChange(product.id, 'mgo', e.target.value)}
                    />
                  </div>

                  <div className="grid gap-1">
                    <Label htmlFor={`change-${product.id}`} className="text-foreground">
                      Change (%)
                    </Label>
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

                <div className="flex justify-end">
                  <Button
                    onClick={() => handleUpdateProduct(product.id)}
                    disabled={!newPrices[product.id]}
                  >
                    Update Prices
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
