import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ConversationAvatar } from './conversation-avatar'

export interface TypingIndicatorProps {
  name: string
}

const DOTS = [0, 1, 2]

const TypingIndicator = ({ name }: TypingIndicatorProps) => {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="flex items-end gap-2 px-4 py-1"
    >
      <ConversationAvatar name={name} size="sm" />
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-[#15151d]">
        {DOTS.map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-white/40"
            animate={
              shouldReduceMotion
                ? { opacity: [0.3, 1, 0.3] }
                : { y: [0, -4, 0] }
            }
            transition={{
              duration: 0.9,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

export { TypingIndicator }
