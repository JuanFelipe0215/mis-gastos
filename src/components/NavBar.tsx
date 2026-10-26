import { BarChart3, House, List, Plus, Settings } from 'lucide-react'
import type { ComponentType } from 'react'

export type Tab = 'home' | 'history' | 'summary' | 'settings'

interface Props {
  tab: Tab
  onChange: (tab: Tab) => void
  onAdd: () => void
}

const ITEMS: { tab: Tab; label: string; Icon: ComponentType<{ size?: number }> }[] = [
  { tab: 'home', label: 'Inicio', Icon: House },
  { tab: 'history', label: 'Historial', Icon: List },
  { tab: 'summary', label: 'Resumen', Icon: BarChart3 },
  { tab: 'settings', label: 'Ajustes', Icon: Settings },
]

export function NavBar({ tab, onChange, onAdd }: Props) {
  const renderItem = ({ tab: itemTab, label, Icon }: (typeof ITEMS)[number]) => (
    <button
      key={itemTab}
      type="button"
      onClick={() => onChange(itemTab)}
      aria-current={tab === itemTab ? 'page' : undefined}
      className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
        tab === itemTab ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400'
      }`}
    >
      <Icon size={22} />
      {label}
    </button>
  )

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex max-w-md items-center px-2">
        {ITEMS.slice(0, 2).map(renderItem)}
        <div className="flex flex-1 justify-center">
          <button
            type="button"
            onClick={onAdd}
            aria-label="Agregar gasto"
            className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 active:scale-95"
          >
            <Plus size={28} strokeWidth={2.5} />
          </button>
        </div>
        {ITEMS.slice(2).map(renderItem)}
      </div>
    </nav>
  )
}
