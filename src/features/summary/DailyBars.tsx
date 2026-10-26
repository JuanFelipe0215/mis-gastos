import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { dayLabel, shortDayLabel, type Period } from '../../lib/dates'
import { formatCOP, formatCompact } from '../../lib/money'

interface Props {
  data: { date: string; total: number }[]
  period: Period
}

interface TooltipProps {
  active?: boolean
  payload?: { payload: { date: string; total: number } }[]
}

function DayTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null
  const { date, total } = payload[0].payload
  return (
    <div className="rounded-xl bg-zinc-900 px-3 py-2 text-xs text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900">
      <p>{dayLabel(date)}</p>
      <p className="font-semibold">{formatCOP(total)}</p>
    </div>
  )
}

export function DailyBars({ data, period }: Props) {
  return (
    <div className="h-44 text-zinc-500 dark:text-zinc-400">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <XAxis
            dataKey="date"
            tickFormatter={(d: string) => shortDayLabel(d, period)}
            tick={{ fill: 'currentColor', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval={period === 'month' ? 4 : 0}
          />
          <YAxis
            tickFormatter={(v: number) => formatCompact(v)}
            tick={{ fill: 'currentColor', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip content={<DayTooltip />} cursor={{ fill: 'currentColor', fillOpacity: 0.08 }} />
          <Bar dataKey="total" fill="#059669" radius={[4, 4, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
