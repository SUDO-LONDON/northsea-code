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

const formatTimeAgo = (date: Date) => {
  const now = new Date()
  const diffInMinutes = Math.round((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60)
    return `${hours}h ago`
  }
  return date.toLocaleString()
}

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: () => <div className="text-left">Product Name</div>,
    cell: ({ row }) => (
      <div className="text-left">
        <span className="font-medium text-white">{row.getValue("name")}</span>
      </div>
    )
  },
  {
    accessorKey: "price",
    header: () => <div className="text-center">Price</div>,
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"))
      return <div className="text-center font-medium text-white">${price.toFixed(2)}</div>
    }
  },
  {
    accessorKey: "lastUpdated",
    header: () => <div className="text-center">Last Updated</div>,
    cell: ({ row }) => {
      const lastUpdated = row.getValue("lastUpdated")
      if (!lastUpdated) return <div className="text-center text-sm text-gray-400">Never</div>

      const date = new Date(lastUpdated)
      return (
        <div className="text-center text-sm text-gray-400">
          {formatTimeAgo(date)}
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
    <div className="rounded-xl overflow-hidden">
      <Table>
        <TableHeader className="bg-[#1c1b2d]">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-[#1c1b2d]">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="text-gray-400 font-medium">
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
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="border-b border-gray-800 hover:bg-[#1a182b]"
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
              <TableCell colSpan={columns.length} className="h-24 text-center text-gray-400">
                Loading products...
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
