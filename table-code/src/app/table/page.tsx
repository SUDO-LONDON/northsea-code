"use client";

import React, { useEffect, useState } from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

const formatCurrency = (num) =>
    new Intl.NumberFormat("en-UK", {
        style: "currency",
        currency: "GBP",
        maximumFractionDigits: 2
    }).format(num);

export default function CryptoTable() {
    const [coins, setCoins] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch(
                "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=true"
            );
            const data = await res.json();
            setCoins(data);
        };
        fetchData();
    }, []);

    return (
        <div className="bg-[#0d0b1f] min-h-screen p-6 text-white">
            <h1 className="text-4xl font-bold text-center mb-8">Bunker Prices</h1>

            <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                    <tr className="bg-[#1c1b2d] text-gray-400">
                        <th className="py-3 px-4 text-left">#</th>
                        <th className="py-3 px-4 text-left">Name</th>
                        <th className="py-3 px-4 text-left">Price</th>
                        <th className="py-3 px-4 text-left">24 Hour Average</th>
                        <th className="py-3 px-4 text-left">Last 7 Days</th>
                    </tr>
                    </thead>
                    <tbody>
                    {coins.map((coin, idx) => (
                        <tr key={coin.id} className="border-b border-gray-800 hover:bg-[#1a182b]">
                            <td className="py-3 px-4">{idx + 1}</td>
                            <td className="py-3 px-4 flex items-center gap-2">
                                <img src={coin.image} alt={coin.name} className="w-6 h-6" />
                                <span>{coin.name}</span>
                                <span className="text-gray-400 text-sm uppercase">{coin.symbol}</span>
                            </td>
                            <td className="py-3 px-4">{formatCurrency(coin.market_cap)}</td>
                            <td className="py-3 px-4">
                                {coin.price_change_percentage_24h?.toFixed(2)}%
                            </td>
                            <td className="py-3 px-4 w-32 h-12">
                                <ResponsiveContainer width="100%" height={40}>
                                    <AreaChart data={coin.sparkline_in_7d.price.map((p, i) => ({ x: i, y: p }))}>
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
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <div className="grid gap-4 md:hidden">
                {coins.map((coin, idx) => (
                    <div key={coin.id} className="bg-[#1c1b2d] rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-gray-400">{idx + 1}</span>
                            <img src={coin.image} alt={coin.name} className="w-6 h-6" />
                            <span className="font-semibold">{coin.name}</span>
                            <span className="text-gray-400 text-sm uppercase">{coin.symbol}</span>
                        </div>
                        <p><span className="text-gray-400">Price:</span> {formatCurrency(coin.market_cap)}</p>
                        <p className={`mt-1 font-semibold ${
                            coin.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"
                        }`}>
                            24h Change: {coin.price_change_percentage_24h?.toFixed(2) ?? "N/A"}%
                        </p>

                        <ResponsiveContainer width="100%" height={60}>
                            <AreaChart data={coin.sparkline_in_7d.price.map((p, i) => ({ x: i, y: p }))}>
                                <defs>
                                    <linearGradient id="colorUvMobile" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.6}/>
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <Area
                                    type="monotone"
                                    dataKey="y"
                                    stroke="#10B981"
                                    fillOpacity={1}
                                    fill="url(#colorUvMobile)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                ))}
            </div>
        </div>
    );
}
