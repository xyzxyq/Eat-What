'use client'

import { useState, useEffect } from 'react'

interface UserData {
    id: string
    nickname: string
    avatarEmoji: string
}

interface MomentData {
    id: string
    content: string
    mediaUrl: string | null
    mediaType: string
    momentDate: string
    createdAt: string
    user: UserData
}

interface CommentData {
    id: string
    content: string
    createdAt: string
    user: UserData
    replies: CommentData[]
}

interface ReactionData {
    [emoji: string]: {
        count: number
        users: string[]
        hasReacted: boolean
    }
}

interface GalleryCardProps {
    moment: MomentData
    currentUserId: string
    onUpdate: () => void
}

const EMOJIS = ['👍', '❤️', '😂', '😢', '😮', '🔥']

export default function GalleryCard({ moment, currentUserId, onUpdate }: GalleryCardProps) {
    const [reactions, setReactions] = useState<ReactionData>({})
    const [comments, setComments] = useState<CommentData[]>([])
    const [showComments, setShowComments] = useState(false)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [newComment, setNewComment] = useState('')
    const [replyTo, setReplyTo] = useState<{ id: string; nickname: string } | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchReactions()
    }, [moment.id])

    const fetchReactions = async () => {
        const res = await fetch(`/api/reactions?momentId=${moment.id}`)
        if (res.ok) {
            const data = await res.json()
            setReactions(data.reactions)
        }
    }

    const fetchComments = async () => {
        const res = await fetch(`/api/comments?momentId=${moment.id}`)
        if (res.ok) {
            const data = await res.json()
            setComments(data.comments)
        }
    }

    const handleReaction = async (emoji: string) => {
        await fetch('/api/reactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ momentId: moment.id, emoji })
        })
        fetchReactions()
        setShowEmojiPicker(false)
    }

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim()) return

        setLoading(true)
        await fetch('/api/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                momentId: moment.id,
                content: newComment.trim(),
                parentId: replyTo?.id || null
            })
        })
        setNewComment('')
        setReplyTo(null)
        fetchComments()
        setLoading(false)
    }

    const handleDeleteComment = async (commentId: string) => {
        await fetch(`/api/comments?id=${commentId}`, { method: 'DELETE' })
        fetchComments()
    }

    const toggleComments = () => {
        if (!showComments) {
            fetchComments()
        }
        setShowComments(!showComments)
    }

    const time = new Date(moment.createdAt).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
    })

    return (
        <div className="hf-card">
            {/* Content */}
            <p className="text-[var(--hf-text)] whitespace-pre-wrap leading-relaxed mb-3">
                {moment.content}
            </p>

            {/* Media */}
            {moment.mediaUrl && (
                <div className="mb-3 rounded-lg overflow-hidden border border-[var(--hf-border)]">
                    {moment.mediaType === 'video' ? (
                        <video src={moment.mediaUrl} controls className="w-full max-h-48 object-contain bg-black" />
                    ) : (
                        <img src={moment.mediaUrl} alt="" className="w-full max-h-48 object-contain" />
                    )}
                </div>
            )}

            {/* Time */}
            <p className="text-xs text-[var(--hf-text-muted)] mono mb-3">{time}</p>

            {/* Reactions Display */}
            <div className="flex flex-wrap gap-2 mb-3">
                {Object.entries(reactions).map(([emoji, data]) => (
                    <button
                        key={emoji}
                        onClick={() => handleReaction(emoji)}
                        className={`px-2 py-1 rounded-full text-sm border transition ${data.hasReacted
                                ? 'bg-[var(--hf-yellow-light)] border-[var(--hf-yellow)]'
                                : 'bg-[var(--hf-bg-alt)] border-[var(--hf-border)] hover:border-[var(--hf-yellow)]'
                            }`}
                        title={data.users.join(', ')}
                    >
                        {emoji} {data.count}
                    </button>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3 border-t border-[var(--hf-border)]">
                {/* Emoji Picker */}
                <div className="relative">
                    <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="text-xl hover:scale-110 transition"
                    >
                        😊
                    </button>
                    {showEmojiPicker && (
                        <div className="absolute bottom-full left-0 mb-2 p-2 bg-white border border-[var(--hf-border)] rounded-lg shadow-lg flex gap-1 z-10">
                            {EMOJIS.map(emoji => (
                                <button
                                    key={emoji}
                                    onClick={() => handleReaction(emoji)}
                                    className="text-xl hover:scale-125 transition p-1"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Comment Toggle */}
                <button
                    onClick={toggleComments}
                    className="flex items-center gap-1 text-sm text-[var(--hf-text-muted)] hover:text-[var(--hf-text)] transition"
                >
                    💬 <span className="hidden sm:inline">评论</span>
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="mt-4 pt-4 border-t border-[var(--hf-border)]">
                    {/* Comment List */}
                    <div className="space-y-3 mb-4">
                        {comments.map(comment => (
                            <div key={comment.id}>
                                {/* Main Comment */}
                                <div className="flex gap-2">
                                    <span>{comment.user.avatarEmoji}</span>
                                    <div className="flex-1">
                                        <div className="bg-[var(--hf-bg-alt)] rounded-lg p-2">
                                            <span className="font-semibold text-sm">{comment.user.nickname}</span>
                                            <p className="text-sm">{comment.content}</p>
                                        </div>
                                        <div className="flex gap-3 mt-1 text-xs text-[var(--hf-text-muted)]">
                                            <span>{new Date(comment.createdAt).toLocaleString('zh-CN')}</span>
                                            <button
                                                onClick={() => setReplyTo({ id: comment.id, nickname: comment.user.nickname })}
                                                className="hover:text-[var(--hf-text)]"
                                            >
                                                回复
                                            </button>
                                            {comment.user.id === currentUserId && (
                                                <button
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    className="hover:text-red-500"
                                                >
                                                    删除
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Replies */}
                                {comment.replies.length > 0 && (
                                    <div className="ml-8 mt-2 space-y-2">
                                        {comment.replies.map(reply => (
                                            <div key={reply.id} className="flex gap-2">
                                                <span className="text-sm">{reply.user.avatarEmoji}</span>
                                                <div className="flex-1">
                                                    <div className="bg-[var(--hf-bg-alt)] rounded-lg p-2">
                                                        <span className="font-semibold text-sm">{reply.user.nickname}</span>
                                                        <p className="text-sm">{reply.content}</p>
                                                    </div>
                                                    <div className="flex gap-3 mt-1 text-xs text-[var(--hf-text-muted)]">
                                                        <span>{new Date(reply.createdAt).toLocaleString('zh-CN')}</span>
                                                        {reply.user.id === currentUserId && (
                                                            <button
                                                                onClick={() => handleDeleteComment(reply.id)}
                                                                className="hover:text-red-500"
                                                            >
                                                                删除
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Comment Input */}
                    <form onSubmit={handleComment} className="flex gap-2">
                        <div className="flex-1">
                            {replyTo && (
                                <div className="text-xs text-[var(--hf-text-muted)] mb-1 flex items-center gap-2">
                                    回复 @{replyTo.nickname}
                                    <button type="button" onClick={() => setReplyTo(null)} className="hover:text-red-500">✕</button>
                                </div>
                            )}
                            <input
                                type="text"
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                placeholder="写评论..."
                                className="hf-input text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !newComment.trim()}
                            className="hf-button text-sm px-3"
                        >
                            发送
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}
