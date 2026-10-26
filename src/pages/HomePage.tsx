import { addDays } from 'date-fns'
import { Card, EmptyState, PageHeader } from '../components/Card'
import { useExpensesInRange } from '../db/hooks'
import { BackupReminder } from '../features/backup/BackupReminder'
import { ExpenseList } from '../features/expenses/ExpenseList'
import { useToday } from '../hooks/useToday'
import { fromISODate, longDate, periodRange, toISODate } from '../lib/dates'
import { formatCOP } from '../lib/money'
import { sumAmounts } from '../lib/summary'
import type { Expense } from '../types'

interface Props {
  onSelect: (expense: Expense) => void
  onGoToBackup: () => void
}

export function HomePage({ onSelect, onGoToBackup }: Props) {
  const today = useToday()
  const anchor = fromISODate(today)
  const week = periodRange('week', anchor)
  const month = periodRange('month', anchor)
  const from = week.start < month.start ? week.start : month.start
  const expenses = useExpensesInRange(from, today)
  const recentFrom = toISODate(addDays(anchor, -6))

  if (!expenses) return null

  const inRange = (start: string, end: string) => expenses.filter((e) => e.date >= start && e.date <= end)
  const todayExpenses = inRange(today, today)
  const recent = inRange(recentFrom, today)

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Mis Gastos" subtitle={longDate(today)} />

      <div className="rounded-2xl bg-emerald-600 p-4 text-white shadow-sm dark:bg-emerald-700">
        <p className="text-sm text-emerald-100">Hoy</p>
        <p className="text-4xl font-bold tabular-nums">{formatCOP(sumAmounts(todayExpenses))}</p>
        <p className="mt-1 text-sm text-emerald-100">
          {todayExpenses.length === 1 ? '1 gasto' : `${todayExpenses.length} gastos`}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Esta semana</p>
          <p className="text-xl font-bold tabular-nums">{formatCOP(sumAmounts(inRange(week.start, week.end)))}</p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Este mes</p>
          <p className="text-xl font-bold tabular-nums">{formatCOP(sumAmounts(inRange(month.start, month.end)))}</p>
        </Card>
      </div>

      <BackupReminder onGoToBackup={onGoToBackup} />

      <section className="flex flex-col gap-2">
        <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Últimos 7 días
        </h2>
        {recent.length ? (
          <ExpenseList expenses={recent} onSelect={onSelect} />
        ) : (
          <EmptyState>
            Todavía no hay gastos esta semana.
            <br />
            Toca el botón <strong>+</strong> para registrar el primero.
          </EmptyState>
        )}
      </section>
    </div>
  )
}
