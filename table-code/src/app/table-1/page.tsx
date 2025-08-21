"use client"
import {useMemo, useState} from "react";
import TradeTable, {Trade, generateFakeData} from "@/components/Tanstack-table";
import StockChart1 from "@/app/table-1/stockchart1";


export default function TablePage() {
    // generate once so data doesn't change every render
    const data = useMemo(() => generateFakeData(12), []);
    const [selectedStock, setSelectedStock] = useState<Trade | null>(null);

    return (
        <div className="p-6 space-y-6">
            <TradeTable
                data={data}
                onSelect={(row) => setSelectedStock(row)}
            />

            <StockChart1 stock={selectedStock} />
        </div>
    );
}