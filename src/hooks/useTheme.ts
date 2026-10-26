import { useEffect, useState } from 'react'
import { getTheme, setTheme as saveTheme, type ThemePref } from '../lib/prefs'

const media = () => window.matchMedia('(prefers-color-scheme: dark)')

function applyTheme(theme: ThemePref) {
  const dark = theme === 'dark' || (theme === 'system' && media().matches)
  document.documentElement.classList.toggle('dark', dark)
}

export function useTheme(): [ThemePref, (theme: ThemePref) => void] {
  const [theme, setThemeState] = useState<ThemePref>(getTheme)

  useEffect(() => {
    applyTheme(theme)
    if (theme !== 'system') return
    const mq = media()
    const onChange = () => applyTheme('system')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [theme])

  const setTheme = (next: ThemePref) => {
    saveTheme(next)
    setThemeState(next)
  }

  return [theme, setTheme]
}
