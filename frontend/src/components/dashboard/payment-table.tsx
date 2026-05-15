import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Download } from 'lucide-react'
import { useGetDashboardV1Payments } from '@durianpay/sdk'
import { paymentColumns } from './payment-column'
import { PaymentSummaryBar } from './payment-summary-bar'
import { PaymentPagination } from './payment-pagination'
import { usePaymentTableState } from '#/hooks/use-payment-table-state'
import { Can } from '#/hooks/use-ability'
import { ACL } from '#/lib/acl'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Skeleton } from '#/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'

export function PaymentTable() {
  const {
    page,
    setPage,
    pageSize,
    sort,
    searchInput,
    setSearchInput,
    queryParams,
    handleSortChange,
    handlePageSizeChange,
  } = usePaymentTableState()

  const { data, isLoading, isError, isFetching } = useGetDashboardV1Payments(queryParams)
  const payments = data?.payments ?? []
  const currentPage = data?.page ?? page
  const currentPageSize = data?.page_size ?? pageSize
  const total = data?.total ?? 0
  const offset = data?.offset ?? (currentPage - 1) * currentPageSize
  const nextPage = data?.next_page ?? null
  const previousPage = data?.previous_page ?? null
  const totalPages = Math.max(1, Math.ceil(total / currentPageSize))
  const startItem =
    total === 0 || payments.length === 0 ? 0 : offset + 1
  const endItem =
    total === 0 || payments.length === 0
      ? 0
      : Math.min(offset + payments.length, total)
  const skeletonRows = Math.min(pageSize, 20)

  const table = useReactTable({
    data: payments,
    columns: paymentColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-300/70 bg-white/45 shadow-[0_18px_48px_-24px_rgba(186,210,255,0.7)] backdrop-blur-xl dark:border-white/15 dark:bg-slate-900/35 dark:shadow-[0_20px_55px_rgba(2,6,23,0.5)]">
      <PaymentSummaryBar />

      <div className="flex flex-col gap-3 border-b border-slate-300/70 bg-white/30 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/25 md:flex-row md:items-center">
        <Input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search by payment id, merchant, or status"
          className="border-slate-300/80 bg-white/55 backdrop-blur-sm dark:border-white/15 dark:bg-slate-900/45 md:max-w-sm"
        />
        <select
          value={sort}
          onChange={(event) => handleSortChange(event.target.value)}
          aria-label="Sort payments"
          className="h-8 rounded-lg border border-slate-300/80 bg-white/55 px-2.5 text-sm backdrop-blur-sm dark:border-white/15 dark:bg-slate-900/45"
        >
          <option value="-created_at">Newest first</option>
          <option value="created_at">Oldest first</option>
          <option value="-amount">Amount high to low</option>
          <option value="amount">Amount low to high</option>
          <option value="merchant">Merchant A-Z</option>
          <option value="-merchant">Merchant Z-A</option>
        </select>
        <Can {...ACL.export.Payment}>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-slate-300/80 bg-white/55 backdrop-blur-sm dark:border-white/15 dark:bg-slate-900/45"
            onClick={() => {
              import('xlsx').then((XLSX) => {
                const rows = payments.map((p) => ({
                  ID: p.id,
                  Merchant: p.merchant,
                  Status: p.status,
                  Amount: p.amount,
                  'Created At': p.created_at,
                }))
                const ws = XLSX.utils.json_to_sheet(rows)
                const wb = XLSX.utils.book_new()
                XLSX.utils.book_append_sheet(wb, ws, 'Payments')
                XLSX.writeFile(wb, 'payments.xlsx')
              })
            }}
          >
            <Download className="size-3.5" />
            Export
          </Button>
        </Can>
        <select
          value={pageSize}
          onChange={(event) => handlePageSizeChange(Number(event.target.value))}
          className="h-8 rounded-lg border border-slate-300/80 bg-white/55 px-2.5 text-sm backdrop-blur-sm dark:border-white/15 dark:bg-slate-900/45 md:ml-auto"
          aria-label="Rows per page"
        >
          <option value={5}>5 / page</option>
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </div>

      <Table>
        <TableHeader className="bg-white/35 dark:bg-slate-900/35">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-slate-300/70 hover:bg-transparent dark:border-white/10"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="font-semibold text-slate-700 dark:text-slate-200"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: skeletonRows }).map((_, index) => (
              <TableRow
                key={`payment-skeleton-${index}`}
                className="border-slate-200/80 dark:border-white/10"
              >
                <TableCell>
                  <Skeleton className="h-4 w-20 bg-slate-300/60 dark:bg-slate-700/70" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28 bg-slate-300/60 dark:bg-slate-700/70" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24 bg-slate-300/60 dark:bg-slate-700/70" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20 rounded-full bg-slate-300/60 dark:bg-slate-700/70" />
                </TableCell>
              </TableRow>
            ))
          ) : isError ? (
            <TableRow>
              <TableCell
                colSpan={paymentColumns.length}
                className="h-24 text-center"
              >
                Failed to load payments.
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="border-slate-200/80 hover:bg-white/35 data-[state=selected]:bg-white/45 dark:border-white/10 dark:hover:bg-slate-800/40 dark:data-[state=selected]:bg-slate-800/50"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={paymentColumns.length}
                className="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <PaymentPagination
        currentPage={currentPage}
        totalPages={totalPages}
        startItem={startItem}
        endItem={endItem}
        total={total}
        nextPage={nextPage}
        previousPage={previousPage}
        isLoading={isLoading}
        isFetching={isFetching}
        onPageChange={setPage}
      />
    </div>
  )
}
