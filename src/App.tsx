import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { BottomSheet } from './components/BottomSheet'
import { NavBar, type Tab } from './components/NavBar'
import { requestPersistentStorage } from './db/db'
import { ExpenseForm } from './features/expenses/ExpenseForm'
import { useTheme } from './hooks/useTheme'
import { HistoryPage } from './pages/HistoryPage'
import { HomePage } from './pages/HomePage'
import { SettingsPage } from './pages/SettingsPage'
import type { Expense } from './types'

const SummaryPage = lazy(() => import('./pages/SummaryPage').then((m) => ({ default: m.SummaryPage })))

interface SheetState {
  open: boolean
  expense?: Expense
  key: number
}

export default function App() {
  useTheme()
  const [tab, setTab] = useState<Tab>('home')
  const [focusBackup, setFocusBackup] = useState(false)
  const [sheet, setSheet] = useState<SheetState>({ open: false, key: 0 })

  useEffect(() => {
    requestPersistentStorage().catch(() => {})
  }, [])

  const openSheet = (expense?: Expense) => setSheet((s) => ({ open: true, expense, key: s.key + 1 }))
  const closeSheet = useCallback(() => setSheet((s) => ({ ...s, open: false })), [])

  const changeTab = (next: Tab) => {
    setFocusBackup(false)
    setTab(next)
    window.scrollTo({ top: 0 })
  }

  return (
    <>
      <main className="mx-auto min-h-dvh max-w-md px-4 pb-32">
        {tab === 'home' && (
          <HomePage
            onSelect={openSheet}
            onGoToBackup={() => {
              setTab('settings')
              setFocusBackup(true)
            }}
          />
        )}
        {tab === 'history' && <HistoryPage onSelect={openSheet} />}
        {tab === 'summary' && (
          <Suspense fallback={null}>
            <SummaryPage onSelect={openSheet} />
          </Suspense>
        )}
        {tab === 'settings' && <SettingsPage focusBackup={focusBackup} />}
      </main>

      <NavBar tab={tab} onChange={changeTab} onAdd={() => openSheet()} />

      <BottomSheet open={sheet.open} onClose={closeSheet} title={sheet.expense ? 'Editar gasto' : 'Nuevo gasto'}>
        <ExpenseForm key={sheet.key} expense={sheet.expense} onDone={closeSheet} />
      </BottomSheet>
    </>
  )
}
