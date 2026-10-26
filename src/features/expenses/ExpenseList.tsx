import { useCategoryLookup } from '../../db/hooks'
import { dayLabel } from '../../lib/dates'
import { formatCOP } from '../../lib/money'
import { groupByDate, sumAmounts } from '../../lib/summary'
import type { Expense } from '../../types'
import { ExpenseRow } from './ExpenseRow'

interface Props {
  expenses: Expense[]
  onSelect: (expense: Expense) => void
  showDayHeaders?: boolean
}

export function ExpenseList({ expenses, onSelect, showDayHeaders = true }: Props) {
  const lookup = useCategoryLookup()
  const groups = groupByDate(expenses)

  return (
    <div className="flex flex-col gap-4">
      {groups.map(([date, items]) => (
        <section key={date}>
          {showDayHeaders && (
            <header className="mb-1 flex items-baseline justify-between px-1 text-sm">
              <h3 className="font-medium text-zinc-600 dark:text-zinc-300">{dayLabel(date)}</h3>
              <span className="tabular-nums text-zinc-500 dark:text-zinc-400">{formatCOP(sumAmounts(items))}</span>
            </header>
          )}
          <div className="divide-y divide-zinc-100 overflow-hidden rounded-2xl bg-white shadow-sm dark:divide-zinc-800 dark:bg-zinc-900">
            {items.map((e) => (
              <ExpenseRow key={e.id} expense={e} category={lookup(e.categoryId)} onClick={onSelect} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
