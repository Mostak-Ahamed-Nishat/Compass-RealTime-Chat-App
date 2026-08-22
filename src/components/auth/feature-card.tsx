import * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FeatureCardProps {
  icon: LucideIcon
  title: string
  subtitle: string
  accent?: boolean
}

const FeatureCard = ({ icon: Icon, title, subtitle, accent }: FeatureCardProps) => (
  <div className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm">
    <Icon className={cn('h-5 w-5', accent ? 'text-accent' : 'text-white')} />
    <p className="mt-2 text-sm font-semibold text-white">{title}</p>
    <p className="text-xs text-white/60">{subtitle}</p>
  </div>
)

export { FeatureCard }
