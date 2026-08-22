import * as React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { IconButton } from '@/components/ui'
import { cn } from '@/lib/utils'

export interface ChatDetailsPanelProps {
  isOpen: boolean
  onClose: () => void
  className?: string
  children?: React.ReactNode
}

const ChatDetailsPanel = ({
  isOpen,
  onClose,
  className,
  children,
}: ChatDetailsPanelProps) => {
  const shouldReduceMotion = useReducedMotion()
  const offset = shouldReduceMotion ? 0 : 24

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ opacity: 0, x: offset }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: offset }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={cn(
            'fixed inset-0 z-40 flex h-full w-full flex-col bg-white md:static md:z-auto md:h-full md:w-[320px] md:shrink-0 md:border-l md:border-gray-200',
            className
          )}
        >
          <div className="flex h-[73px] shrink-0 items-center justify-between border-b border-gray-200 px-4">
            <span className="text-sm font-semibold text-gray-900">
              Chat Details
            </span>
            <IconButton
              icon={<X className="h-5 w-5" />}
              label="Close details"
              onClick={onClose}
            />
          </div>

          <div className="flex-1 overflow-y-auto">{children}</div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

export { ChatDetailsPanel }
