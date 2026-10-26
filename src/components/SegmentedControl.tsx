interface Props<T extends string> {
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}

export function SegmentedControl<T extends string>({ value, options, onChange }: Props<T>) {
  return (
    <div className="flex rounded-xl bg-zinc-200/70 p-1 dark:bg-zinc-800" role="tablist">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          onClick={() => onChange(option.value)}
          className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors ${
            value === option.value
              ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
