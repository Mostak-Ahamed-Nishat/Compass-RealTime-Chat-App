import * as React from 'react'
import { Image as ImageIcon, Mic, Send, Smile } from 'lucide-react'
import { IconButton } from '@/components/ui'
import { cn } from '@/lib/utils'

export interface ComposerProps {
  onSend: (text: string) => void
  disabled?: boolean
  className?: string
}

const MAX_TEXTAREA_HEIGHT = 120

const Composer = ({ onSend, disabled = false, className }: ComposerProps) => {
  const [value, setValue] = React.useState('')
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-end gap-2 border-t border-gray-200 bg-white px-4 py-3',
        className
      )}
    >
      <IconButton
        icon={<Mic className="h-5 w-5" />}
        label="Record voice note"
        disabled
      />
      <IconButton
        icon={<ImageIcon className="h-5 w-5" />}
        label="Attach image"
        disabled
      />

      <div className="flex flex-1 items-end gap-1 rounded-full border border-gray-200 bg-gray-50 py-1.5 pl-4 pr-1.5">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message"
          rows={1}
          disabled={disabled}
          className="max-h-[120px] flex-1 resize-none bg-transparent py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none disabled:cursor-not-allowed"
        />
        <IconButton
          icon={<Smile className="h-5 w-5" />}
          label="Emoji"
          size="sm"
          disabled
        />
      </div>

      <IconButton
        icon={<Send className="h-5 w-5" />}
        label="Send message"
        onClick={handleSend}
        disabled={!canSend}
        className={cn(
          canSend && 'bg-primary text-primary-foreground hover:bg-primary-hover'
        )}
      />
    </div>
  )
}

export { Composer }
