import { CategoryBadge } from '../../components/CategoryBadge'
import { formatCOP } from '../../lib/money'
import type { Category, Expense } from '../../types'

interface Props {
  expense: Expense
  category: Category
  onClick: (expense: Expense) => void
}

export function ExpenseRow({ expense, category, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={() => onClick(expense)}
      className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 active:bg-zinc-100 dark:hover:bg-zinc-800/50 dark:active:bg-zinc-800"
    >
      <CategoryBadge category={category} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{expense.description || category.name}</p>
        {expense.description && <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{category.name}</p>}
      </div>
      <span className="font-semibold tabular-nums">{formatCOP(expense.amount)}</span>
    </button>
  )
}
