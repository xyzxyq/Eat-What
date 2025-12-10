'use client'

import { useState } from 'react'
import UserAvatar from '@/components/UserAvatar'

interface UserInfo {
    id: string
    nickname: string
    displayName?: string | null
    avatarEmoji: string
    avatarUrl?: string | null
}

export interface WishCommentData {
    id: string
    content: string
    userId: string
    parentId: string | null
    createdAt: string
    user: UserInfo
    replies?: WishCommentData[]
}

interface WishCommentProps {
    comment: WishCommentData
    currentUserId: string
    wishId: string
    onReply: (parentId: string, content: string) => Promise<void>
    level?: number
}

export default function WishComment({
    comment,
    currentUserId,
    wishId,
    onReply,
    level = 0
}: WishCommentProps) {
    const [isReplying, setIsReplying] = useState(false)
    const [replyContent, setReplyContent] = useState('')
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const hasReplies = comment.replies && comment.replies.length > 0
    const maxLevel = 3 // 最大嵌套层级

    const handleSubmitReply = async () => {
        if (!replyContent.trim() || isSubmitting) return

        setIsSubmitting(true)
        try {
            await onReply(comment.id, replyContent.trim())
            setReplyContent('')
            setIsReplying(false)
        } catch (error) {
            console.error('Failed to submit reply:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 1) return '刚刚'
        if (minutes < 60) return `${minutes}分钟前`
        if (hours < 24) return `${hours}小时前`
        if (days < 7) return `${days}天前`
        return date.toLocaleDateString('zh-CN')
    }

    return (
        <div className={`wish-comment ${level > 0 ? 'ml-4 sm:ml-6 border-l-2 border-[var(--hf-border)] pl-2 sm:pl-3' : ''}`}>
            <style jsx>{`
                .wish-comment {
                    margin-top: 8px;
                    max-width: 100%;
                    overflow: hidden;
                }
                .comment-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .comment-content {
                    margin-left: 32px;
                    color: var(--hf-text);
                    font-size: 14px;
                    line-height: 1.5;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }
                .comment-actions {
                    margin-left: 32px;
                    display: flex;
                    gap: 12px;
                    margin-top: 4px;
                }
                .action-btn {
                    font-size: 12px;
                    color: var(--hf-text-muted);
                    cursor: pointer;
                    transition: color 0.2s;
                }
                .action-btn:hover {
                    color: var(--hf-yellow);
                }
                .reply-box {
                    margin-left: 32px;
                    margin-top: 8px;
                    max-width: 100%;
                    overflow: hidden;
                }
                .reply-input {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--hf-border);
                    border-radius: 12px;
                    font-size: 13px;
                    outline: none;
                    transition: border-color 0.2s;
                    resize: none;
                    min-height: 32px;
                    max-height: 100px;
                    overflow-y: auto;
                    line-height: 1.4;
                    font-family: inherit;
                }
                .reply-input:focus {
                    border-color: var(--hf-yellow);
                }
                .reply-buttons {
                    display: flex;
                    gap: 8px;
                    margin-top: 6px;
                    justify-content: flex-end;
                }
                .reply-btn {
                    padding: 4px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .reply-cancel {
                    background: var(--hf-bg-alt);
                    border: 1px solid var(--hf-border);
                    color: var(--hf-text-muted);
                }
                .reply-submit {
                    background: var(--hf-yellow);
                    border: none;
                    color: white;
                }
                .reply-submit:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .collapse-btn {
                    font-size: 11px;
                    color: var(--hf-text-muted);
                    cursor: pointer;
                    margin-left: 32px;
                    margin-top: 4px;
                }
                
                /* Mobile responsive - reduce indentation */
                @media (max-width: 480px) {
                    .comment-content,
                    .comment-actions,
                    .reply-box,
                    .collapse-btn {
                        margin-left: 24px;
                    }
                    .reply-input {
                        font-size: 16px; /* Prevent iOS zoom */
                    }
                }
            `}</style>

            <div className="comment-header">
                <UserAvatar
                    avatarUrl={comment.user.avatarUrl}
                    avatarEmoji={comment.user.avatarEmoji}
                    size="sm"
                />
                <span className="text-sm font-medium text-[var(--hf-text)]">
                    {comment.user.displayName || comment.user.nickname}
                </span>
                <span className="text-xs text-[var(--hf-text-muted)]">
                    {formatTime(comment.createdAt)}
                </span>
            </div>

            <div className="comment-content">
                {comment.content}
            </div>

            <div className="comment-actions">
                {level < maxLevel && (
                    <span className="action-btn" onClick={() => setIsReplying(!isReplying)}>
                        💬 回复
                    </span>
                )}
            </div>

            {isReplying && (
                <div className="reply-box">
                    <textarea
                        className="reply-input"
                        placeholder="写下你的回复..."
                        value={replyContent}
                        onChange={(e) => {
                            setReplyContent(e.target.value)
                            // Auto-resize textarea
                            e.target.style.height = 'auto'
                            e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleSubmitReply()
                            }
                        }}
                        rows={1}
                    />
                    <div className="reply-buttons">
                        <button
                            className="reply-btn reply-cancel"
                            onClick={() => {
                                setIsReplying(false)
                                setReplyContent('')
                            }}
                        >
                            取消
                        </button>
                        <button
                            className="reply-btn reply-submit"
                            disabled={!replyContent.trim() || isSubmitting}
                            onClick={handleSubmitReply}
                        >
                            {isSubmitting ? '发送中...' : '发送'}
                        </button>
                    </div>
                </div>
            )}

            {/* Nested replies */}
            {hasReplies && (
                <>
                    <div
                        className="collapse-btn"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        {isCollapsed ? `▶ 展开 ${comment.replies!.length} 条回复` : `▼ 收起回复`}
                    </div>
                    {!isCollapsed && comment.replies!.map(reply => (
                        <WishComment
                            key={reply.id}
                            comment={reply}
                            currentUserId={currentUserId}
                            wishId={wishId}
                            onReply={onReply}
                            level={level + 1}
                        />
                    ))}
                </>
            )}
        </div>
    )
}
