'use client'

import { useState, useRef, useEffect } from 'react'
import UserAvatar from '@/components/UserAvatar'
import WishComment, { WishCommentData } from '@/components/WishComment'

interface UserInfo {
    id: string
    nickname: string
    displayName?: string | null
    avatarEmoji: string
    avatarUrl?: string | null
}

interface VoteInfo {
    id: string
    userId: string
    count: number
    user: UserInfo
}

export interface WishData {
    id: string
    content: string
    isCompleted: boolean
    createdAt: string
    updatedAt: string
    createdBy: UserInfo
    lastEditedBy?: UserInfo | null
    votes: VoteInfo[]
    _count: {
        comments: number
    }
}

interface WishCardProps {
    wish: WishData
    users: UserInfo[]
    currentUserId: string
    onUpdate: () => void
}

export default function WishCard({ wish, users, currentUserId, onUpdate }: WishCardProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(wish.content)
    const [showComments, setShowComments] = useState(false)
    const [comments, setComments] = useState<WishCommentData[]>([])
    const [newComment, setNewComment] = useState('')
    const [isLoadingComments, setIsLoadingComments] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [voteAnimation, setVoteAnimation] = useState(false)

    // Calculate total vote count per user
    const getUserVoteCount = (userId: string) => {
        const vote = wish.votes.find(v => v.userId === userId)
        return vote?.count || 0
    }
    const totalVotes = wish.votes.reduce((sum, v) => sum + (v.count || 1), 0)

    const handleVote = async () => {
        try {
            setVoteAnimation(true)
            setTimeout(() => setVoteAnimation(false), 300)
            await fetch(`/api/wishes/${wish.id}/vote`, { method: 'POST' })
            onUpdate()
        } catch (error) {
            console.error('Failed to add vote:', error)
        }
    }

    const handleSaveEdit = async () => {
        if (!editContent.trim() || isSubmitting) return
        setIsSubmitting(true)
        try {
            await fetch(`/api/wishes/${wish.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: editContent.trim() })
            })
            setIsEditing(false)
            onUpdate()
        } catch (error) {
            console.error('Failed to save edit:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleToggleComplete = async () => {
        try {
            await fetch(`/api/wishes/${wish.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isCompleted: !wish.isCompleted })
            })
            onUpdate()
        } catch (error) {
            console.error('Failed to toggle complete:', error)
        }
    }

    const handleDelete = async () => {
        if (!confirm('确定要删除这个心愿吗？')) return
        try {
            await fetch(`/api/wishes/${wish.id}`, { method: 'DELETE' })
            onUpdate()
        } catch (error) {
            console.error('Failed to delete:', error)
        }
    }

    const loadComments = async () => {
        setIsLoadingComments(true)
        try {
            const res = await fetch(`/api/wishes/${wish.id}/comments`)
            const data = await res.json()
            setComments(data)
        } catch (error) {
            console.error('Failed to load comments:', error)
        } finally {
            setIsLoadingComments(false)
        }
    }

    const handleToggleComments = async () => {
        if (!showComments && comments.length === 0) {
            await loadComments()
        }
        setShowComments(!showComments)
    }

    const handleAddComment = async (parentId: string | null = null, content: string = newComment) => {
        if (!content.trim()) return
        try {
            await fetch(`/api/wishes/${wish.id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: content.trim(), parentId })
            })
            setNewComment('')
            await loadComments()
            onUpdate()
        } catch (error) {
            console.error('Failed to add comment:', error)
        }
    }

    const handleReply = async (parentId: string, content: string) => {
        await handleAddComment(parentId, content)
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <div className={`wish-card ${wish.isCompleted ? 'completed' : ''}`}>
            <style jsx>{`
                .wish-card {
                    background: white;
                    border-radius: 16px;
                    padding: 16px;
                    border: 2px solid var(--hf-border);
                    transition: all 0.3s ease;
                    animation: fadeIn 0.3s ease;
                }
                .wish-card:hover {
                    border-color: var(--hf-yellow);
                    box-shadow: 0 4px 20px rgba(255, 210, 30, 0.15);
                }
                .wish-card.completed {
                    opacity: 0.7;
                    background: var(--hf-bg-alt);
                }
                .wish-card.completed .wish-content {
                    text-decoration: line-through;
                    color: var(--hf-text-muted);
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .wish-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 12px;
                }
                .wish-content {
                    font-size: 16px;
                    color: var(--hf-text);
                    line-height: 1.5;
                    flex: 1;
                }
                .edit-input {
                    width: 100%;
                    padding: 8px 12px;
                    border: 2px solid var(--hf-yellow);
                    border-radius: 8px;
                    font-size: 16px;
                    outline: none;
                }
                .editor-info {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 11px;
                    color: var(--hf-text-muted);
                    margin-top: 8px;
                }
                .vote-section {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px solid var(--hf-border);
                }
                .vote-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: 2px solid var(--hf-border);
                    background: white;
                }
                .vote-btn:hover {
                    border-color: var(--hf-yellow);
                    background: var(--hf-yellow-light);
                }
                .vote-btn:active {
                    transform: scale(0.95);
                }
                .vote-btn.pulse {
                    animation: votePulse 0.3s ease;
                }
                @keyframes votePulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                .vote-counts {
                    display: flex;
                    gap: 12px;
                    font-size: 13px;
                }
                .vote-count {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    background: var(--hf-bg-alt);
                    padding: 4px 10px;
                    border-radius: 12px;
                }
                .vote-number {
                    font-weight: 600;
                    color: var(--hf-yellow);
                }
                .actions {
                    display: flex;
                    gap: 8px;
                    margin-left: auto;
                }
                .action-btn {
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                    background: var(--hf-bg-alt);
                    color: var(--hf-text-muted);
                }
                .action-btn:hover {
                    background: var(--hf-yellow-light);
                    color: var(--hf-text);
                }
                .comments-section {
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px solid var(--hf-border);
                }
                .comment-toggle {
                    font-size: 13px;
                    color: var(--hf-text-muted);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .comment-toggle:hover {
                    color: var(--hf-yellow);
                }
                .comment-input-box {
                    display: flex;
                    gap: 8px;
                    margin-top: 12px;
                    align-items: flex-end;
                    max-width: 100%;
                    overflow: hidden;
                }
                .comment-input {
                    flex: 1;
                    min-width: 0; /* Allow flex item to shrink below content size */
                    padding: 8px 12px;
                    border: 1px solid var(--hf-border);
                    border-radius: 16px;
                    font-size: 13px;
                    outline: none;
                    resize: none;
                    min-height: 36px;
                    max-height: 120px;
                    overflow-y: auto;
                    line-height: 1.4;
                    font-family: inherit;
                }
                .comment-input:focus {
                    border-color: var(--hf-yellow);
                }
                .comment-submit {
                    padding: 8px 16px;
                    background: var(--hf-yellow);
                    border: none;
                    border-radius: 20px;
                    color: white;
                    font-size: 13px;
                    cursor: pointer;
                    transition: opacity 0.2s;
                    flex-shrink: 0; /* Prevent button from shrinking */
                }
                .comment-submit:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .complete-btn {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    border: 2px solid var(--hf-border);
                    background: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }
                .complete-btn:hover {
                    border-color: var(--hf-yellow);
                }
                .complete-btn.done {
                    background: var(--hf-yellow);
                    border-color: var(--hf-yellow);
                }
                
                /* Mobile responsive styles */
                @media (max-width: 480px) {
                    .comment-input {
                        font-size: 16px; /* Prevent iOS zoom on focus */
                        padding: 8px 10px;
                    }
                    .comment-submit {
                        padding: 8px 12px;
                        font-size: 12px;
                    }
                }
            `}</style>

            <div className="wish-header">
                <button
                    className={`complete-btn ${wish.isCompleted ? 'done' : ''}`}
                    onClick={handleToggleComplete}
                    title={wish.isCompleted ? '标记为未完成' : '标记为已完成'}
                >
                    {wish.isCompleted && <span style={{ color: 'white', fontSize: '14px' }}>✓</span>}
                </button>

                {isEditing ? (
                    <div className="flex-1 ml-3">
                        <input
                            type="text"
                            className="edit-input"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                            autoFocus
                        />
                        <div className="flex gap-2 mt-2">
                            <button
                                className="action-btn"
                                onClick={() => {
                                    setIsEditing(false)
                                    setEditContent(wish.content)
                                }}
                            >
                                取消
                            </button>
                            <button
                                className="action-btn"
                                style={{ background: 'var(--hf-yellow)', color: 'white' }}
                                onClick={handleSaveEdit}
                                disabled={isSubmitting}
                            >
                                保存
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 ml-3">
                        <div className="wish-content">{wish.content}</div>
                        <div className="editor-info">
                            <UserAvatar
                                avatarUrl={wish.lastEditedBy?.avatarUrl || wish.createdBy.avatarUrl}
                                avatarEmoji={wish.lastEditedBy?.avatarEmoji || wish.createdBy.avatarEmoji}
                                size="xs"
                            />
                            <span>
                                {wish.lastEditedBy
                                    ? `${wish.lastEditedBy.displayName || wish.lastEditedBy.nickname} 编辑于 ${formatDate(wish.updatedAt)}`
                                    : `${wish.createdBy.displayName || wish.createdBy.nickname} 创建于 ${formatDate(wish.createdAt)}`
                                }
                            </span>
                        </div>
                    </div>
                )}

                <div className="actions">
                    <button className="action-btn" onClick={() => setIsEditing(true)}>✏️</button>
                    <button className="action-btn" onClick={handleDelete}>🗑️</button>
                </div>
            </div>

            <div className="vote-section">
                <button
                    className={`vote-btn ${voteAnimation ? 'pulse' : ''}`}
                    onClick={handleVote}
                >
                    💖 想做 +1
                </button>
                <div className="vote-counts">
                    {users.map(user => {
                        const count = getUserVoteCount(user.id)
                        return (
                            <div key={user.id} className="vote-count">
                                <UserAvatar
                                    avatarUrl={user.avatarUrl}
                                    avatarEmoji={user.avatarEmoji}
                                    size="xs"
                                />
                                <span className="vote-number">{count}</span>
                                <span style={{ color: 'var(--hf-text-muted)', fontSize: '11px' }}>次</span>
                            </div>
                        )
                    })}
                </div>

                <div
                    className="comment-toggle ml-auto"
                    onClick={handleToggleComments}
                >
                    💬 {wish._count.comments} 条评论
                    <span>{showComments ? '▲' : '▼'}</span>
                </div>
            </div>

            {showComments && (
                <div className="comments-section">
                    {isLoadingComments ? (
                        <div className="text-center text-sm text-[var(--hf-text-muted)] py-4">
                            加载评论中...
                        </div>
                    ) : (
                        <>
                            <div className="comment-input-box">
                                <textarea
                                    className="comment-input"
                                    placeholder="写下你的想法..."
                                    value={newComment}
                                    onChange={(e) => {
                                        setNewComment(e.target.value)
                                        // Auto-resize textarea
                                        e.target.style.height = 'auto'
                                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault()
                                            handleAddComment()
                                        }
                                    }}
                                    rows={1}
                                />
                                <button
                                    className="comment-submit"
                                    disabled={!newComment.trim()}
                                    onClick={() => handleAddComment()}
                                >
                                    发送
                                </button>
                            </div>

                            {comments.length === 0 ? (
                                <div className="text-center text-sm text-[var(--hf-text-muted)] py-4">
                                    还没有评论，说点什么吧 ✨
                                </div>
                            ) : (
                                <div className="mt-3">
                                    {comments.map(comment => (
                                        <WishComment
                                            key={comment.id}
                                            comment={comment}
                                            currentUserId={currentUserId}
                                            wishId={wish.id}
                                            onReply={handleReply}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
