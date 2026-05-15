import { Skeleton } from '#/components/ui/skeleton'
import { usePaymentSummary } from '#/hooks/use-payment-summary'

export function PaymentSummaryBar() {
  const { total, success, processing, failed, isLoading } = usePaymentSummary()

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-300/70 bg-white/30 px-4 py-3 text-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/25">
      {isLoading ? (
        <Skeleton className="h-4 w-72 bg-slate-300/60 dark:bg-slate-700/70" />
      ) : (
        <>
          <span className="font-medium text-slate-700 dark:text-slate-100">
            Total: {total}
          </span>
          <span className="text-muted-foreground">|</span>
          <span className="font-medium text-green-700 dark:text-green-300">
            Success: {success}
          </span>
          <span className="text-muted-foreground">|</span>
          <span className="font-medium text-amber-700 dark:text-amber-300">
            Processing: {processing}
          </span>
          <span className="text-muted-foreground">|</span>
          <span className="font-medium text-red-700 dark:text-red-300">
            Failed: {failed}
          </span>
        </>
      )}
    </div>
  )
}
