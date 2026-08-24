import * as React from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'

export interface ImageLightboxProps {
  src: string | null
  onClose: () => void
}

// Messenger-style full-screen photo viewer: dark overlay, image centered
// and scaled to fit, dismiss via backdrop click, close button, or Escape.
const ImageLightbox = ({ src, onClose }: ImageLightboxProps) => {
  const shouldReduceMotion = useReducedMotion()

  React.useEffect(() => {
    if (!src) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [src, onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {src && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-6"
          onClick={onClose}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="h-5 w-5" />
          </button>
          <motion.img
            src={src}
            alt="Shared image"
            initial={{ scale: shouldReduceMotion ? 1 : 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: shouldReduceMotion ? 1 : 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export { ImageLightbox }
