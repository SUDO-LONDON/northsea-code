"use client"

import '@/index.css'
import { useEffect, useRef, useState } from "react"
import {
    flexRender,
    getCoreRowModel,
    createColumnHelper,
    useReactTable,
    type Row,
    type Table,
    type Header,
    type HeaderGroup,
    type Cell,
} from "@tanstack/react-table"
import type { SortingState } from "@tanstack/react-table"
import {
    LineChart,
    Line,
    ResponsiveContainer,
} from "recharts"
import {
    Table as UITable,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

// ---- Types shared with StockChart ----
export type Trade = {
    spot: string;
    price: number;
    change: number;
    sparkline: number[];
    chartData: { date: string; value: number }[];
};

// ---- Fake Data Generator (exported so page can use it) ----
export function generateFakeData(count = 20): Trade[] {
    const spots = ["AAPL", "GOOG", "TSLA", "AMZN", "MSFT", "NFLX", "META", "NVDA", "ORCL", "AMD"];
    const out: Trade[] = [];

    for (let i = 0; i < count; i++) {
        const spot = spots[i % spots.length];
        const base = Math.random() * 500 + 50;
        const price = +(base + (Math.random() - 0.5) * 10).toFixed(2);
        const change = +((Math.random() - 0.5) * 8).toFixed(2);

        // sparkline (20 points)
        const sparkline = Array.from({ length: 20 }, () =>
            +(base * (1 + (Math.random() - 0.5) * 0.05)).toFixed(2)
        );

        // full chart data (30 points)
        const chartData = Array.from({ length: 30 }, (_, i) => ({
            date: `Day ${i + 1}`,
            value: +(base * (1 + (Math.random() - 0.5) * 0.08)).toFixed(2),
        }));

        out.push({ spot, price, change, sparkline, chartData });
    }
    return out;
}

// ---- Tiny Sparkline used inside the table ----
function Sparkline({ data }: { data: number[] }) {
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
        cell: (info) => `£${info.getValue().toFixed(2)}`,
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
    onSelectAction,
}: {
    data: Trade[];
    onSelectAction?: (row: Trade) => Promise<void>;
}) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [currentPageData, setCurrentPageData] = useState<Trade[]>([]);

    const totalPages = Math.ceil(data.length / pagination.pageSize);

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
        manualPagination: true,
        pageCount: totalPages,
    });

    return (
        <div className="bg-secondary-foreground shadow-md rounded-xl p-6 overflow-x-auto">
            <UITable>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup: HeaderGroup<Trade>) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header: Header<Trade, unknown>) => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row: Row<Trade>) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                                className="cursor-pointer"
                                onClick={() => onSelectAction?.(row.original)}
                            >
                                {row.getVisibleCells().map((cell: Cell<Trade, unknown>) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </UITable>

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
