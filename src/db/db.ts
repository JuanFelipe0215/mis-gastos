import Dexie, { type EntityTable } from 'dexie'
import type { Category, Expense } from '../types'
import { DEFAULT_CATEGORIES } from './defaults'

export class GastosDB extends Dexie {
  expenses!: EntityTable<Expense, 'id'>
  categories!: EntityTable<Category, 'id'>

  constructor(name = 'mis-gastos') {
    super(name)
    this.version(1).stores({
      expenses: 'id, date, categoryId',
      categories: 'id, order',
    })
    this.on('populate', (tx) => {
      tx.table('categories').bulkAdd(DEFAULT_CATEGORIES)
    })
  }
}

export const db = new GastosDB()

/** Pide al navegador que no borre los datos cuando le falte espacio. */
export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage?.persist) return false
  if (await navigator.storage.persisted()) return true
  return navigator.storage.persist()
}
