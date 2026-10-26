import { Download, FileSpreadsheet, Upload } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'
import { useToast } from '../../components/toastContext'
import { db } from '../../db/db'
import { todayISO } from '../../lib/dates'
import { downloadFile } from '../../lib/download'
import { getLastBackupAt, setLastBackupAt } from '../../lib/prefs'
import {
  applyImport,
  expensesToCSV,
  ImportError,
  parseCSVBackup,
  parseJSONBackup,
  readAllData,
  serializeBackup,
  type BackupData,
  type ImportMode,
} from './backup'

export function BackupSection() {
  const toast = useToast()
  const fileInput = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<{ name: string; data: BackupData } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastBackupAt, setLastBackup] = useState(getLastBackupAt)

  const exportJSON = async () => {
    downloadFile(`mis-gastos-${todayISO()}.json`, serializeBackup(await readAllData()), 'application/json')
    const now = Date.now()
    setLastBackupAt(now)
    setLastBackup(now)
    toast('Respaldo descargado')
  }

  const exportCSV = async () => {
    downloadFile(`mis-gastos-${todayISO()}.csv`, expensesToCSV(await readAllData()), 'text/csv;charset=utf-8')
    toast('CSV descargado')
  }

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(null)
    try {
      const text = await file.text()
      const isCSV = file.name.toLowerCase().endsWith('.csv') || !text.trimStart().startsWith('{')
      const data = isCSV ? parseCSVBackup(text, await db.categories.toArray()) : parseJSONBackup(text)
      setPending({ name: file.name, data })
    } catch (err) {
      setError(err instanceof ImportError ? err.message : 'No se pudo leer el archivo.')
    }
  }

  const confirmImport = async (mode: ImportMode) => {
    if (!pending) return
    if (mode === 'replace' && !window.confirm('Esto borrará todos tus gastos actuales y los reemplazará. ¿Seguro?')) return
    const result = await applyImport(pending.data, mode)
    setPending(null)
    toast(`${result.expenses} gastos importados`)
  }

  const button =
    'flex w-full items-center gap-3 px-4 py-3 text-left font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800/50'

  return (
    <div className="flex flex-col gap-2">
      <div className="divide-y divide-zinc-100 overflow-hidden rounded-2xl bg-white shadow-sm dark:divide-zinc-800 dark:bg-zinc-900">
        <button type="button" className={button} onClick={exportJSON}>
          <Download size={20} className="text-emerald-600" />
          <span className="flex-1">
            Exportar respaldo (JSON)
            <span className="block text-xs font-normal text-zinc-500 dark:text-zinc-400">
              Copia completa con categorías. Úsala para restaurar.
            </span>
          </span>
        </button>
        <button type="button" className={button} onClick={exportCSV}>
          <FileSpreadsheet size={20} className="text-emerald-600" />
          <span className="flex-1">
            Exportar a Excel (CSV)
            <span className="block text-xs font-normal text-zinc-500 dark:text-zinc-400">Separado por punto y coma.</span>
          </span>
        </button>
        <button type="button" className={button} onClick={() => fileInput.current?.click()}>
          <Upload size={20} className="text-emerald-600" />
          <span className="flex-1">
            Importar archivo
            <span className="block text-xs font-normal text-zinc-500 dark:text-zinc-400">JSON de respaldo o CSV.</span>
          </span>
        </button>
        <input ref={fileInput} type="file" accept=".json,.csv,application/json,text/csv" className="hidden" onChange={onFile} />
      </div>

      <p className="px-1 text-xs text-zinc-500 dark:text-zinc-400">
        {lastBackupAt
          ? `Último respaldo: ${new Date(lastBackupAt).toLocaleDateString('es-CO', { dateStyle: 'long' })}`
          : 'Aún no has hecho ningún respaldo.'}
      </p>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}

      {pending && (
        <div className="flex flex-col gap-3 rounded-2xl bg-emerald-50 p-4 text-sm dark:bg-emerald-950/40">
          <p>
            <strong>{pending.name}</strong>: {pending.data.expenses.length} gastos y {pending.data.categories.length} categorías.
            ¿Cómo quieres importarlo?
          </p>
          <div className="flex flex-wrap gap-2 font-medium">
            <button type="button" className="rounded-xl bg-emerald-600 px-4 py-2 text-white" onClick={() => confirmImport('merge')}>
              Combinar
            </button>
            <button type="button" className="rounded-xl bg-red-600 px-4 py-2 text-white" onClick={() => confirmImport('replace')}>
              Reemplazar todo
            </button>
            <button type="button" className="rounded-xl px-4 py-2 text-zinc-600 dark:text-zinc-300" onClick={() => setPending(null)}>
              Cancelar
            </button>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Combinar agrega lo nuevo y actualiza los gastos que ya existían (sin duplicar).
          </p>
        </div>
      )}
    </div>
  )
}
