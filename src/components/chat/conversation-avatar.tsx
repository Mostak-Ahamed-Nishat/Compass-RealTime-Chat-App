import * as React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui'
import { cn, getInitials } from '@/lib/utils'

export interface ConversationAvatarProps {
  name: string
  imageUrl?: string
  size?: 'sm' | 'md' | 'lg'
  ring?: 'none' | 'primary' | 'accent'
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
  className,
}: ConversationAvatarProps) => (
  <Avatar className={cn(sizeClasses[size], ringClasses[ring], className)}>
    {imageUrl && <AvatarImage src={imageUrl} alt={name} />}
    <AvatarFallback>{getInitials(name)}</AvatarFallback>
  </Avatar>
)

export { ConversationAvatar }
