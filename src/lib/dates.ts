import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isSameYear,
  isValid,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { es } from 'date-fns/locale'

export type Period = 'day' | 'week' | 'month'

export interface DateRange {
  start: string
  end: string
}

const WEEK_OPTIONS = { weekStartsOn: 1 } as const

/** Fecha local YYYY-MM-DD. No usar toISOString(): en UTC-5 corre la fecha de noche. */
export const toISODate = (date: Date) => format(date, 'yyyy-MM-dd')

export const fromISODate = (iso: string) => parseISO(iso)

export const todayISO = () => toISODate(new Date())

export const isISODate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && isValid(parseISO(value)) && toISODate(parseISO(value)) === value

export const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

export function periodRange(period: Period, anchor: Date): DateRange {
  switch (period) {
    case 'day':
      return { start: toISODate(anchor), end: toISODate(anchor) }
    case 'week':
      return {
        start: toISODate(startOfWeek(anchor, WEEK_OPTIONS)),
        end: toISODate(endOfWeek(anchor, WEEK_OPTIONS)),
      }
    case 'month':
      return { start: toISODate(startOfMonth(anchor)), end: toISODate(endOfMonth(anchor)) }
  }
}

export function shiftAnchor(period: Period, anchor: Date, delta: number): Date {
  switch (period) {
    case 'day':
      return addDays(anchor, delta)
    case 'week':
      return addWeeks(anchor, delta)
    case 'month':
      return addMonths(anchor, delta)
  }
}

export function periodLabel(period: Period, anchor: Date, today = new Date()): string {
  const range = periodRange(period, anchor)
  switch (period) {
    case 'day':
      return dayLabel(range.start, today)
    case 'week': {
      const start = parseISO(range.start)
      const end = parseISO(range.end)
      if (range.start === periodRange('week', today).start) return 'Esta semana'
      const startFmt = isSameMonth(start, end) ? 'd' : 'd MMM'
      const endFmt = isSameYear(end, today) ? 'd MMM' : 'd MMM yyyy'
      return `${format(start, startFmt, { locale: es })} – ${format(end, endFmt, { locale: es })}`
    }
    case 'month':
      return capitalize(format(anchor, isSameYear(anchor, today) ? 'MMMM' : 'MMMM yyyy', { locale: es }))
  }
}

/** "Hoy", "Ayer" o "Lunes 20 de octubre". */
export function dayLabel(iso: string, today = new Date()): string {
  if (iso === toISODate(today)) return 'Hoy'
  if (iso === toISODate(addDays(today, -1))) return 'Ayer'
  const date = parseISO(iso)
  const pattern = isSameYear(date, today) ? "EEEE d 'de' MMMM" : "EEEE d 'de' MMMM yyyy"
  return capitalize(format(date, pattern, { locale: es }))
}

export function daysInRange(range: DateRange): string[] {
  return eachDayOfInterval({ start: parseISO(range.start), end: parseISO(range.end) }).map(toISODate)
}

/** Etiqueta corta para el eje de los gráficos: "L" en semana, "12" en mes. */
export function shortDayLabel(iso: string, period: Period): string {
  const date = parseISO(iso)
  return period === 'week' ? format(date, 'EEEEE', { locale: es }).toUpperCase() : format(date, 'd')
}

export const longDate = (iso: string) => capitalize(format(parseISO(iso), "EEEE d 'de' MMMM yyyy", { locale: es }))
