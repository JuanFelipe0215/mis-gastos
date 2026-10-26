import { useEffect, useRef, type ReactNode } from 'react'
import { PageHeader } from '../components/Card'
import { SegmentedControl } from '../components/SegmentedControl'
import { BackupSection } from '../features/backup/BackupSection'
import { StorageInfo } from '../features/backup/StorageInfo'
import { CategoryManager } from '../features/categories/CategoryManager'
import { useTheme } from '../hooks/useTheme'
import type { ThemePref } from '../lib/prefs'

const THEMES: { value: ThemePref; label: string }[] = [
  { value: 'system', label: 'Sistema' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
]

function Section({ title, children, sectionRef }: { title: string; children: ReactNode; sectionRef?: React.Ref<HTMLElement> }) {
  return (
    <section ref={sectionRef} className="flex scroll-mt-4 flex-col gap-2">
      <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{title}</h2>
      {children}
    </section>
  )
}

export function SettingsPage({ focusBackup }: { focusBackup: boolean }) {
  const [theme, setTheme] = useTheme()
  const backupRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (focusBackup) backupRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [focusBackup])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Ajustes" />
      <Section title="Tema">
        <SegmentedControl value={theme} options={THEMES} onChange={setTheme} />
      </Section>
      <Section title="Respaldo" sectionRef={backupRef}>
        <BackupSection />
      </Section>
      <Section title="Categorías">
        <CategoryManager />
      </Section>
      <Section title="Almacenamiento">
        <StorageInfo />
      </Section>
    </div>
  )
}
