"use client";

import React, { useEffect, useState } from "react";
import { ProductsTable } from "@/components/ProductsTable";
import { Card } from "@/components/ui/card";
import { Product } from "@/lib/products";
import { getProducts } from "@/lib/productUtils";
import ClientOnly from "@/components/ClientOnly";
import CommodityTickerPanel from "@/components/CommodityTickerPanel";
import Cookies from 'js-cookie';
import { useRouter } from "next/navigation";

const PRODUCT_ID_MAP: { [id: string]: string } = {
    "6ccbf93e-d43d-46ab-ba50-c26659add883": "M0 SING 380 FP",
    "9c68de75-aed7-417b-abab-eaf576d0d6fe": "M0 SG 10PPM FP",
    "99d27f4d-0a7e-44fe-b9de-9c27d27f08d2": "M0 0.5% GC FP",
    "d71f82b9-21e2-49f0-9974-4a11a9e5b09f": "M0 0.1% BGS",
    "29d3a405-cb03-45b4-9ebf-f0176b7ba06a": "M0 0.5% BGS FP",
    "662e5a2f-f028-4d18-81dc-89be3ba01f3a": "M0 0.5% SG FP",
    "e506264b-1bcd-429f-b018-f50e3f517133": "M0 3% GC FP",
    "e9e305ee-8605-4503-b3e2-8f5763870cd2": "M0 3.5% BGS FP",
    "b0738070-229c-4aa7-b5d0-45b4119dd0e0": "M0 1% FOB FP",
};

interface LivePrice {
    id: string;
    value: number;
}

export default function TradingPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [livePrices, setLivePrices] = useState<LivePrice[]>([]);
    const router = useRouter();
    useEffect(() => {
        // Auth check
        const isAuthenticated = Cookies.get('adminAuth');
        if (!isAuthenticated) {
            router.push("/");
            return;
        }

        const loadProducts = async () => {
            try {
                const loadedProducts = await getProducts();
                setProducts(loadedProducts);
            } catch (error) {
                console.error("Error loading products:", error);
                setProducts([]);
            }
        };

        loadProducts();
        const interval = setInterval(loadProducts, 5000);
        return () => clearInterval(interval);
    }, [router]);

    useEffect(() => {
        const fetchLivePrices = async () => {
            try {
                const res = await fetch("/api/folio-prices");
                if (!res.ok) return;
                const data = await res.json();
                setLivePrices(Array.isArray(data) ? data : []);
            } catch {
                setLivePrices([]);
            }
        };
        fetchLivePrices();
        const interval = setInterval(fetchLivePrices, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="container mx-auto p-4 sm:p-6">
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-1 sm:mb-2">
                        Trading Panel
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Real-time market data and analytics
                    </p>
                </div>

                <div className="grid gap-4 sm:gap-6 sm:grid-cols-3">
                    {/* Main table card */}
                    <Card className="bg-gray-800 border border-black shadow-sm sm:col-span-2">
                        <div className="p-4 sm:p-6">
                            <div className="mb-4 sm:mb-6">
                                <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                                    Price Overview
                                </h2>
                                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                    Current market prices for all products
                                </p>
                            </div>
                            {/* Make table horizontally scrollable */}
                            <div className="overflow-x-auto">
                                <div className="min-w-full">
                                    <ProductsTable data={products} />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* CSC Card */}
                    <ClientOnly>
                        <Card className="border shadow-sm mb-4 sm:mb-0">
                            <div className="p-4 sm:p-6 pb-3">
                                <div className="flex items-center justify-center mb-4 sm:mb-6">
                                    <img
                                        src="/csc.png"
                                        alt="Paper Trading Logo"
                                        className="block max-w-full h-auto"
                                    />
                                </div>
                                <div className="space-y-2 sm:space-y-3">
                                    {Object.entries(PRODUCT_ID_MAP).map(([id, name]) => {
                                        const priceObj = livePrices.find((p) => p.id === id);
                                        return (
                                            <div
                                                key={id}
                                                className="flex flex-col border-b pb-2 last:border-b-0 last:pb-0"
                                            >
                        <span className="font-medium text-foreground text-sm sm:text-base">
                          {name}
                        </span>
                                                <span className="text-base sm:text-lg font-bold text-primary">
                          {priceObj && priceObj.value !== undefined
                              ? `£${priceObj.value.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                              })}`
                              : "--"}
                        </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Commodity Ticker Panel */}
                            <div className="border-t border-gray-700">
                                <CommodityTickerPanel />
                            </div>
                        </Card>
                    </ClientOnly>
                </div>
            </div>
        </div>
    );
}
