"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import Cookies from "js-cookie"
import { Product } from "@/lib/products"
import { getProducts, updateProduct, resetProductsPrices } from "@/lib/productUtils"

type PriceInputs = {
    hfo: string
    vlsfo: string
    mgo: string
}

export default function Dashboard() {
    const router = useRouter()
    const [products, setProducts] = useState<Product[]>([])
    const [newPrices, setNewPrices] = useState<Record<string, PriceInputs>>({})
    const [isLoading, setIsLoading] = useState(true)
    const [updateLoading, setUpdateLoading] = useState<Record<string, boolean>>({})

    useEffect(() => {
        const isAuthenticated = Cookies.get("adminAuth")
        if (!isAuthenticated) {
            router.push("/admin-login")
            return
        }

        const loadProducts = async () => {
            try {
                const loadedProducts = await getProducts()
                setProducts(loadedProducts)
            } catch (error) {
                console.error("Error loading products:", error)
            } finally {
                setIsLoading(false)
            }
        }

        loadProducts()
    }, [router])

    const handleValueChange = (id: string, field: keyof PriceInputs, value: string) => {
        setNewPrices((prev) => ({
            ...prev,
            [id]: {
                ...(prev[id] || { hfo: "", vlsfo: "", mgo: "" }),
                [field]: value,
            },
        }))
    }

    const computePercentageChange = (product: Product, inputs?: PriceInputs) => {
        const newHfo =
            inputs && typeof inputs.hfo === "string" && inputs.hfo.trim() !== ""
                ? parseFloat(inputs.hfo)
                : product.hfo

        const newVlsfo =
            inputs && typeof inputs.vlsfo === "string" && inputs.vlsfo.trim() !== ""
                ? parseFloat(inputs.vlsfo)
                : product.vlsfo

        const newMgo =
            inputs && typeof inputs.mgo === "string" && inputs.mgo.trim() !== ""
                ? parseFloat(inputs.mgo)
                : product.mgo

        const oldAvg = (product.hfo + product.vlsfo + product.mgo) / 3
        const newAvg = (newHfo + newVlsfo + newMgo) / 3

        if (!isFinite(oldAvg) || oldAvg === 0) return 0
        return Number((((newAvg - oldAvg) / oldAvg) * 100).toFixed(2))
    }


    const handleUpdateProduct = async (id: string) => {
        const prices = newPrices[id]
        if (!prices) return

        setUpdateLoading((prev) => ({ ...prev, [id]: true }))

        try {
            const product = products.find((p) => p.id === id)
            if (!product) return

            const newHfo = prices.hfo?.trim() !== "" ? parseFloat(prices.hfo) : product.hfo
            const newVlsfo =
                prices.vlsfo?.trim() !== "" ? parseFloat(prices.vlsfo) : product.vlsfo
            const newMgo = prices.mgo?.trim() !== "" ? parseFloat(prices.mgo) : product.mgo

            const oldAvg = (product.hfo + product.vlsfo + product.mgo) / 3
            const newAvg = (newHfo + newVlsfo + newMgo) / 3
            const percentageChange = oldAvg > 0 ? ((newAvg - oldAvg) / oldAvg) * 100 : 0

            const updatedProduct = {
                ...product,
                hfo: newHfo,
                vlsfo: newVlsfo,
                mgo: newMgo,
                change: Number(percentageChange.toFixed(2)),
                lastUpdated: new Date().toISOString(),
            }

            const success = await updateProduct(updatedProduct)
            if (success) {
                setProducts((prev) => prev.map((p) => (p.id === id ? updatedProduct : p)))
                setNewPrices((prev) => {
                    const { [id]: _, ...rest } = prev
                    return rest
                })
            } else {
                alert("Failed to update product. Please try again.")
            }
        } catch (error) {
            console.error("Error updating product:", error)
            alert("Error updating product. Please try again.")
        } finally {
            setUpdateLoading((prev) => ({ ...prev, [id]: false }))
        }
    }

    const handleLogout = () => {
        Cookies.remove("adminAuth")
        router.push("/")
    }

    const handleResetProducts = async () => {
        setIsLoading(true)
        try {
            // ✅ Just reuse your API init
            const resetProducts = await initializeProducts()
            setProducts(resetProducts)
            setNewPrices({})
        } catch (error) {
            console.error("Error resetting products:", error)
            alert("Error resetting products. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }


    if (isLoading) {
        return (
            <div className="bg-background flex min-h-screen items-center justify-center">
                <div className="text-foreground">Loading...</div>
            </div>
        )
    }

    return (
        <div className="bg-gray-900 min-h-screen text-white">
            <div className="container mx-auto p-6">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 text-[#65bd7d]">Admin Dashboard</h1>
                        <p className="text-gray-300">Manage product prices and settings</p>
                    </div>
                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            onClick={handleResetProducts}
                            className="border-black text-[#65bd7d] hover:bg-[#65bd7d] hover:text-black"
                        >
                            Reset Prices
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleLogout}
                            className="border-black text-[#65bd7d] hover:bg-[#65bd7d] hover:text-black"
                        >
                            Logout
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6">
                    {products.map((product) => {
                        const inputs = newPrices[product.id]
                        const previewChange = computePercentageChange(product, inputs)

                        return (
                            <Card
                                key={product.id}
                                className="bg-gray-800 border border-black text-white shadow-sm"
                            >
                                <div className="p-6">
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-foreground">
                                            Product {product.id}: {product.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Last updated:{" "}
                                            {new Date(product.lastUpdated).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                        <div className="grid gap-1">
                                            <Label htmlFor={`hfo-${product.id}`} className="text-foreground">
                                                HFO ($)
                                            </Label>
                                            <Input
                                                id={`hfo-${product.id}`}
                                                type="number"
                                                step="0.01"
                                                placeholder={`Current: $${product.hfo.toFixed(2)}`}
                                                value={newPrices[product.id]?.hfo || ""}
                                                onChange={(e) =>
                                                    handleValueChange(product.id, "hfo", e.target.value)
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-1">
                                            <Label htmlFor={`vlsfo-${product.id}`} className="text-foreground">
                                                VLSFO ($)
                                            </Label>
                                            <Input
                                                id={`vlsfo-${product.id}`}
                                                type="number"
                                                step="0.01"
                                                placeholder={`Current: $${product.vlsfo.toFixed(2)}`}
                                                value={newPrices[product.id]?.vlsfo || ""}
                                                onChange={(e) =>
                                                    handleValueChange(product.id, "vlsfo", e.target.value)
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-1">
                                            <Label htmlFor={`mgo-${product.id}`} className="text-foreground">
                                                MGO ($)
                                            </Label>
                                            <Input
                                                id={`mgo-${product.id}`}
                                                type="number"
                                                step="0.01"
                                                placeholder={`Current: $${product.mgo.toFixed(2)}`}
                                                value={newPrices[product.id]?.mgo || ""}
                                                onChange={(e) =>
                                                    handleValueChange(product.id, "mgo", e.target.value)
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-1">
                                            <Label className="text-foreground">Change (%)</Label>
                                            <div className="flex flex-col">
                                                <div className="text-sm text-muted-foreground">
                                                    Preview:{" "}
                                                    <span
                                                        className={`font-medium ${
                                                            previewChange > 0
                                                                ? "text-green-400"
                                                                : previewChange < 0
                                                                    ? "text-red-400"
                                                                    : "text-gray-300"
                                                        }`}
                                                    >
                            {previewChange > 0
                                ? `+${previewChange}%`
                                : `${previewChange}%`}
                          </span>
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    Current: {product.change.toFixed(2)}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            onClick={() => handleUpdateProduct(product.id)}
                                            disabled={!newPrices[product.id] || updateLoading[product.id]}
                                            className="bg-[#65bd7d] text-black hover:bg-[#57a76e]"
                                        >
                                            {updateLoading[product.id] ? "Updating..." : "Update Prices"}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
