const PREFIX = 'mg:'

function read(key: string): string | null {
  try {
    return localStorage.getItem(PREFIX + key)
  } catch {
    return null
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(PREFIX + key, value)
  } catch {
    // Modo privado o almacenamiento lleno: las preferencias no son críticas.
  }
}

export type ThemePref = 'system' | 'light' | 'dark'

export const getTheme = (): ThemePref => {
  const value = read('theme')
  return value === 'light' || value === 'dark' ? value : 'system'
}
export const setTheme = (theme: ThemePref) => write('theme', theme)

export const getLastCategory = () => read('lastCategory')
export const setLastCategory = (id: string) => write('lastCategory', id)

export const getLastBackupAt = (): number | null => {
  const value = Number(read('lastBackupAt'))
  return Number.isFinite(value) && value > 0 ? value : null
}
export const setLastBackupAt = (timestamp: number) => write('lastBackupAt', String(timestamp))
