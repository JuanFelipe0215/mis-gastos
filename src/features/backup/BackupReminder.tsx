import { ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import { useExpenseCount } from '../../db/hooks'
import { getLastBackupAt } from '../../lib/prefs'

const REMIND_AFTER_DAYS = 15
const DAY_MS = 86_400_000

export function BackupReminder({ onGoToBackup }: { onGoToBackup: () => void }) {
  const count = useExpenseCount()
  const [days] = useState(() => {
    const lastBackupAt = getLastBackupAt()
    return lastBackupAt ? Math.floor((Date.now() - lastBackupAt) / DAY_MS) : null
  })
  if (count === 0) return null
  if (days !== null && days < REMIND_AFTER_DAYS) return null

  return (
    <button
      type="button"
      onClick={onGoToBackup}
      className="flex w-full items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-left text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
    >
      <ShieldAlert size={20} className="shrink-0" />
      <span>
        {days === null ? 'Aún no has hecho un respaldo.' : `Tu último respaldo fue hace ${days} días.`}{' '}
        <span className="font-semibold underline">Exportar ahora</span>
      </span>
    </button>
  )
}
