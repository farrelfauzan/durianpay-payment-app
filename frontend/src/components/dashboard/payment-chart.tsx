import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { usePaymentSummary } from '#/hooks/use-payment-summary'
import { Skeleton } from '#/components/ui/skeleton'

const COLORS = {
  success: '#22c55e',
  processing: '#f59e0b',
  failed: '#ef4444',
}

export function PaymentChart() {
  const { success, processing, failed, isLoading } = usePaymentSummary()

  if (isLoading) {
    return (
      <div className="flex h-65 items-center justify-center rounded-2xl border border-slate-300/70 bg-white/45 backdrop-blur-xl dark:border-white/15 dark:bg-slate-900/35">
        <Skeleton className="h-40 w-40 rounded-full bg-slate-300/60 dark:bg-slate-700/70" />
      </div>
    )
  }

  const data = [
    { name: 'Success', value: success },
    { name: 'Processing', value: processing },
    { name: 'Failed', value: failed },
  ].filter((d) => d.value > 0)

  if (data.length === 0) {
    return (
      <div className="flex h-65 items-center justify-center rounded-2xl border border-slate-300/70 bg-white/45 backdrop-blur-xl dark:border-white/15 dark:bg-slate-900/35">
        <p className="text-sm text-muted-foreground">No payment data to display</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-300/70 bg-white/45 p-4 backdrop-blur-xl dark:border-white/15 dark:bg-slate-900/35">
      <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
        Payment Status Distribution
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
            animationEasing="ease-out"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            labelLine={false}
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid rgba(148,163,184,0.3)',
              backgroundColor: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(8px)',
            }}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
