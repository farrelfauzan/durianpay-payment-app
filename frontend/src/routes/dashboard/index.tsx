import { PaymentTable } from '#/components/dashboard/payment-table'
import { PaymentChart } from '#/components/dashboard/payment-chart'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { Can } from '#/hooks/use-ability'
import { ACL } from '#/lib/acl'

const paymentSearchSchema = z.object({
  page: z.number().int().positive().catch(1),
  page_size: z.number().int().positive().catch(10),
  sort: z.string().catch('-created_at'),
  search: z.string().catch(''),
})

export type PaymentSearchParams = z.infer<typeof paymentSearchSchema>

export const Route = createFileRoute('/dashboard/')({
  validateSearch: paymentSearchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground dar">
          Welcome back! Here&apos;s an overview of your workspace.
        </p>
      </div>
      <Can {...ACL.view.Payment}>
        <Can {...ACL.view.Analytics}>
          <PaymentChart />
        </Can>
        <PaymentTable />
      </Can>
      <Can not {...ACL.view.Payment}>
        <div className="rounded-2xl border border-slate-300/70 bg-white/45 p-8 text-center backdrop-blur-xl dark:border-white/15 dark:bg-slate-900/35">
          <p className="text-sm text-muted-foreground">You do not have permission to view payments.</p>
        </div>
      </Can>
    </div>
  )
}
