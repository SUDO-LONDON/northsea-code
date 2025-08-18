"use client";

import '@/index.css'
import { useEffect, useRef, useState } from "react";
import {
    useReactTable,
    createColumnHelper,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
    SortingState,
} from "@tanstack/react-table";
import {
    LineChart,
    Line,
    ResponsiveContainer,
} from "recharts";
import { ArrowUp, ArrowDown } from "lucide-react";

// ---- Types shared with StockChart ----
export type Trade = {
    spot: string;
    price: number;
    change: number;
    // small spark for the table
    sparkline: number[];
    // full chart for the big chart below
    chartData: { date: string; value: number }[];
};

// ---- Fake Data Generator (exported so page can use it) ----
export function generateFakeData(count = 20): Trade[] {
    const spots = ["AAPL", "GOOG", "TSLA", "AMZN", "MSFT", "NFLX", "META", "NVDA", "ORCL", "AMD"];
    const out: Trade[] = [];

    for (let i = 0; i < count; i++) {
        const spot = spots[i % spots.length];
        const base = Math.random() * 500 + 50; // base price 50..550
        const price = +(base + (Math.random() - 0.5) * 10).toFixed(2);
        const change = +((Math.random() - 0.5) * 8).toFixed(2); // -4%..+4%

        // sparkline (20 points)
        const sparkline = Array.from({ length: 20 }, (_, idx) =>
            +(base * (1 + (Math.random() - 0.5) * 0.05)).toFixed(2)
        );

        // full chart data (30 points)
        const chartData = Array.from({ length: 30 }, (_, idx) => ({
            date: `Day ${idx + 1}`,
            value: +(base * (1 + (Math.random() - 0.5) * 0.08)).toFixed(2),
        }));

        out.push({ spot, price, change, sparkline, chartData });
    }
    return out;
}

// ---- Tiny Sparkline used inside the table ----
function Sparkline({ data }: { data: number[] }) {
    // animate with a tiny random walk so it feels "alive"
    const [sparkData, setSparkData] = useState(data.map((v) => ({ price: v })));
    const lastPriceRef = useRef(data[data.length - 1]);

    useEffect(() => {
        const t = setInterval(() => {
            setSparkData((prev) => {
                const next = lastPriceRef.current * (1 + (Math.random() - 0.5) * 0.01);
                lastPriceRef.current = next;
                const updated = [...prev, { price: +next.toFixed(2) }];
                if (updated.length > 20) updated.shift();
                return updated;
            });
        }, 1000);
        return () => clearInterval(t);
    }, []);

    return (
        <ResponsiveContainer width={110} height={40}>
            <LineChart data={sparkData}>
                <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#4ade80"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive
                    animationDuration={500}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

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
            return (
                <span className={val >= 0 ? "text-green-600" : "text-red-600"}>
          {val.toFixed(2)}%
        </span>
            );
        },
    }),
    columnHelper.accessor("sparkline", {
        header: "7d",
        cell: (info) => <Sparkline data={info.getValue()} />,
    }),
];

export default function TradeTable({
                                       data,
                                       onSelect,
                                   }: {
    data: Trade[];
    onSelect?: (row: Trade) => void;
}) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [currentPageData, setCurrentPageData] = useState<Trade[]>([]);

    const totalPages = Math.ceil(data.length / pagination.pageSize);

    // slice the current page (client-side pagination scaffold)
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
        <div className="bg-secondary-foreground shadow-md rounded-xl p-6 overflow-x-auto">
            <table className="min-w-full border-collapse">
                <thead>
                {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id}>
                        {hg.headers.map((header) => (
                            <th
                                key={header.id}
                                className="bg-foreground text-primary p-3 text-left font-semibold text-sm uppercase tracking-wider cursor-pointer select-none"
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
                        className={`transition-colors duration-200 cursor-pointer hover:bg-indigo-50 ${
                            row.getValue<number>("change") >= 0 ? "bg-green-50" : "bg-red-50"
                        }`}
                        onClick={() => onSelect?.(row.original)}
                    >
                        {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="border-b border-gray-200 p-3 text-sm text-gray-700">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="mt-5 flex items-center gap-4 justify-end text-sm text-gray-700">
                <button
                    onClick={() =>
                        setPagination({
                            ...pagination,
                            pageIndex: Math.max(pagination.pageIndex - 1, 0),
                        })
                    }
                    disabled={pagination.pageIndex === 0}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md disabled:opacity-50 hover:bg-indigo-200"
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
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md disabled:opacity-50 hover:bg-indigo-200"
                >
                    Next
                </button>

                <select
                    value={pagination.pageSize}
                    onChange={(e) =>
                        setPagination({
                            ...pagination,
                            pageSize: Number(e.target.value),
                            pageIndex: 0,
                        })
                    }
                    className="ml-2 p-1 border border-gray-300 rounded-md"
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
