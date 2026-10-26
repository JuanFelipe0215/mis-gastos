const needsQuotes = /[";,\n\r]/

function escapeCell(value: string): string {
  return needsQuotes.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

/** Usa ";" por defecto: Excel en español (coma decimal) lo abre en columnas sin configurar nada. */
export function toCSV(rows: string[][], delimiter = ';'): string {
  return rows.map((row) => row.map(escapeCell).join(delimiter)).join('\r\n')
}

function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? ''
  const semicolons = firstLine.split(';').length
  const commas = firstLine.split(',').length
  return semicolons >= commas ? ';' : ','
}

/** Parser RFC 4180 (comillas, saltos de línea dentro de celdas). Detecta ";" o ",". */
export function parseCSV(input: string): string[][] {
  const text = input.replace(/^\uFEFF/, '')
  const delimiter = detectDelimiter(text)
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          cell += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cell += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === delimiter) {
      row.push(cell)
      cell = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else {
      cell += char
    }
  }
  if (cell !== '' || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ''))
}
