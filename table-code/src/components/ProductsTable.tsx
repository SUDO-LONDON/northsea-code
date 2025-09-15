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
import { Product } from "@/lib/products"
import { AreaChart, Area, ResponsiveContainer } from "recharts"

// Generate fake sparkline data for visualization
const generateSparklineData = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    x: i,
    y: 50 + Math.random() * 20
  }))
}

const getPriceSuffix = (name: string) => {
  if (["USGC 3%", "USGC 0.5%", "Singapore 10ppm"].includes(name)) {
    return " /BBLS";
  }
  return " / MT";
};

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: () => <div className="text-left">Product</div>,
    cell: ({ row }) => (
      <div className="text-left">
        <span className="font-medium text-foreground">{row.getValue("name")}</span>
        {/* Optionally, show group next to name for gasoil/oil */}
        {PRODUCT_GROUPS[row.getValue("name") as string] && (
          <span className="ml-2 text-xs text-muted-foreground">({PRODUCT_GROUPS[row.getValue("name") as string]})</span>
        )}
      </div>
    )
  },
  {
    accessorKey: "hfo",
    header: () => <div className="text-center">HFO</div>,
    cell: ({ row }) => {
      const value = parseFloat(row.getValue("hfo"));
      const name = row.getValue("name") as string;
      return <div className="text-center font-medium text-foreground">${value.toFixed(2)}{getPriceSuffix(name)}</div>;
    }
  },
  {
    accessorKey: "vlsfo",
    header: () => <div className="text-center">VLSFO</div>,
    cell: ({ row }) => {
      const value = parseFloat(row.getValue("vlsfo"));
      const name = row.getValue("name") as string;
      return <div className="text-center font-medium text-foreground">${value.toFixed(2)}{getPriceSuffix(name)}</div>;
    }
  },
  {
    accessorKey: "mgo",
    header: () => <div className="text-center">MGO</div>,
    cell: ({ row }) => {
      const value = parseFloat(row.getValue("mgo"));
      const name = row.getValue("name") as string;
      return <div className="text-center font-medium text-foreground">${value.toFixed(2)}{getPriceSuffix(name)}</div>;
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
    cell: () => {
      const data = generateSparklineData()
      return (
        <div className="w-[100px] h-[40px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
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

  return (
    <div className="rounded-xl overflow-hidden border">
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
