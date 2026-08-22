import * as React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui'

export interface CommunityMember {
  name: string
  imageUrl: string
  color: string
}

export const COMMUNITY_MEMBERS: CommunityMember[] = [
  { name: 'Priya', imageUrl: 'https://i.pravatar.cc/64?img=47', color: 'bg-rose-400' },
  { name: 'James', imageUrl: 'https://i.pravatar.cc/64?img=12', color: 'bg-slate-500' },
  { name: 'Sofia', imageUrl: 'https://i.pravatar.cc/64?img=31', color: 'bg-sky-400' },
  { name: 'Kai', imageUrl: 'https://i.pravatar.cc/64?img=68', color: 'bg-amber-400' },
]

export interface CommunityAvatarsProps {
  members?: CommunityMember[]
  headline?: string
  subtext?: string
}

const CommunityAvatars = ({
  members = COMMUNITY_MEMBERS,
  headline = 'Connect around the world',
  subtext = '650,000+ Active users',
}: CommunityAvatarsProps) => (
  <div className="flex items-center gap-4">
    <div className="flex shrink-0 pl-2">
      {members.map((member, index) => (
        <Avatar
          key={member.name}
          title={member.name}
          className="border-2 border-white shadow-sm"
          style={{
            marginLeft: index === 0 ? 0 : '-10px',
            zIndex: index,
          }}
        >
          <AvatarImage src={member.imageUrl} alt={member.name} />
          <AvatarFallback className={`text-white ${member.color}`}>
            {member.name[0]}
          </AvatarFallback>
        </Avatar>
      ))}
    </div>
    <div>
      <p className="text-sm font-semibold text-gray-900">{headline}</p>
      <p className="text-xs text-gray-500">{subtext}</p>
    </div>
  </div>
)

export { CommunityAvatars }
