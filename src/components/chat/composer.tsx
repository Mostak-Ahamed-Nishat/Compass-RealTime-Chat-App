import * as React from 'react'
import { Image as ImageIcon, Mic, Send } from 'lucide-react'
import { IconButton, EmojiPickerComponent } from '@/components/ui'
import { cn } from '@/lib/utils'

export interface ComposerProps {
  onSend: (text: string) => void
  onTyping?: () => void
  disabled?: boolean
  className?: string
  /** Shown as the action button in place of Send while the field is empty. */
  quickEmoji?: string
}

const MAX_TEXTAREA_HEIGHT = 120
const DEFAULT_QUICK_EMOJI = '👍'
// The API has no media upload endpoint — an image is sent as a data URL
// riding in the plain-text `text` field, so it has to be downscaled hard
// or the payload balloons far past a normal message.
const MAX_IMAGE_DIMENSION = 1024
const IMAGE_JPEG_QUALITY = 0.75

function fileToResizedDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Could not read image'))
      img.onload = () => {
        const scale = Math.min(
          1,
          MAX_IMAGE_DIMENSION / Math.max(img.width, img.height)
        )
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas not supported'))
          return
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', IMAGE_JPEG_QUALITY))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

const Composer = ({
  onSend,
  onTyping,
  disabled = false,
  className,
  quickEmoji = DEFAULT_QUICK_EMOJI,
}: ComposerProps) => {
  const [value, setValue] = React.useState('')
  const [isPreparingImage, setIsPreparingImage] = React.useState(false)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const imageInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`
  }, [value])

  const canSend = value.trim().length > 0 && !disabled

  const handleSend = () => {
    if (!canSend) return
    onSend(value.trim())
    setValue('')
  }

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.target.value)
    if (event.target.value.trim().length > 0) onTyping?.()
  }

  const handleEmojiSelect = (emoji: string) => {
    setValue((prev) => prev + emoji)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  const handleQuickEmojiSend = () => {
    if (disabled) return
    onSend(quickEmoji)
  }

  const handleImageSelected = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || disabled) return
    setIsPreparingImage(true)
    try {
      const dataUrl = await fileToResizedDataUrl(file)
      onSend(dataUrl)
    } catch {
      // Unreadable/corrupt image — nothing to send, just drop it.
    } finally {
      setIsPreparingImage(false)
    }
  }

  return (
    <div
      className={cn(
        'flex min-w-0 shrink-0 items-end gap-2 border-t border-gray-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-[#0b0b12]',
        className
      )}
    >
      <IconButton
        icon={<Mic className="h-5 w-5" />}
        label="Record voice note"
        disabled
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelected}
        className="hidden"
      />
      <IconButton
        icon={<ImageIcon className="h-5 w-5" />}
        label="Attach image"
        disabled={disabled || isPreparingImage}
        onClick={() => imageInputRef.current?.click()}
      />

      <div className="flex min-w-0 flex-1 items-end gap-1 rounded-full border border-gray-200 bg-gray-50 py-1.5 pl-4 pr-1.5 dark:border-white/10 dark:bg-white/5">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message"
          rows={1}
          disabled={disabled}
          className="min-w-0 max-h-[120px] flex-1 resize-none bg-transparent py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none disabled:cursor-not-allowed dark:text-white dark:placeholder:text-white/30"
        />
        <EmojiPickerComponent
          onEmojiSelect={handleEmojiSelect}
          size="sm"
          disabled={disabled}
        />
      </div>

      {canSend ? (
        <IconButton
          icon={<Send className="h-5 w-5" />}
          label="Send message"
          onClick={handleSend}
          className="bg-primary text-primary-foreground hover:bg-primary-hover"
        />
      ) : (
        <IconButton
          icon={<span className="text-lg leading-none">{quickEmoji}</span>}
          label={`Send ${quickEmoji}`}
          onClick={handleQuickEmojiSend}
          disabled={disabled}
        />
      )}
    </div>
  )
}

export { Composer }
