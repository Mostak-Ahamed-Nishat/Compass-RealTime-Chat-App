import * as React from 'react'
import { Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage, PresenceIndicator } from '@/components/ui'
import { cn, getInitials } from '@/lib/utils'

export interface ConversationAvatarProps {
  name: string
  imageUrl?: string
  size?: 'sm' | 'md' | 'lg'
  ring?: 'none' | 'primary' | 'accent'
  // undefined = no presence signal at all — renders no dot, never a
  // fake default. Only `true` ever renders anything.
  isOnline?: boolean
  showPresence?: boolean
  // Small badge marking a group conversation, so it reads at a glance in a
  // list mixing direct and group chats — never true alongside showPresence
  // (a group has no single online/offline state).
  isGroup?: boolean
  className?: string
}

const sizeClasses: Record<NonNullable<ConversationAvatarProps['size']>, string> = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-sm',
}

const ringClasses: Record<NonNullable<ConversationAvatarProps['ring']>, string> = {
  none: '',
  primary: 'ring-2 ring-primary ring-offset-2',
  accent: 'ring-2 ring-accent ring-offset-2',
}

const ConversationAvatar = ({
  name,
  imageUrl,
  size = 'md',
  ring = 'none',
  isOnline,
  showPresence = false,
  isGroup = false,
  className,
}: ConversationAvatarProps) => (
  <div className="relative inline-flex">
    <Avatar className={cn(sizeClasses[size], ringClasses[ring], className)}>
      {imageUrl && <AvatarImage src={imageUrl} alt={name} />}
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
    </Avatar>
    {showPresence && isOnline === true && (
      <div className="absolute bottom-0 right-0">
        <PresenceIndicator isOnline />
      </div>
    )}
    {isGroup && (
      <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-white dark:ring-[#0b0b12]">
        <Users className="h-2.5 w-2.5" />
      </div>
    )}
  </div>
)

export { ConversationAvatar }
