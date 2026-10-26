import { db } from '../../db/db'
import { FALLBACK_CATEGORY_ID, fallbackCategory } from '../../db/defaults'
import { newId } from '../../lib/id'
import type { Category } from '../../types'

export type CategoryInput = Pick<Category, 'name' | 'emoji' | 'color'>

export async function addCategory(input: CategoryInput): Promise<Category> {
  const last = await db.categories.orderBy('order').last()
  const category: Category = { ...input, name: input.name.trim(), id: newId(), order: (last?.order ?? -1) + 1 }
  await db.categories.add(category)
  return category
}

export async function updateCategory(id: string, input: CategoryInput): Promise<void> {
  await db.categories.update(id, { ...input, name: input.name.trim() })
}

/** Los gastos de la categoría eliminada pasan a "Otros". */
export async function deleteCategory(id: string): Promise<void> {
  if (id === FALLBACK_CATEGORY_ID) throw new Error('La categoría "Otros" no se puede eliminar')
  await db.transaction('rw', db.categories, db.expenses, async () => {
    if (!(await db.categories.get(FALLBACK_CATEGORY_ID))) await db.categories.add(fallbackCategory())
    await db.expenses.where('categoryId').equals(id).modify({ categoryId: FALLBACK_CATEGORY_ID })
    await db.categories.delete(id)
  })
}

export const countExpensesInCategory = (id: string) => db.expenses.where('categoryId').equals(id).count()
