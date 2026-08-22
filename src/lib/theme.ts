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
