import { describe, expect, it } from 'vitest'
import type { Expense } from '../types'
import { dailyTotals, groupByDate, percentChange, sumAmounts, totalsByCategory } from './summary'

const e = (id: string, amount: number, categoryId: string, date: string, createdAt = 0): Expense => ({
  id,
  amount,
  categoryId,
  date,
  description: '',
  createdAt,
  updatedAt: createdAt,
})

const expenses = [
  e('1', 10000, 'comida', '2026-10-20', 1),
  e('2', 30000, 'transporte', '2026-10-20', 2),
  e('3', 60000, 'comida', '2026-10-22', 3),
]

describe('summary', () => {
  it('suma montos', () => {
    expect(sumAmounts(expenses)).toBe(100000)
    expect(sumAmounts([])).toBe(0)
  })

  it('agrupa por categoría con porcentaje, de mayor a menor', () => {
    expect(totalsByCategory(expenses)).toEqual([
      { categoryId: 'comida', total: 70000, percent: 70 },
      { categoryId: 'transporte', total: 30000, percent: 30 },
    ])
  })

  it('llena con ceros los días sin gastos', () => {
    expect(dailyTotals(expenses, ['2026-10-20', '2026-10-21', '2026-10-22'])).toEqual([
      { date: '2026-10-20', total: 40000 },
      { date: '2026-10-21', total: 0 },
      { date: '2026-10-22', total: 60000 },
    ])
  })

  it('agrupa por fecha, lo más reciente primero', () => {
    const groups = groupByDate(expenses)
    expect(groups.map(([d]) => d)).toEqual(['2026-10-22', '2026-10-20'])
    expect(groups[1][1].map((x) => x.id)).toEqual(['2', '1'])
  })

  it('calcula la variación porcentual', () => {
    expect(percentChange(150, 100)).toBe(50)
    expect(percentChange(50, 100)).toBe(-50)
    expect(percentChange(10, 0)).toBeNull()
  })
})
