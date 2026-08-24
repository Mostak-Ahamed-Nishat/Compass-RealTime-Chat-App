import * as React from 'react'
import { cn } from '@/lib/utils'

export interface PillTabOption<T extends string> {
  key: T
  label: string
}

export interface PillTabsProps<T extends string> {
  options: PillTabOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}

function PillTabsInner<T extends string>(
  { options, value, onChange, className }: PillTabsProps<T>,
  ref: React.Ref<HTMLDivElement>
) {
  return (
    <div ref={ref} role="tablist" className={cn('flex items-center gap-1.5', className)}>
      {options.map((option) => {
        const isActive = option.key === value
        return (
          <button
            key={option.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.key)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 text-secondary hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15'
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

const PillTabs = React.forwardRef(PillTabsInner) as <T extends string>(
  props: PillTabsProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement

export { PillTabs }
