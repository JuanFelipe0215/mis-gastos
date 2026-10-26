import { describe, expect, it } from 'vitest'
import { parseCSV, toCSV } from './csv'

describe('csv', () => {
  it('escapa celdas con separadores, comillas y saltos de línea', () => {
    expect(toCSV([['a', 'b;c', 'd"e', 'f\ng']])).toBe('a;"b;c";"d""e";"f\ng"')
  })

  it('hace ida y vuelta', () => {
    const rows = [
      ['fecha', 'monto', 'descripcion'],
      ['2026-10-25', '25000', 'Almuerzo; con "postre"\ny café'],
    ]
    expect(parseCSV(toCSV(rows))).toEqual(rows)
  })

  it('detecta comas y quita BOM y líneas vacías', () => {
    expect(parseCSV('\uFEFFfecha,monto\r\n2026-10-25,1000\r\n\r\n')).toEqual([
      ['fecha', 'monto'],
      ['2026-10-25', '1000'],
    ])
  })
})
