import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  label: string
  onPrev: () => void
  onNext: () => void
  nextDisabled?: boolean
}

export function PeriodNavigator({ label, onPrev, onNext, nextDisabled }: Props) {
  const btn =
    'flex h-10 w-10 items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-200 disabled:opacity-30 disabled:hover:bg-transparent dark:text-zinc-300 dark:hover:bg-zinc-800'
  return (
    <div className="flex items-center justify-between">
      <button type="button" className={btn} onClick={onPrev} aria-label="Período anterior">
        <ChevronLeft size={22} />
      </button>
      <span className="font-medium">{label}</span>
      <button type="button" className={btn} onClick={onNext} disabled={nextDisabled} aria-label="Período siguiente">
        <ChevronRight size={22} />
      </button>
    </div>
  )
}
