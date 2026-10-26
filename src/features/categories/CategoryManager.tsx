import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { CategoryBadge } from '../../components/CategoryBadge'
import { useToast } from '../../components/toastContext'
import { CATEGORY_COLORS, FALLBACK_CATEGORY_ID } from '../../db/defaults'
import { useCategories } from '../../db/hooks'
import type { Category } from '../../types'
import { addCategory, countExpensesInCategory, deleteCategory, updateCategory, type CategoryInput } from './api'

interface EditorProps {
  initial?: Category
  onSave: (input: CategoryInput) => Promise<void>
  onCancel: () => void
}

function CategoryEditor({ initial, onSave, onCancel }: EditorProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [emoji, setEmoji] = useState(initial?.emoji ?? '🏷️')
  const [color, setColor] = useState(initial?.color ?? CATEGORY_COLORS[0])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    await onSave({ name, emoji: emoji.trim() || '🏷️', color })
  }

  const input = 'rounded-xl bg-zinc-100 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800'

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 px-4 py-3">
      <div className="flex gap-2">
        <input
          aria-label="Emoji"
          value={emoji}
          maxLength={8}
          onChange={(e) => setEmoji(e.target.value)}
          className={`${input} w-14 text-center text-xl`}
        />
        <input
          aria-label="Nombre de la categoría"
          placeholder="Nombre"
          value={name}
          maxLength={40}
          autoFocus
          onChange={(e) => setName(e.target.value)}
          className={`${input} min-w-0 flex-1`}
        />
      </div>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Color">
        {CATEGORY_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={c === color}
            aria-label={c}
            onClick={() => setColor(c)}
            className={`h-7 w-7 rounded-full ${c === color ? 'ring-2 ring-zinc-900 ring-offset-2 dark:ring-white dark:ring-offset-zinc-900' : ''}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      <div className="flex justify-end gap-2 text-sm font-medium">
        <button type="button" onClick={onCancel} className="rounded-xl px-4 py-2 text-zinc-600 dark:text-zinc-300">
          Cancelar
        </button>
        <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2 text-white disabled:opacity-50" disabled={!name.trim()}>
          Guardar
        </button>
      </div>
    </form>
  )
}

export function CategoryManager() {
  const categories = useCategories()
  const toast = useToast()
  const [editing, setEditing] = useState<string | 'new' | null>(null)

  const remove = async (category: Category) => {
    const count = await countExpensesInCategory(category.id)
    const message = count
      ? `¿Eliminar "${category.name}"? Sus ${count} gastos pasarán a "Otros".`
      : `¿Eliminar "${category.name}"?`
    if (!window.confirm(message)) return
    await deleteCategory(category.id)
    toast('Categoría eliminada')
  }

  return (
    <div className="divide-y divide-zinc-100 overflow-hidden rounded-2xl bg-white shadow-sm dark:divide-zinc-800 dark:bg-zinc-900">
      {categories.map((c) =>
        editing === c.id ? (
          <CategoryEditor
            key={c.id}
            initial={c}
            onCancel={() => setEditing(null)}
            onSave={async (input) => {
              await updateCategory(c.id, input)
              setEditing(null)
            }}
          />
        ) : (
          <div key={c.id} className="flex items-center gap-3 px-4 py-2.5">
            <CategoryBadge category={c} size="sm" />
            <span className="flex-1 font-medium">{c.name}</span>
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color }} aria-hidden />
            <button
              type="button"
              onClick={() => setEditing(c.id)}
              aria-label={`Editar ${c.name}`}
              className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <Pencil size={16} />
            </button>
            <button
              type="button"
              onClick={() => remove(c)}
              disabled={c.id === FALLBACK_CATEGORY_ID}
              aria-label={`Eliminar ${c.name}`}
              className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 disabled:invisible dark:hover:bg-zinc-800"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      )}
      {editing === 'new' ? (
        <CategoryEditor
          onCancel={() => setEditing(null)}
          onSave={async (input) => {
            await addCategory(input)
            setEditing(null)
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400"
        >
          <Plus size={18} /> Nueva categoría
        </button>
      )}
    </div>
  )
}
