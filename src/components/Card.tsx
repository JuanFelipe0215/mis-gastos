import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900 ${className}`}>{children}</div>
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 px-6 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
      {children}
    </div>
  )
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="pt-[max(1rem,env(safe-area-inset-top))] pb-2">
      <h1 className="text-2xl font-bold">{title}</h1>
      {subtitle && <p className="text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
    </header>
  )
}
