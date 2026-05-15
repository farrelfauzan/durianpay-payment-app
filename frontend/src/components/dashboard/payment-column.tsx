import type { Payment } from '@durianpay/sdk'
import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '#/components/ui/badge'

export const paymentColumns: ColumnDef<Payment>[] = [
  {
    accessorKey: 'id',
    header: 'Payment ID',
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.id}</span>
    ),
  },
  {
    accessorKey: 'merchant',
    header: 'Merchant',
    cell: ({ row }) => <span>{row.original.merchant}</span>,
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => (
      <span>
        {new Intl.NumberFormat('en-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
        }).format(Number(row.original.amount))}
      </span>
    ),
  },
  {
    accessorKey: 'created_at',
    header: 'Date',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {new Date(row.original.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status
      const statusColors: Record<string, string> = {
        pending:
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-200',
        processing:
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-200',
        completed:
          'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-200',
        failed: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200',
      }
      return (
        <Badge
          className={
            statusColors[status] ||
            'bg-gray-100 text-gray-800 dark:bg-slate-500/20 dark:text-slate-200'
          }
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      )
    },
  },
]
