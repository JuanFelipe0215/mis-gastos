import { useEffect, useState } from 'react'
import { useExpenseCount } from '../../db/hooks'

interface Info {
  persisted: boolean | null
  usage: number | null
}

const formatBytes = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`

export function StorageInfo() {
  const count = useExpenseCount()
  const [info, setInfo] = useState<Info>({ persisted: null, usage: null })

  useEffect(() => {
    const storage = navigator.storage
    if (!storage) return
    Promise.all([storage.persisted?.() ?? null, storage.estimate?.() ?? null]).then(([persisted, estimate]) =>
      setInfo({ persisted, usage: estimate?.usage ?? null }),
    )
  }, [count])

  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-white px-4 py-3 text-sm shadow-sm dark:bg-zinc-900">
      <Row label="Gastos registrados" value={String(count)} />
      {info.usage !== null && <Row label="Espacio usado" value={formatBytes(info.usage)} />}
      {info.persisted !== null && (
        <Row label="Almacenamiento persistente" value={info.persisted ? 'Sí' : 'No (el navegador podría borrarlo)'} />
      )}
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Tus datos viven solo en este navegador. En iPhone, instala la app en la pantalla de inicio para que Safari no los borre.
      </p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}
