import { describe, expect, it } from 'vitest'
import { dayLabel, daysInRange, isISODate, periodLabel, periodRange, shiftAnchor, toISODate } from './dates'

// Domingo 25 de octubre de 2026, 11 p.m. hora local
const sundayNight = new Date(2026, 9, 25, 23, 0)

describe('dates', () => {
  it('usa la fecha local, no la UTC', () => {
    expect(toISODate(sundayNight)).toBe('2026-10-25')
  })

  it('la semana va de lunes a domingo', () => {
    expect(periodRange('week', sundayNight)).toEqual({ start: '2026-10-19', end: '2026-10-25' })
    expect(periodRange('week', new Date(2026, 9, 26))).toEqual({ start: '2026-10-26', end: '2026-11-01' })
  })

  it('calcula rangos de día y mes', () => {
    expect(periodRange('day', sundayNight)).toEqual({ start: '2026-10-25', end: '2026-10-25' })
    expect(periodRange('month', new Date(2028, 1, 10))).toEqual({ start: '2028-02-01', end: '2028-02-29' })
  })

  it('mueve el ancla por período', () => {
    expect(toISODate(shiftAnchor('month', new Date(2026, 0, 31), 1))).toBe('2026-02-28')
    expect(toISODate(shiftAnchor('week', sundayNight, -1))).toBe('2026-10-18')
  })

  it('genera etiquetas legibles en español', () => {
    expect(dayLabel('2026-10-25', sundayNight)).toBe('Hoy')
    expect(dayLabel('2026-10-24', sundayNight)).toBe('Ayer')
    expect(dayLabel('2026-10-20', sundayNight)).toBe('Martes 20 de octubre')
    expect(periodLabel('month', sundayNight, sundayNight)).toBe('Octubre')
    expect(periodLabel('week', sundayNight, sundayNight)).toBe('Esta semana')
    expect(periodLabel('week', new Date(2026, 9, 1), sundayNight)).toBe('28 sep – 4 oct')
  })

  it('lista los días de un rango', () => {
    expect(daysInRange({ start: '2026-10-30', end: '2026-11-02' })).toEqual([
      '2026-10-30',
      '2026-10-31',
      '2026-11-01',
      '2026-11-02',
    ])
  })

  it('valida fechas ISO', () => {
    expect(isISODate('2026-10-25')).toBe(true)
    expect(isISODate('2026-02-30')).toBe(false)
    expect(isISODate('25/10/2026')).toBe(false)
  })
})
