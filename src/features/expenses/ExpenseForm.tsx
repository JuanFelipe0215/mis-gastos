import { Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { AmountInput } from '../../components/AmountInput'
import { useToast } from '../../components/toastContext'
import { addDays } from 'date-fns'
import { useCategories } from '../../db/hooks'
import { useToday } from '../../hooks/useToday'
import { fromISODate, toISODate } from '../../lib/dates'
import { getLastCategory, setLastCategory } from '../../lib/prefs'
import type { Expense } from '../../types'
import { addExpense, deleteExpense, restoreExpense, updateExpense } from './api'

interface Props {
  expense?: Expense
  onDone: () => void
}

export function ExpenseForm({ expense, onDone }: Props) {
  const categories = useCategories()
  const toast = useToast()
  const [amount, setAmount] = useState(expense?.amount ?? 0)
  const [categoryId, setCategoryId] = useState(expense?.categoryId ?? getLastCategory() ?? 'comida')
  const [description, setDescription] = useState(expense?.description ?? '')
  const today = useToday()
  const [date, setDate] = useState(expense?.date ?? today)
  const [error, setError] = useState<string | null>(null)

  const yesterday = toISODate(addDays(fromISODate(today), -1))
  const selectedCategoryId =
    categories.length > 0 && !categories.some((c) => c.id === categoryId) ? categories[0].id : categoryId

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (amount <= 0) {
      setError('Escribe un monto')
      return
    }
    if (!date) {
      setError('Elige una fecha')
      return
    }
    const input = { amount, categoryId: selectedCategoryId, description, date }
    if (expense) {
      await updateExpense(expense.id, input)
      toast('Gasto actualizado')
    } else {
      await addExpense(input)
      toast('Gasto guardado')
    }
    setLastCategory(selectedCategoryId)
    onDone()
  }

  const remove = async () => {
    if (!expense) return
    const deleted = await deleteExpense(expense.id)
    onDone()
    if (deleted) toast('Gasto eliminado', { label: 'Deshacer', onClick: () => restoreExpense(deleted) })
  }

  const chip = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-sm font-medium ${
      active ? 'bg-emerald-600 text-white' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
    }`

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <AmountInput
          value={amount}
          autoFocus={!expense}
          onChange={(value) => {
            setAmount(value)
            setError(null)
          }}
        />
        {error && <p className="mt-1 text-center text-sm text-red-500">{error}</p>}
      </div>

      <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Categoría">
        {categories.map((c) => {
          const active = c.id === selectedCategoryId
          return (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setCategoryId(c.id)}
              className={`flex flex-col items-center gap-1 rounded-2xl border-2 px-1 py-2 text-xs font-medium transition-colors ${
                active ? '' : 'border-transparent bg-zinc-100 dark:bg-zinc-800'
              }`}
              style={active ? { borderColor: c.color, backgroundColor: `${c.color}1f` } : undefined}
            >
              <span className="text-xl" aria-hidden>
                {c.emoji}
              </span>
              <span className="w-full truncate text-center">{c.name}</span>
            </button>
          )
        })}
      </div>

      <input
        type="text"
        placeholder="Descripción (opcional)"
        maxLength={80}
        enterKeyHint="done"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="rounded-xl bg-zinc-100 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800"
      />

      <div className="flex items-center gap-2">
        <button type="button" className={chip(date === today)} onClick={() => setDate(today)}>
          Hoy
        </button>
        <button type="button" className={chip(date === yesterday)} onClick={() => setDate(yesterday)}>
          Ayer
        </button>
        <input
          type="date"
          aria-label="Fecha"
          value={date}
          max={today}
          onChange={(e) => setDate(e.target.value)}
          className="ml-auto rounded-xl bg-zinc-100 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800"
        />
      </div>

      <div className="flex gap-2">
        {expense && (
          <button
            type="button"
            onClick={remove}
            aria-label="Eliminar gasto"
            className="flex items-center justify-center rounded-2xl bg-red-50 px-4 text-red-600 dark:bg-red-950/50 dark:text-red-400"
          >
            <Trash2 size={20} />
          </button>
        )}
        <button
          type="submit"
          className="flex-1 rounded-2xl bg-emerald-600 py-3.5 text-base font-semibold text-white active:bg-emerald-700"
        >
          {expense ? 'Guardar cambios' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
