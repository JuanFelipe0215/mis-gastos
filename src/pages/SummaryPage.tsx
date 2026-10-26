import { TrendingDown, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { Card, EmptyState, PageHeader } from '../components/Card'
import { PeriodNavigator } from '../components/PeriodNavigator'
import { SegmentedControl } from '../components/SegmentedControl'
import { useExpensesInRange } from '../db/hooks'
import { useToday } from '../hooks/useToday'
import { ExpenseList } from '../features/expenses/ExpenseList'
import { CategoryBreakdown } from '../features/summary/CategoryBreakdown'
import { DailyBars } from '../features/summary/DailyBars'
import { daysInRange, fromISODate, periodLabel, periodRange, shiftAnchor, type Period } from '../lib/dates'
import { formatCOP } from '../lib/money'
import { dailyTotals, percentChange, sumAmounts, totalsByCategory } from '../lib/summary'
import type { Expense } from '../types'

const PERIODS: { value: Period; label: string }[] = [
  { value: 'day', label: 'Día' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
]

const PREVIOUS_LABEL: Record<Period, string> = { day: 'ayer', week: 'la semana anterior', month: 'el mes anterior' }

export function SummaryPage({ onSelect }: { onSelect: (expense: Expense) => void }) {
  const [period, setPeriod] = useState<Period>('month')
  const [anchor, setAnchor] = useState(() => new Date())
  const range = periodRange(period, anchor)
  const previous = periodRange(period, shiftAnchor(period, anchor, -1))
  const expenses = useExpensesInRange(previous.start, range.end)
  const today = useToday()
  const isCurrent = range.start === periodRange(period, fromISODate(today)).start

  const current = (expenses ?? []).filter((e) => e.date >= range.start)
  const total = sumAmounts(current)
  const previousTotal = sumAmounts((expenses ?? []).filter((e) => e.date <= previous.end))
  const change = percentChange(total, previousTotal)

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Resumen" />
      <SegmentedControl value={period} options={PERIODS} onChange={setPeriod} />
      <PeriodNavigator
        label={periodLabel(period, anchor)}
        onPrev={() => setAnchor((a) => shiftAnchor(period, a, -1))}
        onNext={() => setAnchor((a) => shiftAnchor(period, a, 1))}
        nextDisabled={isCurrent}
      />

      <Card>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Total gastado</p>
        <p className="text-3xl font-bold tabular-nums">{formatCOP(total)}</p>
        {change !== null && (
          <p
            className={`mt-1 flex items-center gap-1 text-sm ${
              change > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {change > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {change > 0 ? '+' : ''}
            {Math.round(change)}% vs {PREVIOUS_LABEL[period]}
          </p>
        )}
      </Card>

      {expenses && current.length === 0 && <EmptyState>No hay gastos en este período.</EmptyState>}

      {current.length > 0 && period !== 'day' && (
        <Card>
          <h2 className="mb-2 text-sm font-semibold">Por día</h2>
          <DailyBars data={dailyTotals(current, daysInRange(range))} period={period} />
        </Card>
      )}

      {current.length > 0 && (
        <Card>
          <h2 className="mb-2 text-sm font-semibold">Por categoría</h2>
          <CategoryBreakdown totals={totalsByCategory(current)} />
        </Card>
      )}

      {current.length > 0 && period === 'day' && (
        <ExpenseList expenses={current} onSelect={onSelect} showDayHeaders={false} />
      )}
    </div>
  )
}
