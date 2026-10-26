import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { CategoryBadge } from '../../components/CategoryBadge'
import { useCategoryLookup } from '../../db/hooks'
import { formatCOP } from '../../lib/money'
import type { CategoryTotal } from '../../lib/summary'

export function CategoryBreakdown({ totals }: { totals: CategoryTotal[] }) {
  const lookup = useCategoryLookup()
  const data = totals.map((t) => ({ ...t, category: lookup(t.categoryId) }))

  return (
    <div className="flex flex-col gap-4">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="categoryId"
              innerRadius="62%"
              outerRadius="95%"
              paddingAngle={data.length > 1 ? 2 : 0}
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((d) => (
                <Cell key={d.categoryId} fill={d.category.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex flex-col gap-3">
        {data.map((d) => (
          <li key={d.categoryId} className="flex items-center gap-3">
            <CategoryBadge category={d.category} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="truncate font-medium">{d.category.name}</span>
                <span className="font-semibold tabular-nums">{formatCOP(d.total)}</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div className="h-full rounded-full" style={{ width: `${d.percent}%`, backgroundColor: d.category.color }} />
                </div>
                <span className="w-10 text-right text-xs tabular-nums text-zinc-500">{Math.round(d.percent)}%</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
