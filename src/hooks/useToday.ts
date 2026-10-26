import { useEffect, useState } from 'react'
import { todayISO } from '../lib/dates'

/** Fecha de hoy que se actualiza si la app queda abierta de un día para otro. */
export function useToday(): string {
  const [today, setToday] = useState(todayISO)
  useEffect(() => {
    const refresh = () => setToday(todayISO())
    const timer = setInterval(refresh, 60_000)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])
  return today
}
