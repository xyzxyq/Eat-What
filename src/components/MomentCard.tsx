'use client'

import { useState, useEffect } from 'react'
import UserAvatar from '@/components/UserAvatar'
import confetti from 'canvas-confetti'

interface MomentData {
    id: string
    content: string
    mediaUrl: string | null
    mediaType: string
    momentDate: string
    createdAt: string
    likeCount?: number
    user: {
        id: string
        nickname: string
        displayName?: string | null
        avatarEmoji: string
        avatarUrl?: string | null
    }
}

interface MomentCardProps {
    moment: MomentData
    isCurrentUser: boolean
    onUpdate?: () => void
    onDelete?: (id: string) => void
}

// 特殊数字配置
const SPECIAL_NUMBERS: { [key: number]: { message: string; emoji: string } } = {
    21: { message: '爱你', emoji: '💕' },
    52: { message: '我爱你', emoji: '💘' },
    99: { message: '长长久久', emoji: '💝' },
    131: { message: '一生一世', emoji: '💗' },
    520: { message: '我爱你', emoji: '🎉' },
    1314: { message: '一生一世', emoji: '💖' },
}

export default function MomentCard({ moment, isCurrentUser, onUpdate, onDelete }: MomentCardProps) {
    const [showMenu, setShowMenu] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(moment.content)
    const [saving, setSaving] = useState(false)
    const [likeCount, setLikeCount] = useState(moment.likeCount || 0)
    const [isLiking, setIsLiking] = useState(false)
    const [showSpecial, setShowSpecial] = useState<{ message: string; emoji: string } | null>(null)
    const [likeAnimation, setLikeAnimation] = useState(false)

    const date = new Date(moment.momentDate)
    const formattedDate = date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    })

    // 判断是否是今天的日记
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const momentDay = new Date(moment.momentDate)
    momentDay.setHours(0, 0, 0, 0)
    const isToday = today.getTime() === momentDay.getTime()

    // 检查当前点赞数是否是特殊数字
    const currentSpecial = SPECIAL_NUMBERS[likeCount]

    const handleLike = async () => {
        if (isLiking) return
        setIsLiking(true)
        setLikeAnimation(true)

        try {
            const res = await fetch(`/api/moments/${moment.id}/like`, { method: 'POST' })
            if (res.ok) {
                const data = await res.json()
                setLikeCount(data.likeCount)

                // 显示特殊数字动画
                if (data.special) {
                    setShowSpecial(data.special)
                    // 撒花效果
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#ff69b4', '#ff1493', '#ffb6c1', '#ffc0cb', '#ff6b6b']
                    })
                    setTimeout(() => setShowSpecial(null), 3000)
                }
            }
        } catch (e) {
            console.error('Failed to like:', e)
        } finally {
            setIsLiking(false)
            setTimeout(() => setLikeAnimation(false), 300)
        }
    }

    const handleEdit = () => {
        setEditContent(moment.content)
        setIsEditing(true)
        setShowMenu(false)
    }

    const handleSaveEdit = async () => {
        if (!editContent.trim()) return
        setSaving(true)
        try {
            const res = await fetch(`/api/moments/${moment.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: editContent.trim() })
            })
            if (res.ok) {
                setIsEditing(false)
                onUpdate?.()
            }
        } catch (e) {
            console.error('Failed to update:', e)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('确定删除这条日记吗？删除后无法恢复。')) return
        try {
            const res = await fetch(`/api/moments/${moment.id}`, { method: 'DELETE' })
            if (res.ok) {
                onDelete?.(moment.id)
            }
        } catch (e) {
            console.error('Failed to delete:', e)
        }
    }

    const handleCopy = async () => {
        await navigator.clipboard.writeText(moment.content)
        setShowMenu(false)
        alert('已复制到剪贴板 📋')
    }

    return (
        <div className={`hf-card animate-fade-in-up relative ${isCurrentUser ? 'border-l-4 border-l-[var(--hf-yellow)]' : ''}`}>
            {/* 特殊数字动画 */}
            {showSpecial && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-xl z-30 animate-in fade-in zoom-in duration-300">
                    <div className="text-center animate-bounce">
                        <div className="text-6xl mb-2">{showSpecial.emoji}</div>
                        <div className="text-2xl font-bold text-white drop-shadow-lg">{showSpecial.message}</div>
                        <div className="text-white/80 text-sm mt-1">第 {likeCount} 次点赞</div>
                    </div>
                </div>
            )}

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

                {/* Commit Badge */}
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="hf-badge cursor-pointer hover:bg-[var(--hf-yellow-light)] hover:border-[var(--hf-yellow)] transition-all"
                    >
                        <span>📝</span>
                        <span className="mono text-xs">commit</span>
                    </button>

                    {/* 操作菜单 */}
                    {showMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-[var(--hf-border)] rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-1">
                                    <button
                                        onClick={handleCopy}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--hf-bg-alt)] transition text-sm text-left"
                                    >
                                        <span>📋</span>
                                        <span>复制内容</span>
                                    </button>

                                    {isCurrentUser && isToday && (
                                        <button
                                            onClick={handleEdit}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--hf-bg-alt)] transition text-sm text-left"
                                        >
                                            <span>✏️</span>
                                            <span>编辑日记</span>
                                        </button>
                                    )}

                                    {isCurrentUser && (
                                        <button
                                            onClick={handleDelete}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 text-red-500 transition text-sm text-left"
                                        >
                                            <span>🗑️</span>
                                            <span>删除日记</span>
                                        </button>
                                    )}
                                </div>

                                {isCurrentUser && !isToday && (
                                    <div className="px-3 py-2 bg-[var(--hf-bg-alt)] border-t border-[var(--hf-border)] text-xs text-[var(--hf-text-muted)]">
                                        💡 仅今日日记可编辑
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="mb-4">
                {isEditing ? (
                    <div className="space-y-3">
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="hf-input min-h-24 resize-none"
                            placeholder="写点什么..."
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 text-sm text-[var(--hf-text-muted)] hover:text-[var(--hf-text)] transition"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={saving || !editContent.trim()}
                                className="hf-button text-sm"
                            >
                                {saving ? '保存中...' : '保存修改'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-[var(--hf-text)] whitespace-pre-wrap leading-relaxed">
                        {moment.content}
                    </p>
                )}
            </div>

            {/* Media */}
            {moment.mediaUrl && !isEditing && (
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

            {/* Footer with Like Button */}
            <div className="mt-4 pt-4 border-t border-[var(--hf-border)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* 点赞按钮 */}
                    <button
                        onClick={handleLike}
                        disabled={isLiking}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${likeAnimation ? 'scale-110' : ''
                            } ${currentSpecial
                                ? 'bg-pink-50 border-pink-300 text-pink-500'
                                : 'border-[var(--hf-border)] hover:border-pink-300 hover:bg-pink-50 text-[var(--hf-text-muted)] hover:text-pink-500'
                            }`}
                    >
                        <span className={`text-lg ${likeAnimation ? 'animate-ping' : ''}`}>
                            {currentSpecial ? currentSpecial.emoji : '💗'}
                        </span>
                        <span className="text-sm font-medium">{likeCount}</span>
                        {currentSpecial && (
                            <span className="text-xs ml-1">{currentSpecial.message}</span>
                        )}
                    </button>

                    <span className="text-xs text-[var(--hf-text-muted)] mono">
                        {new Date(moment.createdAt).toLocaleTimeString('zh-CN', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </span>
                </div>

                <span className="text-xs text-[var(--hf-text-muted)]">💌 Daily Moment</span>
            </div>
        </div>
    )
}

export type { MomentData }
