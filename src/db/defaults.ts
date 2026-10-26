import type { Category } from '../types'

export const FALLBACK_CATEGORY_ID = 'otros'

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'comida', name: 'Comida', emoji: '🍔', color: '#f97316', order: 0 },
  { id: 'transporte', name: 'Transporte', emoji: '🚌', color: '#3b82f6', order: 1 },
  { id: 'hogar', name: 'Hogar', emoji: '🏠', color: '#8b5cf6', order: 2 },
  { id: 'servicios', name: 'Servicios', emoji: '💡', color: '#eab308', order: 3 },
  { id: 'salud', name: 'Salud', emoji: '💊', color: '#ef4444', order: 4 },
  { id: 'ocio', name: 'Ocio', emoji: '🎉', color: '#ec4899', order: 5 },
  { id: 'compras', name: 'Compras', emoji: '🛍️', color: '#14b8a6', order: 6 },
  { id: FALLBACK_CATEGORY_ID, name: 'Otros', emoji: '📦', color: '#64748b', order: 7 },
]

export const fallbackCategory = () => DEFAULT_CATEGORIES.find((c) => c.id === FALLBACK_CATEGORY_ID)!

export const CATEGORY_COLORS = [
  '#f97316',
  '#3b82f6',
  '#8b5cf6',
  '#eab308',
  '#ef4444',
  '#ec4899',
  '#14b8a6',
  '#22c55e',
  '#06b6d4',
  '#a16207',
  '#64748b',
]
