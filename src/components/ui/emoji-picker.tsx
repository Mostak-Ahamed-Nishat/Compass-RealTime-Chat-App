'use client'

import * as React from 'react'
import { useState, useRef, useEffect, useCallback, Suspense } from 'react'
import { createPortal } from 'react-dom'
import dynamic from 'next/dynamic'
import { Smile } from 'lucide-react'
import { cn } from '@/lib/utils'

const EmojiPicker = dynamic(() => import('emoji-picker-react'), {
  ssr: false,
})

interface EmojiPickerComponentProps {
  onEmojiSelect: (emoji: string) => void
  className?: string
  size?: 'sm' | 'default' | 'lg'
  disabled?: boolean
  /** Close the popover after picking one emoji. Default true (composer use). */
  closeOnSelect?: boolean
}

const PICKER_WIDTH = 320
const PICKER_HEIGHT = 400
const VIEWPORT_MARGIN = 8

const EmojiPickerComponent = React.forwardRef<
  HTMLButtonElement,
  EmojiPickerComponentProps
>(
  (
    {
      onEmojiSelect,
      className,
      size = 'default',
      disabled = false,
      closeOnSelect = true,
    },
    forwardedRef
  ) => {
  const [showPicker, setShowPicker] = useState(false)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null
  )
  const pickerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  React.useImperativeHandle(
    forwardedRef,
    () => buttonRef.current as HTMLButtonElement
  )

  // Computed in viewport coordinates so the picker — rendered via portal —
  // is never clipped by a scrollable ancestor (e.g. the Chat Details panel).
  const updatePosition = useCallback(() => {
    const button = buttonRef.current
    if (!button) return
    const rect = button.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const openUpward = spaceBelow < PICKER_HEIGHT + 16 && rect.top > PICKER_HEIGHT

    const top = openUpward
      ? rect.top - PICKER_HEIGHT - VIEWPORT_MARGIN
      : rect.bottom + VIEWPORT_MARGIN
    const left = rect.right - PICKER_WIDTH

    setPosition({
      top: Math.min(
        Math.max(top, VIEWPORT_MARGIN),
        window.innerHeight - PICKER_HEIGHT - VIEWPORT_MARGIN
      ),
      left: Math.min(
        Math.max(left, VIEWPORT_MARGIN),
        window.innerWidth - PICKER_WIDTH - VIEWPORT_MARGIN
      ),
    })
  }, [])

  useEffect(() => {
    if (!showPicker) return
    updatePosition()

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
    const handleReposition = () => updatePosition()

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('resize', handleReposition)
    window.addEventListener('scroll', handleReposition, true)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('resize', handleReposition)
      window.removeEventListener('scroll', handleReposition, true)
    }
  }, [showPicker, updatePosition])

  const sizeClasses: Record<string, string> = {
    sm: 'h-7 w-7',
    default: 'h-9 w-9',
    lg: 'h-10 w-10',
  }

  const handleEmojiClick = (emojiData: any) => {
    onEmojiSelect(emojiData.emoji)
    if (closeOnSelect) setShowPicker(false)
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label="Select emoji"
        disabled={disabled}
        onClick={() => setShowPicker((v) => !v)}
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full text-secondary transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
          sizeClasses[size],
          className
        )}
      >
        <Smile className="h-4 w-4" />
      </button>

      {showPicker &&
        position &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={pickerRef}
            style={{
              position: 'fixed',
              top: position.top,
              left: position.left,
              zIndex: 60,
            }}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
          >
            <Suspense fallback={null}>
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                width={PICKER_WIDTH}
                height={PICKER_HEIGHT}
                previewConfig={{ showPreview: false }}
                skinTonesDisabled
              />
            </Suspense>
          </div>,
          document.body
        )}
    </>
  )
})

EmojiPickerComponent.displayName = 'EmojiPicker'

export { EmojiPickerComponent }
