import { create } from 'zustand'

type ThemeMode = 'light' | 'dark'

const THEME_STORAGE_KEY = 'theme'

interface ThemeState {
  theme: ThemeMode
  initialized: boolean
  initializeTheme: () => void
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
}

function applyTheme(theme: ThemeMode) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export const useThemeStore = create<ThemeState>()((set, get) => ({
  theme: 'dark',
  initialized: false,
  initializeTheme: () => {
    if (typeof window === 'undefined') return

    const root = document.documentElement
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches

    const nextTheme: ThemeMode =
      savedTheme === 'dark' || savedTheme === 'light'
        ? savedTheme
        : root.classList.contains('dark') || prefersDark
          ? 'dark'
          : 'light'

    applyTheme(nextTheme)
    set({ theme: nextTheme, initialized: true })
  },
  setTheme: (theme) => {
    applyTheme(theme)

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    }

    set({ theme, initialized: true })
  },
  toggleTheme: () => {
    const nextTheme: ThemeMode = get().theme === 'dark' ? 'light' : 'dark'
    get().setTheme(nextTheme)
  },
}))
