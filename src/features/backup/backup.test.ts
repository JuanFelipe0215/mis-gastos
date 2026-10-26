import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../db/db'
import { DEFAULT_CATEGORIES } from '../../db/defaults'
import type { Expense } from '../../types'
import { deleteCategory } from '../categories/api'
import { addExpense } from '../expenses/api'
import {
  applyImport,
  expensesToCSV,
  ImportError,
  parseCSVBackup,
  parseJSONBackup,
  readAllData,
  serializeBackup,
} from './backup'

const expense = (id: string, overrides: Partial<Expense> = {}): Expense => ({
  id,
  amount: 25000,
  categoryId: 'comida',
  description: 'Almuerzo',
  date: '2026-10-25',
  createdAt: 1,
  updatedAt: 1,
  ...overrides,
})

beforeEach(async () => {
  db.close()
  await db.delete()
  await db.open()
})

describe('base de datos', () => {
  it('crea las categorías por defecto', async () => {
    const names = (await db.categories.orderBy('order').toArray()).map((c) => c.name)
    expect(names).toEqual(['Comida', 'Transporte', 'Hogar', 'Servicios', 'Salud', 'Ocio', 'Compras', 'Otros'])
  })

  it('al eliminar una categoría sus gastos pasan a Otros', async () => {
    const created = await addExpense({ amount: 5000, categoryId: 'ocio', description: 'Cine', date: '2026-10-25' })
    await deleteCategory('ocio')
    expect((await db.expenses.get(created.id))?.categoryId).toBe('otros')
    expect(await db.categories.get('ocio')).toBeUndefined()
  })
})

describe('respaldo JSON', () => {
  it('exporta e importa sin perder nada', async () => {
    await db.expenses.bulkAdd([expense('a'), expense('b', { amount: 8000, categoryId: 'transporte' })])
    const json = serializeBackup(await readAllData())

    await db.expenses.clear()
    const parsed = parseJSONBackup(json)
    await applyImport(parsed, 'replace')

    expect(await db.expenses.count()).toBe(2)
    expect((await db.expenses.get('b'))?.amount).toBe(8000)
  })

  it('combinar no duplica y actualiza por id', async () => {
    await db.expenses.add(expense('a'))
    await applyImport({ categories: DEFAULT_CATEGORIES, expenses: [expense('a', { amount: 1 }), expense('c')] }, 'merge')
    expect(await db.expenses.count()).toBe(2)
    expect((await db.expenses.get('a'))?.amount).toBe(1)
  })

  it('reemplazar borra lo anterior y manda a Otros los gastos sin categoría', async () => {
    await db.expenses.add(expense('viejo'))
    await applyImport({ categories: [], expenses: [expense('nuevo', { categoryId: 'no-existe' })] }, 'replace')
    expect(await db.expenses.toCollection().primaryKeys()).toEqual(['nuevo'])
    expect((await db.expenses.get('nuevo'))?.categoryId).toBe('otros')
    expect(await db.categories.get('otros')).toBeDefined()
  })

  it('rechaza archivos inválidos con un mensaje claro', () => {
    expect(() => parseJSONBackup('no es json')).toThrow(ImportError)
    expect(() => parseJSONBackup('{"app":"otra"}')).toThrow(/formato de Mis Gastos/)
    const bad = serializeBackup({ categories: [], expenses: [expense('x', { amount: -5 })] })
    expect(() => parseJSONBackup(bad)).toThrow(ImportError)
  })
})

describe('CSV', () => {
  it('exporta con nombres de categoría y lo vuelve a leer', () => {
    const csv = expensesToCSV({ categories: DEFAULT_CATEGORIES, expenses: [expense('a', { description: 'Pan; leche' })] })
    expect(csv.startsWith('\uFEFFfecha;monto;categoria;descripcion;id')).toBe(true)

    const data = parseCSVBackup(csv, DEFAULT_CATEGORIES, 100)
    expect(data.expenses).toEqual([expense('a', { description: 'Pan; leche', createdAt: 100, updatedAt: 100 })])
  })

  it('crea categorías nuevas y acepta montos con puntos', () => {
    const csv = 'Fecha,Monto,Categoría,Descripción\n2026-10-01,"45.000",Mascotas,Concentrado\n2026-10-02,3000,comida,'
    const data = parseCSVBackup(csv, DEFAULT_CATEGORIES)
    expect(data.expenses.map((e) => e.amount)).toEqual([45000, 3000])
    expect(data.expenses[1].categoryId).toBe('comida')
    const mascotas = data.categories.find((c) => c.name === 'Mascotas')
    expect(mascotas).toBeDefined()
    expect(data.expenses[0].categoryId).toBe(mascotas!.id)
  })

  it('reporta la línea con error', () => {
    expect(() => parseCSVBackup('fecha;monto\n25/10/2026;1000', DEFAULT_CATEGORIES)).toThrow(/Línea 2/)
    expect(() => parseCSVBackup('fecha;monto\n2026-10-25;abc', DEFAULT_CATEGORIES)).toThrow(/Línea 2/)
    expect(() => parseCSVBackup('nombre;valor\nx;1', DEFAULT_CATEGORIES)).toThrow(/columnas/)
  })

  it('rechaza montos negativos o con decimales', () => {
    expect(() => parseCSVBackup('fecha;monto\n2026-10-25;-5000', DEFAULT_CATEGORIES)).toThrow(/Línea 2/)
    expect(() => parseCSVBackup('fecha;monto\n2026-10-25;25.000,50', DEFAULT_CATEGORIES)).toThrow(/Línea 2/)
    const ok = parseCSVBackup('fecha;monto\n2026-10-25;$ 25.000\n2026-10-26;1 200', DEFAULT_CATEGORIES)
    expect(ok.expenses.map((e) => e.amount)).toEqual([25000, 1200])
  })

  it('conserva la categoría por id aunque haya nombres repetidos', () => {
    const categories = [...DEFAULT_CATEGORIES, { id: 'segunda', name: 'Comida', emoji: '🍕', color: '#000000', order: 8 }]
    const expenses = [expense('a', { categoryId: 'comida' }), expense('b', { categoryId: 'segunda' })]
    const data = parseCSVBackup(expensesToCSV({ categories, expenses }), categories)
    expect(data.expenses.map((e) => e.categoryId)).toEqual(['comida', 'segunda'])

    const sinId = parseCSVBackup('fecha;monto;categoria\n2026-10-25;1000;Comida', categories)
    expect(sinId.expenses[0].categoryId).toBe('comida')
  })
})
