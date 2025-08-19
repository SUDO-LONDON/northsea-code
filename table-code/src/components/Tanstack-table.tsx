"use client";

import { useState, useEffect, useRef } from "react";
import {
    useReactTable,
    createColumnHelper,
    getCoreRowModel,
    flexRender,
    SortingState,
    getSortedRowModel,
} from "@tanstack/react-table";
import { ArrowUp, ArrowDown } from "lucide-react"; // icons
import { LineChart, Line, ResponsiveContainer } from "recharts";

// --- Types ---
type Trade = {
    spot: string;
    price: number;
    change: number;
    sparkline: number[];
};

// --- Column Helper ---
const columnHelper = createColumnHelper<Trade>();

const columns = [
    columnHelper.accessor("spot", {
        header: "Spot",
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("price", {
        header: "Price",
        cell: (info) => `$${info.getValue().toFixed(2)}`,
    }),
    columnHelper.accessor("change", {
        header: "Change",
        cell: (info) => {
            const val = info.getValue();
            const color = val >= 0 ? "text-green-500" : "text-red-500";
            return <span className={color}>{val.toFixed(2)}%</span>;
        },
    }),
    columnHelper.accessor("sparkline", {
        header: "7d",
        cell: (info) => <Sparkline data={info.getValue()} />,
    }),
];

// --- Sparkline Component ---
function Sparkline({ data }: { data: number[] }) {
    const [sparkData, setSparkData] = useState(
        data.map((price) => ({ price }))
    );

    const lastPriceRef = useRef(data[data.length - 1]);

    useEffect(() => {
        const interval = setInterval(() => {
            setSparkData((prev) => {
                const newPrice =
                    lastPriceRef.current * (1 + (Math.random() - 0.5) * 0.01); // random walk
                lastPriceRef.current = newPrice;
                const newData = [...prev, { price: newPrice }];
                if (newData.length > 20) newData.shift();
                return newData;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <ResponsiveContainer width={100} height={40}>
            <LineChart data={sparkData}>
                <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#4ade80"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={true}
                    animationDuration={800}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

// --- Fake Data ---
function generateFakeData(): Trade[] {
    const spots = ["AAPL", "GOOG", "TSLA", "AMZN", "MSFT", "NFLX", "FB"];
    return spots.map((spot) => {
        const price = Math.random() * 1000 + 100;
        const change = (Math.random() - 0.5) * 10;
        const sparkline = Array.from({ length: 20 }, () => price * (1 + (Math.random() - 0.5) * 0.05));
        return { spot, price, change, sparkline };
    });
}

// --- Main Table Component ---
export default function TradeTable({ data }: { data: Trade[] }) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
    const [currentPageData, setCurrentPageData] = useState<Trade[]>([]);

    const totalPages = Math.ceil(data.length / pagination.pageSize);

    // Update current page slice
    useEffect(() => {
        const start = pagination.pageIndex * pagination.pageSize;
        const end = start + pagination.pageSize;
        setCurrentPageData(data.slice(start, end));
    }, [data, pagination]);

    const table = useReactTable({
        data: currentPageData,
        columns,
        state: { sorting, pagination },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: true,
        pageCount: totalPages,
    });

    const renderSortIcon = (sorted: string | false) => {
        if (!sorted) return null;
        return sorted === "asc" ? (
            <ArrowUp className="inline w-4 h-4 ml-1" />
        ) : (
            <ArrowDown className="inline w-4 h-4 ml-1" />
        );
    };

    return (
        <div className="p-8 bg-gray-100 rounded-lg overflow-x-auto">
            <table className="min-w-full border-collapse">
                <thead>
                {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id}>
                        {hg.headers.map((header) => (
                            <th
                                key={header.id}
                                className="bg-gray-800 text-white p-2 text-left cursor-pointer select-none"
                                onClick={header.column.getToggleSortingHandler()}
                            >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                {renderSortIcon(header.column.getIsSorted())}
                            </th>
                        ))}
                    </tr>
                ))}
                </thead>
                <tbody>
                {table.getRowModel().rows.map((row) => (
                    <tr
                        key={row.id}
                        className={`hover:bg-gray-200 transition-colors ${
                            (row.getValue("change") as number) >= 0
                                ? "bg-green-50"
                                : "bg-red-50"
                        }`}
                    >
                        {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="border-b border-gray-300 p-2">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="mt-4 flex items-center gap-4 justify-end">
                <button
                    onClick={() =>
                        setPagination({ ...pagination, pageIndex: Math.max(pagination.pageIndex - 1, 0) })
                    }
                    disabled={pagination.pageIndex === 0}
                    className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                >
                    Prev
                </button>

                <span>
          Page {pagination.pageIndex + 1} of {totalPages}
        </span>

                <button
                    onClick={() =>
                        setPagination({
                            ...pagination,
                            pageIndex: Math.min(pagination.pageIndex + 1, totalPages - 1),
                        })
                    }
                    disabled={pagination.pageIndex + 1 >= totalPages}
                    className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                >
                    Next
                </button>

                {/* Page size selector */}
                <select
                    value={pagination.pageSize}
                    onChange={(e) =>
                        setPagination({ ...pagination, pageSize: Number(e.target.value), pageIndex: 0 })
                    }
                    className="ml-4 p-1 border rounded"
                >
                    {[5, 10, 20, 50].map((size) => (
                        <option key={size} value={size}>
                            Show {size}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

// --- Test Render ---
// Usage in your page/component
// <TradeTable data={generateFakeData()} />
