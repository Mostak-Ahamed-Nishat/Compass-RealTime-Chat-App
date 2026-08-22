import * as React from 'react'
import { MessageCircle, Phone, Settings, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type MobileTab = 'chats' | 'contacts' | 'calls' | 'settings'

const TABS: { key: MobileTab; label: string; icon: LucideIcon }[] = [
  { key: 'chats', label: 'Chats', icon: MessageCircle },
  { key: 'contacts', label: 'Contacts', icon: Users },
  { key: 'calls', label: 'Calls', icon: Phone },
  { key: 'settings', label: 'Settings', icon: Settings },
]

export interface MobileTabBarProps {
  active: MobileTab
  onChange: (tab: MobileTab) => void
  className?: string
}

const MobileTabBar = ({ active, onChange, className }: MobileTabBarProps) => (
  <nav
    className={cn(
      'flex shrink-0 items-center justify-around border-t border-gray-200 bg-white py-2',
      className
    )}
  >
    {TABS.map(({ key, label, icon: Icon }) => {
      const isActive = key === active
      return (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={cn(
            'flex flex-col items-center gap-1 px-3 py-1 text-xs font-medium transition-colors',
            isActive ? 'text-primary' : 'text-secondary'
          )}
        >
          <Icon className="h-5 w-5" />
          {label}
        </button>
      )
    })}
  </nav>
)

export { MobileTabBar }
