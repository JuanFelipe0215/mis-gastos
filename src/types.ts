export interface Category {
  id: string
  name: string
  emoji: string
  color: string
  order: number
}

export interface Expense {
  id: string
  /** Monto en pesos colombianos, siempre entero. */
  amount: number
  categoryId: string
  description: string
  /** Fecha local en formato YYYY-MM-DD. */
  date: string
  createdAt: number
  updatedAt: number
}

export type ExpenseInput = Pick<Expense, 'amount' | 'categoryId' | 'description' | 'date'>
