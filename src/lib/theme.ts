import * as React from 'react'

const THEME_STORAGE_KEY = 'compass-theme'

// Dark mode follows the landing page's own palette (#0b0b12 background,
// primary/accent as the only colored accents) rather than a generic
// inverted-gray theme, so the in-app look stays consistent with Part 2.
export function useTheme() {
  const [isDark, setIsDark] = React.useState(false)

  React.useEffect(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDark(stored ? stored === 'dark' : prefersDark)
  }, [])

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  const toggleTheme = React.useCallback(() => {
    setIsDark((prev) => {
      const next = !prev
      window.localStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light')
      return next
    })
  }, [])

  return { isDark, toggleTheme }
}

export interface ChatThemeSwatch {
  id: string
  label: string
  color: string
}

export const CHAT_THEME_SWATCHES: ChatThemeSwatch[] = [
  { id: 'default', label: 'Default', color: '#5347ac' },
  { id: 'teal', label: 'Teal', color: '#0f766e' },
  { id: 'rose', label: 'Rose', color: '#be185d' },
  { id: 'amber', label: 'Amber', color: '#b45309' },
  { id: 'blue', label: 'Blue', color: '#1d4ed8' },
  { id: 'green', label: 'Green', color: '#15803d' },
]
