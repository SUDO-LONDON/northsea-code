import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ArrowDownAZ, ArrowUpAZ, BarChart2, Columns, RefreshCcw } from "lucide-react";
import {
    LineChart,
    Line,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

// ————————————————————————————————————————————————————————————
// Types
// ————————————————————————————————————————————————————————————
export type Coin = {
    id: string;
    rank: number;
    symbol: string;
    name: string;
    image?: string; // URL to coin icon
    price: number; // in quote currency
    marketCap: number;
    volume24h: number;
    change24h: number; // % change, e.g., -3.21
    sparkline?: number[]; // last N price points
};

export type ColumnKey =
    | "rank"
    | "name"
    | "price"
    | "marketCap"
    | "volume24h"
    | "change24h"
    | "sparkline";

export type CryptoTableProps = {
    /** Data to render. If omitted and a `fetcher` is provided, the component will load on mount. */
    data?: Coin[];
    /** Callback that returns coins; if provided, enables the refresh button and optional polling. */
    fetcher?: () => Promise<Coin[]>;
    /** Poll interval in ms when a fetcher is provided. Omit to disable polling. */
    refreshIntervalMs?: number;
    /** Visible columns (order matters). */
    columns?: ColumnKey[];
    /** Page size for pagination. */
    pageSize?: number;
    /** Symbol used for currency formatting (e.g., "$", "€", "£"). */
    currencySymbol?: string;
    /** Locale for number formatting. */
    locale?: string;
    /** Called when a row is clicked. */
    onRowClick?: (coin: Coin) => void;
    /** Optional title for the card. */
    title?: string;
    /** Optional className to style the wrapper. */
    className?: string;
};

// ————————————————————————————————————————————————————————————
// Utilities
// ————————————————————————————————————————————————————————————
function cx(...classes: Array<string | undefined | false>) {
    return classes.filter(Boolean).join(" ");
}

function formatCurrency(
    value: number,
    { symbol = "$", locale = undefined as string | undefined } = {}
) {
    try {
        const formatted = new Intl.NumberFormat(locale, {
            style: "currency",
            currency: symbolToISO(symbol) ?? "USD",
            maximumFractionDigits: value < 1 ? 6 : 2,
        }).format(value);
        return formatted;
    } catch {
        // Fallback if currency code mapping fails
        const num = new Intl.NumberFormat(locale, {
            maximumFractionDigits: value < 1 ? 6 : 2,
        }).format(value);
        return `${symbol}${num}`;
    }
}

function symbolToISO(symbol?: string) {
    if (!symbol) return undefined;
    const map: Record<string, string> = { "$": "USD", "€": "EUR", "£": "GBP", "¥": "JPY" };
    return map[symbol] ?? undefined;
}

function formatNumber(value: number, locale?: string) {
    return new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 2 }).format(value);
}

function trendColor(v: number) {
    return v === 0 ? "text-foreground" : v > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400";
}

// ————————————————————————————————————————————————————————————
// Component
// ————————————————————————————————————————————————————————————
const DEFAULT_COLUMNS: ColumnKey[] = [
    "rank",
    "name",
    "price",
    "marketCap",
    "volume24h",
    "change24h",
    "sparkline",
];

const DEFAULT_PAGE_SIZE = 10;

