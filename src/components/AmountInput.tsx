import { forwardRef } from 'react'
import { formatThousands, parseAmount } from '../lib/money'

interface Props {
  value: number
  onChange: (value: number) => void
  autoFocus?: boolean
}

export const AmountInput = forwardRef<HTMLInputElement, Props>(function AmountInput({ value, onChange, autoFocus }, ref) {
  return (
    <label className="flex items-baseline justify-center gap-1 rounded-2xl bg-zinc-100 px-4 py-4 focus-within:ring-2 focus-within:ring-emerald-500 dark:bg-zinc-800">
      <span className="text-3xl font-semibold text-zinc-400">$</span>
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        pattern="[0-9.]*"
        enterKeyHint="done"
        autoComplete="off"
        autoFocus={autoFocus}
        aria-label="Monto"
        placeholder="0"
        className="w-full min-w-0 bg-transparent text-center text-4xl font-bold tabular-nums outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
        value={value ? formatThousands(value) : ''}
        onChange={(e) => onChange(parseAmount(e.target.value))}
      />
    </label>
  )
})
