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
import Image from 'next/image';
import { supabase } from "@/lib/supabaseClient";

const PRODUCT_ID_MAP: { [id: string]: string } = {
    "e9e305ee-8605-4503-b3e2-8f5763870cd2": "MO 3.5% BGS FP- Rotterdam 3.5%",
    "29d3a405-cb03-45b4-9ebf-f0176b7ba06a": "MO 0.5% BGS FP- Rotterdam 0.5%",
    "b0738070-229c-4aa7-b5d0-45b4119dd0e0": "MO 1% FOB FP- NWE 1% FOB",
    "662e5a2f-f028-4d18-81dc-89be3ba01f3a": "MO 0.5% SG- Singapore 0.5%",
    "6ccbf93e-d43d-46ab-ba50-c26659add883": "MO Sing 380 FP- Singapore 380 CST",
    "e506264b-1bcd-429f-b018-f50e3f517133": "MO 3% GC FP- USGC 3%",
    "99d27f4d-0a7e-44fe-b9de-9c27d27f08d2": "MO 0.5% GC FP- USGC 0.5%",
    "9c68de75-aed7-417b-abab-eaf576d0d6fe": "M0 SG 10PPM FP",
    "d71f82b9-21e2-49f0-9974-4a11a9e5b09f": "M0 0.1% BGS",
};

// Split product IDs for display
const PRODUCT_IDS = Object.keys(PRODUCT_ID_MAP);
const CSC_COMMODITIES_IDS = PRODUCT_IDS.slice(0, 7);
const GASOIL_IDS = PRODUCT_IDS.slice(-2);

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
            }
        };

        loadProducts();

        // Subscribe to real-time changes in products table
        const subscription = supabase
            .channel('products-changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'products',
            }, (_) => {
                // Re-fetch products on any change
                loadProducts()
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
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
        <div className="bg-background min-h-screen text-white">
            <div className="container mx-auto p-4 sm:p-6">
                <div className="mb-6 sm:mb-8">
                    <div className="flex items-center mb-1 sm:mb-2">
                        <Image
                            src="/logo.png"
                            alt="Trading Panel Logo"
                            width={280}
                            height={280}
                            priority
                        />
                    </div>

                </div>

                <div className="grid gap-4 sm:gap-6 sm:grid-cols-3">
                    {/* Main table card */}
                    <Card className="bg-background border border-black shadow-sm sm:col-span-2">
                        <div className="p-4 sm:p-6">
                            <div className="mb-4 sm:mb-6">
                                <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                                    Bunker Prices
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
                                    <Image
                                        src="/csc.png"
                                        alt="Paper Trading Logo"
                                        width={200}
                                        height={200}
                                        className="block max-w-full h-auto"
                                        style={{ filter: 'invert(1)' }}
                                    />
                                </div>
                                <div className="space-y-2 sm:space-y-3">
                                    {CSC_COMMODITIES_IDS.map((id) => {
                                        const name = PRODUCT_ID_MAP[id];
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
                                                        ? `$${priceObj.value.toLocaleString(undefined, {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })}`
                                                        : "--"}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    {/* Gasoils Section */}
                                    <h3 className="font-semibold text-base sm:text-lg mt-4 mb-2">Gasoils:</h3>
                                    {GASOIL_IDS.map((id) => {
                                        const name = PRODUCT_ID_MAP[id];
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
                                                        ? `$${priceObj.value.toLocaleString(undefined, {
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
