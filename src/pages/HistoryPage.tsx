import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Card, EmptyState, PageHeader } from '../components/Card'
import { PeriodNavigator } from '../components/PeriodNavigator'
import { useCategories, useExpensesInRange } from '../db/hooks'
import { useToday } from '../hooks/useToday'
import { ExpenseList } from '../features/expenses/ExpenseList'
import { fromISODate, periodLabel, periodRange, shiftAnchor } from '../lib/dates'
import { formatCOP } from '../lib/money'
import { sumAmounts } from '../lib/summary'
import type { Expense } from '../types'

export function HistoryPage({ onSelect }: { onSelect: (expense: Expense) => void }) {
  const [anchor, setAnchor] = useState(() => new Date())
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const categories = useCategories()
  const range = periodRange('month', anchor)
  const expenses = useExpensesInRange(range.start, range.end)
  const today = useToday()
  const isCurrent = range.start === periodRange('month', fromISODate(today)).start

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (expenses ?? []).filter(
      (e) => (!categoryId || e.categoryId === categoryId) && (!q || e.description.toLowerCase().includes(q)),
    )
  }, [expenses, categoryId, query])

  const chip = (active: boolean) =>
    `shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ${
      active ? 'bg-emerald-600 text-white' : 'bg-white text-zinc-600 shadow-sm dark:bg-zinc-900 dark:text-zinc-300'
    }`

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Historial" />
      <PeriodNavigator
        label={periodLabel('month', anchor)}
        onPrev={() => setAnchor((a) => shiftAnchor('month', a, -1))}
        onNext={() => setAnchor((a) => shiftAnchor('month', a, 1))}
        nextDisabled={isCurrent}
      />

      <label className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 shadow-sm dark:bg-zinc-900">
        <Search size={18} className="text-zinc-400" />
        <input
          type="search"
          placeholder="Buscar por descripción"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-transparent outline-none"
        />
      </label>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <button type="button" className={chip(categoryId === null)} onClick={() => setCategoryId(null)}>
          Todas
        </button>
        {categories.map((c) => (
          <button key={c.id} type="button" className={chip(categoryId === c.id)} onClick={() => setCategoryId(c.id)}>
            {c.emoji} {c.name}
          </button>
        ))}
      </div>

      <Card className="flex items-center justify-between">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {filtered.length === 1 ? '1 gasto' : `${filtered.length} gastos`}
        </span>
        <span className="text-lg font-bold tabular-nums">{formatCOP(sumAmounts(filtered))}</span>
      </Card>

      {expenses && (filtered.length ? (
        <ExpenseList expenses={filtered} onSelect={onSelect} />
      ) : (
        <EmptyState>No hay gastos que coincidan.</EmptyState>
      ))}
    </div>
  )
}
