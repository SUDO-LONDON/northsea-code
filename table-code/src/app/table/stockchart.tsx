"use client";

import {
    LineChart,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

type Trade = {
    spot: string;
    price: number;
    change: number;
    chartData: { date: string; value: number }[];
};

export default function StockChart({ stock }: { stock: Trade | null }) {
    if (!stock) {
        return (
            <div className="text-gray-400 mt-4">
                Select a stock from the table to view its chart
            </div>
        );
    }

    return (
        <div className="mt-6 p-4 bg-white rounded-xl shadow">
            <h2 className="text-lg font-bold mb-2">{stock.spot} Price Chart</h2>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stock.chartData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                        formatter={(value) => [`$${value}`, "Price"]}
                        contentStyle={{ fontSize: "0.8rem" }}
                    />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#4F46E5"
                        strokeWidth={2}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
