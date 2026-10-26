export const MAX_AMOUNT = 999_999_999_999

const copFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
  useGrouping: 'always',
})

const thousandsFormatter = new Intl.NumberFormat('es-CO', {
  maximumFractionDigits: 0,
  useGrouping: 'always',
})

const compactFormatter = new Intl.NumberFormat('es-CO', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

export const formatCOP = (amount: number) => copFormatter.format(amount)

export const formatThousands = (amount: number) => thousandsFormatter.format(amount)

export const formatCompact = (amount: number) => compactFormatter.format(amount)

/** Convierte lo que escribe el usuario ("25.000", "$ 25000") a un entero. */
export function parseAmount(input: string): number {
  const digits = input.replace(/\D/g, '').replace(/^0+/, '')
  if (!digits) return 0
  return Math.min(Number(digits.slice(0, 12)), MAX_AMOUNT)
}
