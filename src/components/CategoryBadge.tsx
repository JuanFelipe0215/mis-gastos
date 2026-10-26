import type { Category } from '../types'

export function CategoryBadge({ category, size = 'md' }: { category: Category; size?: 'sm' | 'md' }) {
  const dims = size === 'sm' ? 'h-8 w-8 text-base' : 'h-10 w-10 text-xl'
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full ${dims}`}
      style={{ backgroundColor: `${category.color}26` }}
      aria-hidden
    >
      {category.emoji}
    </span>
  )
}
