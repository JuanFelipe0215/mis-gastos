import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import type { Category, Expense } from '../types'
import { db } from './db'
import { fallbackCategory } from './defaults'

const EMPTY_CATEGORIES: Category[] = []

export function useCategories(): Category[] {
  return useLiveQuery(() => db.categories.orderBy('order').toArray(), []) ?? EMPTY_CATEGORIES
}

export function useCategoryLookup(): (id: string) => Category {
  const categories = useCategories()
  return useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c]))
    return (id: string) => map.get(id) ?? fallbackCategory()
  }, [categories])
}

export function useExpensesInRange(start: string, end: string): Expense[] | undefined {
  return useLiveQuery(() => db.expenses.where('date').between(start, end, true, true).toArray(), [start, end])
}

export function useExpenseCount(): number {
  return useLiveQuery(() => db.expenses.count(), []) ?? 0
}
