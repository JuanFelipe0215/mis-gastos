import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { ToastContext, type ShowToast, type ToastAction } from './toastContext'

interface ToastState {
  id: number
  message: string
  action?: ToastAction
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null)
  const counter = useRef(0)

  const show = useCallback<ShowToast>((message, action) => {
    counter.current += 1
    setToast({ id: counter.current, message, action })
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), toast.action ? 5000 : 2500)
    return () => clearTimeout(timer)
  }, [toast])

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4" role="status">
          <div
            key={toast.id}
            className="animate-fade-in pointer-events-auto flex max-w-md items-center gap-4 rounded-2xl bg-zinc-900 px-4 py-3 text-sm text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900"
          >
            <span>{toast.message}</span>
            {toast.action && (
              <button
                type="button"
                className="font-semibold text-emerald-400 dark:text-emerald-700"
                onClick={() => {
                  toast.action!.onClick()
                  setToast(null)
                }}
              >
                {toast.action.label}
              </button>
            )}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}
