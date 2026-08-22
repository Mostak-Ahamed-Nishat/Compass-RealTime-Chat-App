'use client'

import * as React from 'react'
import { useState, useRef, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Smile } from 'lucide-react'
import { cn } from '@/lib/utils'

const EmojiPicker = dynamic(
  () => import('emoji-picker-react').then((mod) => mod.EmojiPicker),
  { ssr: false }
)

interface EmojiPickerComponentProps {
  onEmojiSelect: (emoji: string) => void
  className?: string
  size?: 'sm' | 'default' | 'lg'
  disabled?: boolean
}

const EmojiPickerComponent = React.forwardRef<
  HTMLButtonElement,
  EmojiPickerComponentProps
>(({ onEmojiSelect, className, size = 'default', disabled = false }, ref) => {
  const [showPicker, setShowPicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false)
      }
    }

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPicker])

  const sizeClasses: Record<string, string> = {
    sm: 'h-7 w-7',
    default: 'h-9 w-9',
    lg: 'h-10 w-10',
  }

  const handleEmojiClick = (emojiData: any) => {
    onEmojiSelect(emojiData.emoji)
    setShowPicker(false)
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef || ref}
        type="button"
        aria-label="Select emoji"
        disabled={disabled}
        onClick={() => setShowPicker(!showPicker)}
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full text-secondary transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
          sizeClasses[size],
          className
        )}
      >
        <Smile className="h-4 w-4" />
      </button>

      {showPicker && (
        <div
          ref={pickerRef}
          className="absolute bottom-full right-0 z-50 mb-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
        >
          <Suspense fallback={null}>
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              width={320}
              height={400}
              previewConfig={{ showPreview: false }}
              skinTonePickerLocation="NONE"
            />
          </Suspense>
        </div>
      )}
    </div>
  )
})

EmojiPickerComponent.displayName = 'EmojiPicker'

export { EmojiPickerComponent }
