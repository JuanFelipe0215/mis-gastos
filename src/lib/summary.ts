import type { Expense } from '../types'

export interface CategoryTotal {
  categoryId: string
  total: number
  percent: number
}

export const sumAmounts = (expenses: Expense[]) => expenses.reduce((acc, e) => acc + e.amount, 0)

export function totalsByCategory(expenses: Expense[]): CategoryTotal[] {
  const totals = new Map<string, number>()
  for (const e of expenses) totals.set(e.categoryId, (totals.get(e.categoryId) ?? 0) + e.amount)
  const grand = sumAmounts(expenses)
  return [...totals.entries()]
    .map(([categoryId, total]) => ({ categoryId, total, percent: grand ? (total / grand) * 100 : 0 }))
    .sort((a, b) => b.total - a.total)
}

export function dailyTotals(expenses: Expense[], days: string[]): { date: string; total: number }[] {
  const totals = new Map<string, number>(days.map((d) => [d, 0]))
  for (const e of expenses) {
    if (totals.has(e.date)) totals.set(e.date, totals.get(e.date)! + e.amount)
  }
  return days.map((date) => ({ date, total: totals.get(date)! }))
}

/** Agrupa por fecha (más reciente primero); dentro del día, el último registrado arriba. */
export function groupByDate(expenses: Expense[]): [string, Expense[]][] {
  const groups = new Map<string, Expense[]>()
  for (const e of expenses) {
    const list = groups.get(e.date)
    if (list) list.push(e)
    else groups.set(e.date, [e])
  }
  return [...groups.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, list]) => [date, list.sort((a, b) => b.createdAt - a.createdAt)])
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null
  return ((current - previous) / previous) * 100
}
