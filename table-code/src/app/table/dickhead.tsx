// src/app/table/dickhead.tsx
"use client"
import { useMemo } from "react";
import TradeTable, { generateFakeData } from "@/components/Tanstack-table";

export default function TablePage() {
    // generate once so data doesn't change every render
    const data = useMemo(() => generateFakeData(12), []);

    return (
        <div className="p-6 space-y-6">
            <TradeTable data={data} />
        </div>
    );
}
