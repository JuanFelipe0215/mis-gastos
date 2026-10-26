import { db } from '../../db/db'
import { newId } from '../../lib/id'
import type { Expense, ExpenseInput } from '../../types'

export async function addExpense(input: ExpenseInput): Promise<Expense> {
  const now = Date.now()
  const expense: Expense = { ...input, description: input.description.trim(), id: newId(), createdAt: now, updatedAt: now }
  await db.expenses.add(expense)
  return expense
}

export async function updateExpense(id: string, input: ExpenseInput): Promise<void> {
  await db.expenses.update(id, { ...input, description: input.description.trim(), updatedAt: Date.now() })
}

export async function deleteExpense(id: string): Promise<Expense | undefined> {
  const expense = await db.expenses.get(id)
  if (expense) await db.expenses.delete(id)
  return expense
}

export async function restoreExpense(expense: Expense): Promise<void> {
  await db.expenses.put(expense)
}
