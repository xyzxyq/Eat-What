'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import WishCard, { WishData } from '@/components/WishCard'
import WishImportModal from '@/components/WishImportModal'

interface UserInfo {
    id: string
    nickname: string
    displayName?: string | null
    avatarEmoji: string
    avatarUrl?: string | null
}

type SortMode = 'votes' | 'time'
type FilterMode = 'todo' | 'done' | 'all'

export default function WishesPage() {
    const router = useRouter()
    const [wishes, setWishes] = useState<WishData[]>([])
    const [users, setUsers] = useState<UserInfo[]>([])
    const [currentUserId, setCurrentUserId] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [newWishContent, setNewWishContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [sortMode, setSortMode] = useState<SortMode>('time')
    const [filterMode, setFilterMode] = useState<FilterMode>('all')
    const [showImportModal, setShowImportModal] = useState(false)

    const fetchWishes = useCallback(async () => {
        try {
            const res = await fetch('/api/wishes')
            if (res.status === 401) {
                router.push('/')
                return
            }
            if (!res.ok) throw new Error('Failed to fetch')

            const data = await res.json()
            setWishes(data.wishes)
            setUsers(data.users)
            setCurrentUserId(data.currentUserId)
        } catch (error) {
            console.error('Error fetching wishes:', error)
        } finally {
            setLoading(false)
        }
    }, [router])

    useEffect(() => {
        fetchWishes()
    }, [fetchWishes])

    const handleCreateWish = async () => {
        if (!newWishContent.trim() || isSubmitting) return
        setIsSubmitting(true)
        try {
            const res = await fetch('/api/wishes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newWishContent.trim() })
            })
            if (res.ok) {
                setNewWishContent('')
                fetchWishes()
            }
        } catch (error) {
            console.error('Error creating wish:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Filter and sort wishes
    const filteredWishes = wishes
        .filter(wish => {
            if (filterMode === 'todo') return !wish.isCompleted
            if (filterMode === 'done') return wish.isCompleted
            return true
        })
        .sort((a, b) => {
            if (sortMode === 'votes') {
                // Sum all vote counts for each wish
                const aTotalVotes = a.votes.reduce((sum, v) => sum + (v.count || 1), 0)
                const bTotalVotes = b.votes.reduce((sum, v) => sum + (v.count || 1), 0)
                return bTotalVotes - aTotalVotes
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })

    const todoCount = wishes.filter(w => !w.isCompleted).length
    const doneCount = wishes.filter(w => w.isCompleted).length

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--hf-bg-alt)] flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4 animate-bounce">✨</div>
                    <p className="text-[var(--hf-text-muted)]">加载中...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[var(--hf-bg-alt)]">
            <style jsx>{`
                .wishes-header {
                    position: sticky;
                    top: 0;
                    z-index: 50;
                    background: white;
                    border-bottom: 1px solid var(--hf-border);
                }
                .header-content {
                    max-width: 42rem;
                    margin: 0 auto;
                    padding: 12px 16px;
                }
                .back-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--hf-text-muted);
                    font-size: 14px;
                    cursor: pointer;
                    transition: color 0.2s;
                }
                .back-btn:hover {
                    color: var(--hf-yellow);
                }
                .page-title {
                    font-size: 20px;
                    font-weight: bold;
                    color: var(--hf-text);
                    margin-top: 8px;
                }
                .stats-bar {
                    display: flex;
                    gap: 16px;
                    margin-top: 12px;
                }
                .stat-btn {
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: 2px solid var(--hf-border);
                    background: white;
                }
                .stat-btn:hover {
                    border-color: var(--hf-yellow);
                }
                .stat-btn.active {
                    background: var(--hf-yellow);
                    border-color: var(--hf-yellow);
                    color: white;
                }
                .stat-count {
                    font-weight: bold;
                    margin-left: 4px;
                }
                .sort-toggle {
                    margin-left: auto;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    color: var(--hf-text-muted);
                }
                .sort-btn {
                    padding: 4px 10px;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: var(--hf-bg-alt);
                }
                .sort-btn:hover {
                    background: var(--hf-yellow-light);
                }
                .sort-btn.active {
                    background: var(--hf-yellow);
                    color: white;
                }
                .wishes-container {
                    max-width: 42rem;
                    margin: 0 auto;
                    padding: 16px;
                }
                .create-box {
                    background: white;
                    border-radius: 16px;
                    padding: 16px;
                    border: 2px solid var(--hf-border);
                    margin-bottom: 16px;
                }
                .create-input {
                    width: 100%;
                    padding: 12px 16px;
                    border: 2px solid var(--hf-border);
                    border-radius: 12px;
                    font-size: 16px;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .create-input:focus {
                    border-color: var(--hf-yellow);
                }
                .create-btn {
                    margin-top: 12px;
                    width: 100%;
                    padding: 12px;
                    background: var(--hf-yellow);
                    border: none;
                    border-radius: 12px;
                    color: white;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: opacity 0.2s;
                }
                .create-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .create-btn:hover:not(:disabled) {
                    opacity: 0.9;
                }
                .wishes-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .empty-state {
                    text-align: center;
                    padding: 48px 16px;
                    color: var(--hf-text-muted);
                }
                .empty-emoji {
                    font-size: 48px;
                    margin-bottom: 16px;
                }
            `}</style>

            {/* Header */}
            <header className="wishes-header">
                <div className="header-content">
                    <div className="back-btn" onClick={() => router.push('/timeline')}>
                        ← 返回时间线
                    </div>
                    <div className="flex items-center justify-between">
                        <h1 className="page-title">✨ 我们想做的事</h1>
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="px-3 py-1.5 rounded-full bg-[var(--hf-yellow-light)] border border-[var(--hf-yellow)] text-sm hover:shadow-md transition flex items-center gap-1"
                        >
                            📥 导入
                        </button>
                    </div>

                    <div className="stats-bar">
                        <button
                            className={`stat-btn ${filterMode === 'all' ? 'active' : ''}`}
                            onClick={() => setFilterMode('all')}
                        >
                            全部<span className="stat-count">{wishes.length}</span>
                        </button>
                        <button
                            className={`stat-btn ${filterMode === 'todo' ? 'active' : ''}`}
                            onClick={() => setFilterMode('todo')}
                        >
                            待做<span className="stat-count">{todoCount}</span>
                        </button>
                        <button
                            className={`stat-btn ${filterMode === 'done' ? 'active' : ''}`}
                            onClick={() => setFilterMode('done')}
                        >
                            已做<span className="stat-count">{doneCount}</span>
                        </button>

                        <div className="sort-toggle">
                            <span>排序:</span>
                            <button
                                className={`sort-btn ${sortMode === 'time' ? 'active' : ''}`}
                                onClick={() => setSortMode('time')}
                            >
                                时间
                            </button>
                            <button
                                className={`sort-btn ${sortMode === 'votes' ? 'active' : ''}`}
                                onClick={() => setSortMode('votes')}
                            >
                                想做
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="wishes-container">
                {/* Create New Wish */}
                <div className="create-box">
                    <input
                        type="text"
                        className="create-input"
                        placeholder="写下你们想一起做的事... 💕"
                        value={newWishContent}
                        onChange={(e) => setNewWishContent(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateWish()}
                    />
                    <button
                        className="create-btn"
                        disabled={!newWishContent.trim() || isSubmitting}
                        onClick={handleCreateWish}
                    >
                        {isSubmitting ? '添加中...' : '✨ 添加心愿'}
                    </button>
                </div>

                {/* Wishes List */}
                <div className="wishes-list">
                    {filteredWishes.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-emoji">💫</div>
                            <p>
                                {filterMode === 'done'
                                    ? '还没有完成的心愿，继续加油！'
                                    : filterMode === 'todo'
                                        ? '太棒了！所有心愿都完成了 🎉'
                                        : '还没有心愿，添加第一个吧！'
                                }
                            </p>
                        </div>
                    ) : (
                        filteredWishes.map(wish => (
                            <WishCard
                                key={wish.id}
                                wish={wish}
                                users={users}
                                currentUserId={currentUserId}
                                onUpdate={fetchWishes}
                            />
                        ))
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-[var(--hf-border)] bg-white py-4 mt-8">
                <div className="max-w-2xl mx-auto px-4 text-center text-xs text-[var(--hf-text-muted)]">
                    <p className="mono">© {new Date().getFullYear()} Eat_What. Made with 💛 for couples.</p>
                    <p className="mt-1">
                        <a
                            href="https://github.com/xyzxyq/Eat-What"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[var(--hf-yellow)] transition"
                        >
                            GitHub
                        </a>
                        {' • MIT License • v0.1.0'}
                    </p>
                </div>
            </footer>

            {/* Import Modal */}
            <WishImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onImport={() => {
                    fetchWishes()
                    setShowImportModal(false)
                }}
            />
        </div>
    )
}
