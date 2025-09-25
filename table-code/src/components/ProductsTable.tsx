"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Product } from "@/lib/products"
import { AreaChart, Area, ResponsiveContainer } from "recharts"
import { downloadCSV } from "@/lib/csvExport"
import { Download } from "lucide-react"

// Generate sparkline data that matches the direction and magnitude of percentage change
const generateDirectionalSparklineData = (change: number) => {
  const points = 20;
  const base = 100;
  // Calculate the end value based on percentage change
  const end = base * (1 + change / 100);
  // Linear interpolation from base to end
  return Array.from({ length: points }, (_, i) => ({
    x: i,
    y: base + ((end - base) * i) / (points - 1) + (Math.random() - 0.5) * 2 // add slight noise
  }));
};

const GASOIL_NAMES = [
  "M0 SG 10PPM FP",
  "M0 0.1% BGS"
];

const BBLS_PRODUCTS = ["USGC 3%", "USGC 0.5%", "Singapore 10ppm"];
const getUnit = (name: string) => {
  if (name === "Rotterdam 0.1%") return " / MT";
  if (BBLS_PRODUCTS.includes(name)) return " / BBLS";
  return GASOIL_NAMES.includes(name) ? " / BBLS" : " / MT";
};

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: () => <div className="text-left">Product</div>,
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const unit = GASOIL_NAMES.includes(name) ? " / BBLS" : " / MT";
      return (
        <div className="text-left">
          <span className="font-medium text-foreground">{name}{unit}</span>
        </div>
      );
    }
  },
  {
    accessorKey: "hfo",
    header: () => <div className="text-center">HFO</div>,
    cell: ({ row }) => {
      const value = parseFloat(row.getValue("hfo"));
      const name = row.getValue("name") as string;
      return <div className="text-center font-medium text-foreground">${value.toFixed(2)}{getUnit(name)}</div>;
    }
  },
  {
    accessorKey: "vlsfo",
    header: () => <div className="text-center">VLSFO</div>,
    cell: ({ row }) => {
      const value = parseFloat(row.getValue("vlsfo"));
      const name = row.getValue("name") as string;
      return <div className="text-center font-medium text-foreground">${value.toFixed(2)}{getUnit(name)}</div>;
    }
  },
  {
    accessorKey: "mgo",
    header: () => <div className="text-center">MGO</div>,
    cell: ({ row }) => {
      const value = parseFloat(row.getValue("mgo"));
      const name = row.getValue("name") as string;
      return <div className="text-center font-medium text-foreground">${value.toFixed(2)}{getUnit(name)}</div>;
    }
  },
  {
    accessorKey: "change",
    header: () => <div className="text-center">Change</div>,
    cell: ({ row }) => {
      const value = parseFloat(row.getValue("change"))
      return (
        <div className={`text-center font-medium ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {value >= 0 ? '+' : ''}{value.toFixed(2)}%
        </div>
      )
    }
  },
  {
    id: "sparkline",
    header: () => <div className="text-right">7d Trend</div>,
    cell: ({ row }) => {
      const product = row.original as Product;
      const data = product.history && product.history.length > 0
        ? product.history.map((y, x) => ({ x, y }))
        : generateDirectionalSparklineData(product.change);
      const color = product.change >= 0 ? "#10B981" : "#EF4444";
      return (
        <div className="w-[100px] h-[40px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`colorUv-${product.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.6}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="y"
                stroke={color}
                fillOpacity={1}
                fill={`url(#colorUv-${product.id})`}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )
    }
  }
]

export function ProductsTable({ data }: { data: Product[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const handleDownload = () => {
    downloadCSV(data, 'bunker_prices');
  };

  return (
    <div className="rounded-xl overflow-hidden border">
      {/* Download button header */}
      <div className="flex justify-between items-center p-4 bg-muted border-b">
        <h3 className="text-lg font-semibold text-foreground">Bunker Prices Data</h3>
        <Button 
          onClick={handleDownload}
          variant="outline"
          className="flex items-center gap-2 text-foreground border-foreground hover:bg-foreground hover:text-background"
          disabled={data.length === 0}
        >
          <Download size={16} />
          Download CSV
        </Button>
      </div>
      
      <Table>
        <TableHeader className="bg-muted">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-muted">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="text-muted-foreground font-medium">
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
        <TableBody className="bg-card">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="border-b hover:bg-muted/50"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                Loading products...
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
