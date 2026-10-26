import { describe, expect, it } from 'vitest'
import { formatCOP, formatThousands, MAX_AMOUNT, parseAmount } from './money'

const clean = (s: string) => s.replace(/\s/g, ' ')

describe('money', () => {
  it('formatea pesos con puntos de miles y sin decimales', () => {
    expect(clean(formatCOP(1000))).toBe('$ 1.000')
    expect(clean(formatCOP(25000))).toBe('$ 25.000')
    expect(clean(formatCOP(1234567))).toBe('$ 1.234.567')
  })

  it('formatea miles sin símbolo para el input', () => {
    expect(formatThousands(25000)).toBe('25.000')
  })

  it('convierte texto del usuario a entero', () => {
    expect(parseAmount('25.000')).toBe(25000)
    expect(parseAmount('$ 1.500')).toBe(1500)
    expect(parseAmount('007')).toBe(7)
    expect(parseAmount('')).toBe(0)
    expect(parseAmount('abc')).toBe(0)
    expect(parseAmount('9'.repeat(20))).toBe(MAX_AMOUNT)
  })
})