export default function CryptoTable({
                                        data: dataProp,
                                        fetcher,
                                        refreshIntervalMs,
                                        columns = DEFAULT_COLUMNS,
                                        pageSize = DEFAULT_PAGE_SIZE,
                                        currencySymbol = "$",
                                        locale,
                                        onRowClick,
                                        title = "Crypto Markets",
                                        className,
                                    }: CryptoTableProps) {
    const [query, setQuery] = useState("");
    const [visibleCols, setVisibleCols] = useState<ColumnKey[]>(columns);
    const [sortKey, setSortKey] = useState<ColumnKey>("rank");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<Coin[]>(dataProp ?? []);

    // Load initial data if fetcher is provided and no data was passed.
    useEffect(() => {
        if (!fetcher) return;
        let mounted = true;
        const load = async () => {
            try {
                setLoading(true);
                const res = await fetcher();
                if (mounted) setData(res);
            } catch (e: any) {
                if (mounted) setError(e?.message ?? "Failed to load data");
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, [fetcher]);

    // Optional polling
    useEffect(() => {
        if (!fetcher || !refreshIntervalMs) return;
        const id = setInterval(async () => {
            try {
                const res = await fetcher();
                setData(res);
            } catch {}
        }, refreshIntervalMs);
        return () => clearInterval(id);
    }, [fetcher, refreshIntervalMs]);

    // Filter & sort
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        let base = data;
        if (q) {
            base = base.filter(
                (c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)
            );
        }
        const sorted = [...base].sort((a, b) => {
            const dir = sortDir === "asc" ? 1 : -1;
            const val = (key: ColumnKey, coin: Coin) => {
                switch (key) {
                    case "rank":
                        return coin.rank;
                    case "name":
                        return coin.name.toLowerCase();
                    case "price":
                        return coin.price;
                    case "marketCap":
                        return coin.marketCap;
                    case "volume24h":
                        return coin.volume24h;
                    case "change24h":
                        return coin.change24h;
                    case "sparkline":
                        return coin.sparkline?.[coin.sparkline.length - 1] ?? 0;
                    default:
                        return 0;
                }
            };
            const av = val(sortKey, a);
            const bv = val(sortKey, b);
            if (typeof av === "string" && typeof bv === "string") {
                return av.localeCompare(bv) * dir;
            }
            if (av < bv) return -1 * dir;
            if (av > bv) return 1 * dir;
            return 0;
        });
        return sorted;
    }, [data, query, sortDir, sortKey]);

    // Pagination
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const current = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, page, pageSize]);

    function toggleColumn(col: ColumnKey) {
        setVisibleCols((cols) =>
            cols.includes(col) ? cols.filter((c) => c !== col) : [...cols, col]
        );
    }

    function setSort(col: ColumnKey) {
        if (sortKey === col) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(col);
            setSortDir("asc");
        }
    }

    async function handleRefresh() {
        if (!fetcher) return;
        try {
            setLoading(true);
            const res = await fetcher();
            setData(res);
            setError(null);
        } catch (e: any) {
            setError(e?.message ?? "Refresh failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className={cx("w-full", className)}>
            <CardHeader className="gap-2">
                <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <BarChart2 className="h-5 w-5" /> {title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Input
                            value={query}
                            onChange={(e) => {
                                setPage(1);
                                setQuery(e.target.value);
                            }}
                            placeholder="Search by name or symbol…"
                            className="w-56"
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="rounded-2xl">
                                    <Columns className="h-4 w-4" />
                                    <span className="sr-only">Toggle columns</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Columns</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {DEFAULT_COLUMNS.map((col) => (
                                    <DropdownMenuCheckboxItem
                                        key={col}
                                        checked={visibleCols.includes(col)}
                                        onCheckedChange={() => toggleColumn(col)}
                                    >
                                        {labelFor(col)}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        {fetcher && (
                            <Button onClick={handleRefresh} disabled={loading} variant="outline">
                                <RefreshCcw className={cx("h-4 w-4 mr-2", loading && "animate-spin")}/> Refresh
                            </Button>
                        )}
                    </div>
                </div>
                {error && (
                    <div className="text-sm text-rose-600 dark:text-rose-400">{error}</div>
                )}
            </CardHeader>
            <CardContent>
                <div className="rounded-2xl border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {visibleCols.includes("rank") && (
                                    <Th onClick={() => setSort("rank")} active={sortKey === "rank"} dir={sortDir}>#</Th>
                                )}
                                {visibleCols.includes("name") && (
                                    <Th onClick={() => setSort("name")} active={sortKey === "name"} dir={sortDir}>Name</Th>
                                )}
                                {visibleCols.includes("price") && (
                                    <Th onClick={() => setSort("price")} active={sortKey === "price"} dir={sortDir}>Price</Th>
                                )}
                                {visibleCols.includes("marketCap") && (
                                    <Th onClick={() => setSort("marketCap")} active={sortKey === "marketCap"} dir={sortDir}>Market Cap</Th>
                                )}
                                {visibleCols.includes("volume24h") && (
                                    <Th onClick={() => setSort("volume24h")} active={sortKey === "volume24h"} dir={sortDir}>24h Volume</Th>
                                )}
                                {visibleCols.includes("change24h") && (
                                    <Th onClick={() => setSort("change24h")} active={sortKey === "change24h"} dir={sortDir}>24h %</Th>
                                )}
                                {visibleCols.includes("sparkline") && (
                                    <Th onClick={() => setSort("sparkline")} active={sortKey === "sparkline"} dir={sortDir}>7d</Th>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && current.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                                        Loading…
                                    </TableCell>
                                </TableRow>
                            ) : current.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                current.map((coin) => (
                                    <TableRow
                                        key={coin.id}
                                        className={cx("hover:bg-muted/40 cursor-pointer")}
                                        onClick={() => onRowClick?.(coin)}
                                    >
                                        {visibleCols.includes("rank") && (
                                            <TableCell className="w-12 text-muted-foreground">{coin.rank}</TableCell>
                                        )}
                                        {visibleCols.includes("name") && (
                                            <TableCell className="min-w-[220px]">
                                                <div className="flex items-center gap-3">
                                                    {coin.image ? (
                                                        <img src={coin.image} alt={coin.symbol} className="h-6 w-6 rounded-full" />
                                                    ) : (
                                                        <div className="h-6 w-6 rounded-full bg-muted"/>
                                                    )}
                                                    <div className="flex flex-col">
                                                        <span className="font-medium leading-tight">{coin.name}</span>
                                                        <span className="text-xs text-muted-foreground leading-tight">{coin.symbol.toUpperCase()}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        )}
                                        {visibleCols.includes("price") && (
                                            <TableCell className="tabular-nums">{formatCurrency(coin.price, { symbol: currencySymbol, locale })}</TableCell>
                                        )}
                                        {visibleCols.includes("marketCap") && (
                                            <TableCell className="tabular-nums">{formatCurrency(coin.marketCap, { symbol: currencySymbol, locale })}</TableCell>
                                        )}
                                        {visibleCols.includes("volume24h") && (
                                            <TableCell className="tabular-nums">{formatCurrency(coin.volume24h, { symbol: currencySymbol, locale })}</TableCell>
                                        )}
                                        {visibleCols.includes("change24h") && (
                                            <TableCell className={cx("tabular-nums font-medium", trendColor(coin.change24h))}>
                                                {coin.change24h > 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
                                            </TableCell>
                                        )}
                                        {visibleCols.includes("sparkline") && (
                                            <TableCell className="w-[160px]">
                                                {coin.sparkline && coin.sparkline.length > 1 ? (
                                                    <div className="h-10">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <LineChart data={coin.sparkline.map((y, i) => ({ i, y }))}>
                                                                <Tooltip formatter={(v: number) => formatCurrency(v, { symbol: currencySymbol, locale })} labelFormatter={() => ""} contentStyle={{ fontSize: 12 }} />
                                                                <Line type="monotone" dataKey="y" dot={false} strokeWidth={2} />
                                                            </LineChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-muted-foreground">—</div>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4 text-sm">
                    <div className="text-muted-foreground">
                        Showing <span className="font-medium">{Math.min(total, (page - 1) * pageSize + 1)}</span>–
                        <span className="font-medium">{Math.min(page * pageSize, total)}</span> of {total}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPage(1)} disabled={page === 1}>First</Button>
                        <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                            <ArrowUpAZ className="h-4 w-4 mr-1 rotate-90"/> Prev
                        </Button>
                        <div className="px-2">Page <span className="font-medium">{page}</span> / {totalPages}</div>
                        <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                            Next <ArrowDownAZ className="h-4 w-4 ml-1 rotate-90"/>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setPage(totalPages)} disabled={page === totalPages}>Last</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ————————————————————————————————————————————————————————————
// Subcomponents
// ————————————————————————————————————————————————————————————
function Th({ children, onClick, active, dir }: { children: React.ReactNode; onClick: () => void; active?: boolean; dir?: "asc" | "desc" }) {
    return (
        <TableHead onClick={onClick} className="select-none cursor-pointer">
            <div className="inline-flex items-center gap-1">
                <span>{children}</span>
                {active ? (
                    <span className="text-muted-foreground text-xs">{dir === "asc" ? "▲" : "▼"}</span>
                ) : (
                    <span className="text-muted-foreground text-xs opacity-40">⇵</span>
                )}
            </div>
        </TableHead>
    );
}

function labelFor(col: ColumnKey) {
    switch (col) {
        case "rank":
            return "#";
        case "name":
            return "Name";
        case "price":
            return "Price";
        case "marketCap":
            return "Market Cap";
        case "volume24h":
            return "24h Volume";
        case "change24h":
            return "24h %";
        case "sparkline":
            return "7d";
        default:
            return col;
    }
}

// ————————————————————————————————————————————————————————————
// Example usage (remove this block in production)
// ————————————————————————————————————————————————————————————
export function DemoCryptoTable() {
    const [mock, setMock] = useState<Coin[]>(() => mockData());

    // Simulate tiny live updates
    useEffect(() => {
        const id = setInterval(() => setMock((m) => jiggle(m)), 3000);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <CryptoTable
                data={mock}
                pageSize={10}
                currencySymbol="£"
                title="Demo: Crypto Markets"
                onRowClick={(c) => alert(`Clicked ${c.name} (${c.symbol})`)}
            />
        </div>
    );
}

// ————————————————————————————————————————————————————————————
// Mock helpers for Demo
// ————————————————————————————————————————————————————————————
function mockData(): Coin[] {
    const coins = [
        { id: "btc", rank: 1, symbol: "BTC", name: "Bitcoin", price: 57213, marketCap: 1.12e12, volume24h: 23.3e9, change24h: -0.84 },
        { id: "eth", rank: 2, symbol: "ETH", name: "Ethereum", price: 2841, marketCap: 341e9, volume24h: 12.4e9, change24h: 1.12 },
        { id: "usdt", rank: 3, symbol: "USDT", name: "Tether", price: 1.0, marketCap: 114e9, volume24h: 40.1e9, change24h: 0.01 },
        { id: "bnb", rank: 4, symbol: "BNB", name: "BNB", price: 568, marketCap: 87e9, volume24h: 1.7e9, change24h: 0.34 },
        { id: "sol", rank: 5, symbol: "SOL", name: "Solana", price: 156.82, marketCap: 73e9, volume24h: 4.1e9, change24h: -1.9 },
        { id: "xrp", rank: 6, symbol: "XRP", name: "XRP", price: 0.64, marketCap: 35e9, volume24h: 1.1e9, change24h: 0.7 },
        { id: "ada", rank: 7, symbol: "ADA", name: "Cardano", price: 0.47, marketCap: 16.2e9, volume24h: 0.7e9, change24h: -0.4 },
        { id: "doge", rank: 8, symbol: "DOGE", name: "Dogecoin", price: 0.11, marketCap: 15.6e9, volume24h: 0.6e9, change24h: 3.2 },
        { id: "trx", rank: 9, symbol: "TRX", name: "TRON", price: 0.12, marketCap: 10.1e9, volume24h: 0.52e9, change24h: -0.7 },
        { id: "dot", rank: 10, symbol: "DOT", name: "Polkadot", price: 6.74, marketCap: 9.2e9, volume24h: 0.41e9, change24h: 0.2 },
        { id: "link", rank: 11, symbol: "LINK", name: "Chainlink", price: 17.12, marketCap: 10.0e9, volume24h: 0.9e9, change24h: -0.1 },
    ];
    const withLines = coins.map((c) => ({
        ...c,
        image: `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${c.symbol.toLowerCase()}.png`,
        sparkline: makeSparkline(40, c.price),
    }));
    return withLines;
}

function makeSparkline(n: number, base: number) {
    const pts: number[] = [];
    let last = base;
    for (let i = 0; i < n; i++) {
        const change = (Math.random() - 0.5) * (base * 0.01);
        last = Math.max(0, last + change);
        pts.push(last);
    }
    return pts;
}

function jiggle(data: Coin[]): Coin[] {
    return data.map((c) => {
        const price = Math.max(0, c.price * (1 + (Math.random() - 0.5) * 0.01));
        const change24h = Math.max(-20, Math.min(20, c.change24h + (Math.random() - 0.5) * 0.4));
        const marketCap = Math.max(0, c.marketCap * (1 + (Math.random() - 0.5) * 0.01));
        const volume24h = Math.max(0, c.volume24h * (1 + (Math.random() - 0.5) * 0.05));
        const sparkline = [...(c.sparkline ?? []), price].slice(-40);
        return { ...c, price, change24h, marketCap, volume24h, sparkline };
    });
}
