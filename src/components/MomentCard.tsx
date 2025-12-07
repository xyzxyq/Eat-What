import UserAvatar from '@/components/UserAvatar'

interface MomentData {
    id: string
    content: string
    mediaUrl: string | null
    mediaType: string
    momentDate: string
    createdAt: string
    user: {
        id: string
        nickname: string
        avatarEmoji: string
        avatarUrl?: string | null
    }
}

interface MomentCardProps {
    moment: MomentData
    isCurrentUser: boolean
}

export default function MomentCard({ moment, isCurrentUser }: MomentCardProps) {
    const date = new Date(moment.momentDate)
    const formattedDate = date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    })

    return (
        <div className={`hf-card animate-fade-in-up ${isCurrentUser ? 'border-l-4 border-l-[var(--hf-yellow)]' : ''}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <UserAvatar
                        avatarUrl={moment.user.avatarUrl}
                        avatarEmoji={moment.user.avatarEmoji}
                        size="lg"
                    />
                    <div>
                        <p className="font-semibold text-[var(--hf-text)]">
                            {moment.user.nickname}
                            {isCurrentUser && (
                                <span className="ml-2 text-xs text-[var(--hf-text-muted)]">(你)</span>
                            )}
                        </p>
                        <p className="text-sm text-[var(--hf-text-muted)] mono hidden sm:block">
                            {formattedDate}
                        </p>
                        <p className="text-sm text-[var(--hf-text-muted)] mono sm:hidden">
                            {date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                        </p>
                    </div>
                </div>
                <div className="hf-badge">
                    <span>📝</span>
                    <span className="mono text-xs">commit</span>
                </div>
            </div>

            {/* Content */}
            <div className="mb-4">
                <p className="text-[var(--hf-text)] whitespace-pre-wrap leading-relaxed">
                    {moment.content}
                </p>
            </div>

            {/* Media */}
            {moment.mediaUrl && (
                <div className="mt-4 rounded-lg overflow-hidden border border-[var(--hf-border)]">
                    {moment.mediaType === 'video' ? (
                        <video
                            src={moment.mediaUrl}
                            controls
                            className="w-full max-h-96 object-contain bg-black"
                        />
                    ) : (
                        <img
                            src={moment.mediaUrl}
                            alt="moment"
                            className="w-full max-h-96 object-contain"
                        />
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-[var(--hf-border)] flex items-center justify-between text-xs text-[var(--hf-text-muted)]">
                <span className="mono">
                    {new Date(moment.createdAt).toLocaleTimeString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </span>
                <span>💌 Daily Moment</span>
            </div>
        </div>
    )
}

export type { MomentData }
