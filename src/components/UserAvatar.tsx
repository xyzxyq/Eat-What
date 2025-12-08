'use client'

interface UserAvatarProps {
    avatarUrl?: string | null
    avatarEmoji?: string
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
    className?: string
}

const sizeClasses = {
    xs: 'w-4 h-4 text-xs',
    sm: 'w-6 h-6 text-sm',
    md: 'w-8 h-8 text-base',
    lg: 'w-10 h-10 text-xl',
    xl: 'w-12 h-12 text-2xl',
    '2xl': 'w-16 h-16 text-3xl'
}

export default function UserAvatar({ avatarUrl, avatarEmoji = '💕', size = 'md', className = '' }: UserAvatarProps) {
    const sizeClass = sizeClasses[size]

    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt="头像"
                className={`${sizeClass} rounded-full object-cover border-2 border-[var(--hf-yellow-light)] ${className}`}
            />
        )
    }

    return (
        <div className={`${sizeClass} rounded-full bg-[var(--hf-yellow-light)] flex items-center justify-center ${className}`}>
            {avatarEmoji}
        </div>
    )
}
