import { z } from 'zod'
import { db } from '../../db/db'
import { FALLBACK_CATEGORY_ID, fallbackCategory } from '../../db/defaults'
import { parseCSV, toCSV } from '../../lib/csv'
import { isISODate } from '../../lib/dates'
import { newId } from '../../lib/id'
import { MAX_AMOUNT, parseAmount } from '../../lib/money'
import type { Category, Expense } from '../../types'

export const BACKUP_APP = 'mis-gastos'
export const BACKUP_VERSION = 1

export type ImportMode = 'merge' | 'replace'

export interface BackupData {
  categories: Category[]
  expenses: Expense[]
}

export class ImportError extends Error {}

const categorySchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(40),
  emoji: z.string().max(16),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  order: z.number().int(),
})

const expenseSchema = z.object({
  id: z.string().min(1),
  amount: z.number().int().positive().max(MAX_AMOUNT),
  categoryId: z.string().min(1),
  description: z.string().max(200).default(''),
  date: z.string().refine(isISODate, 'Fecha inválida'),
  createdAt: z.number(),
  updatedAt: z.number(),
})

const backupSchema = z.object({
  app: z.literal(BACKUP_APP),
  version: z.number().int().max(BACKUP_VERSION),
  exportedAt: z.string(),
  categories: z.array(categorySchema),
  expenses: z.array(expenseSchema),
})

export async function readAllData(): Promise<BackupData> {
  const [categories, expenses] = await Promise.all([
    db.categories.orderBy('order').toArray(),
    db.expenses.orderBy('date').toArray(),
  ])
  return { categories, expenses }
}

export function serializeBackup(data: BackupData, now = new Date()): string {
  return JSON.stringify(
    { app: BACKUP_APP, version: BACKUP_VERSION, exportedAt: now.toISOString(), ...data },
    null,
    2,
  )
}

export function parseJSONBackup(text: string): BackupData {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new ImportError('El archivo no es un JSON válido.')
  }
  const result = backupSchema.safeParse(raw)
  if (!result.success) {
    const issue = result.error.issues[0]
    const where = issue.path.length ? ` (${issue.path.join('.')})` : ''
    throw new ImportError(`El archivo no tiene el formato de Mis Gastos${where}: ${issue.message}`)
  }
  return { categories: result.data.categories, expenses: result.data.expenses }
}

const CSV_HEADER = ['fecha', 'monto', 'categoria', 'descripcion', 'id']

export function expensesToCSV(data: BackupData): string {
  const names = new Map(data.categories.map((c) => [c.id, c.name]))
  const rows = [...data.expenses]
    .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt - b.createdAt)
    .map((e) => [e.date, String(e.amount), names.get(e.categoryId) ?? 'Otros', e.description, e.id])
  return '\uFEFF' + toCSV([CSV_HEADER, ...rows])
}

const normalize = (text: string) =>
  text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

/**
 * Lee un CSV con columnas fecha, monto, categoria, descripcion (id opcional).
 * Las categorías se emparejan por nombre; las que no existan se crean.
 */
export function parseCSVBackup(text: string, existing: Category[], now = Date.now()): BackupData {
  const rows = parseCSV(text)
  if (rows.length === 0) throw new ImportError('El CSV está vacío.')
  const header = rows[0].map(normalize)
  const col = (name: string) => header.indexOf(name)
  const idx = { fecha: col('fecha'), monto: col('monto'), categoria: col('categoria'), descripcion: col('descripcion'), id: col('id') }
  if (idx.fecha < 0 || idx.monto < 0) {
    throw new ImportError('El CSV debe tener al menos las columnas "fecha" y "monto".')
  }

  const byName = new Map(existing.map((c) => [normalize(c.name), c]))
  const created: Category[] = []
  let nextOrder = existing.reduce((max, c) => Math.max(max, c.order), -1) + 1

  const resolveCategory = (rawName: string): string => {
    const name = rawName.trim()
    if (!name) return FALLBACK_CATEGORY_ID
    const found = byName.get(normalize(name))
    if (found) return found.id
    const category: Category = { id: newId(), name: name.slice(0, 40), emoji: '🏷️', color: '#64748b', order: nextOrder++ }
    byName.set(normalize(name), category)
    created.push(category)
    return category.id
  }

  const expenses = rows.slice(1).map((row, i): Expense => {
    const line = i + 2
    const date = (row[idx.fecha] ?? '').trim()
    if (!isISODate(date)) throw new ImportError(`Línea ${line}: la fecha "${date}" debe tener formato AAAA-MM-DD.`)
    const amount = parseAmount(row[idx.monto] ?? '')
    if (amount <= 0) throw new ImportError(`Línea ${line}: el monto "${row[idx.monto] ?? ''}" no es válido.`)
    return {
      id: (idx.id >= 0 && row[idx.id]?.trim()) || newId(),
      amount,
      categoryId: resolveCategory(idx.categoria >= 0 ? (row[idx.categoria] ?? '') : ''),
      description: (idx.descripcion >= 0 ? (row[idx.descripcion] ?? '') : '').trim().slice(0, 200),
      date,
      createdAt: now + i,
      updatedAt: now + i,
    }
  })

  return { categories: [...existing, ...created], expenses }
}

/** Aplica un respaldo. "merge" sobrescribe por id; "replace" borra todo antes. */
export async function applyImport(data: BackupData, mode: ImportMode): Promise<{ expenses: number; categories: number }> {
  await db.transaction('rw', db.categories, db.expenses, async () => {
    if (mode === 'replace') {
      await db.expenses.clear()
      await db.categories.clear()
    }
    await db.categories.bulkPut(data.categories)
    if (!(await db.categories.get(FALLBACK_CATEGORY_ID))) await db.categories.add(fallbackCategory())

    const known = new Set(await db.categories.toCollection().primaryKeys())
    const expenses = data.expenses.map((e) => (known.has(e.categoryId) ? e : { ...e, categoryId: FALLBACK_CATEGORY_ID }))
    await db.expenses.bulkPut(expenses)
  })
  return { expenses: data.expenses.length, categories: data.categories.length }
}
