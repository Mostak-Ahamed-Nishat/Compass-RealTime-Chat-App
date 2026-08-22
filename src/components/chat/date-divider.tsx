import * as React from 'react'

export interface DateDividerProps {
  label: string
}

const DateDivider = ({ label }: DateDividerProps) => (
  <div className="flex items-center gap-3 px-4 py-3">
    <div className="h-px flex-1 bg-gray-200" />
    <span className="shrink-0 text-xs font-medium text-secondary">{label}</span>
    <div className="h-px flex-1 bg-gray-200" />
  </div>
)

export { DateDivider }
