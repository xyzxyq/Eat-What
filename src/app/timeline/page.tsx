'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import MomentCard, { MomentData } from '@/components/MomentCard'
import CreateMoment from '@/components/CreateMoment'

interface UserData {
    id: string
    nickname: string
    avatarEmoji: string
}

export default function TimelinePage() {
    const router = useRouter()
    const [moments, setMoments] = useState<MomentData[]>([])
    const [users, setUsers] = useState<UserData[]>([])
    const [currentUserId, setCurrentUserId] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const fetchMoments = useCallback(async () => {
        try {
            const res = await fetch('/api/moments')

            if (res.status === 401) {
                router.push('/')
                return
            }

            if (!res.ok) {
                throw new Error('Failed to fetch')
            }

            const data = await res.json()
            setMoments(data.moments)
            setUsers(data.users)
            setCurrentUserId(data.currentUserId)
        } catch {
            setError('加载失败，请刷新页面 🔄')
        } finally {
            setLoading(false)
        }
    }, [router])

    useEffect(() => {
        fetchMoments()
    }, [fetchMoments])

    // 检查当前用户今天是否已经发布过
    const hasPostedToday = moments.some(m => {
        const momentDate = new Date(m.momentDate).toDateString()
        const today = new Date().toDateString()
        return m.user.id === currentUserId && momentDate === today
    })

    const currentUser = users.find(u => u.id === currentUserId)
    const partner = users.find(u => u.id !== currentUserId)

    const handleLogout = async () => {
        document.cookie = 'auth-token=; Max-Age=0; path=/'
        router.push('/')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--hf-bg)] flex items-center justify-center">
                <div className="text-center">
                    <div className="spinner mx-auto mb-4" style={{ width: 48, height: 48 }}></div>
                    <p className="text-[var(--hf-text-muted)] mono">Loading moments...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[var(--hf-bg-alt)]">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-[var(--hf-border)] bg-white">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🍽️</span>
                        <div>
                            <h1 className="font-bold text-[var(--hf-text)] mono text-sm sm:text-base">Eat_What</h1>
                            <p className="text-xs text-[var(--hf-text-muted)] hidden sm:block">
                                {users.length === 2 ? '💕 空间已配对' : '⏳ 等待另一半加入'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Users Display */}
                        <div className="flex items-center gap-1">
                            {currentUser && (
                                <div className="emoji-avatar text-base" style={{ width: '2rem', height: '2rem' }} title={currentUser.nickname}>
                                    {currentUser.avatarEmoji}
                                </div>
                            )}
                            {partner && (
                                <>
                                    <span className="text-[var(--hf-text-muted)]">💕</span>
                                    <div className="emoji-avatar text-base" style={{ width: '2rem', height: '2rem' }} title={partner.nickname}>
                                        {partner.avatarEmoji}
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            onClick={handleLogout}
                            className="text-sm text-[var(--hf-text-muted)] hover:text-[var(--hf-text)] transition"
                        >
                            退出
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-2xl mx-auto px-4 py-6">
                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center">
                        {error}
                    </div>
                )}

                {/* Create Moment Section */}
                <div className="mb-8">
                    <CreateMoment
                        onSuccess={fetchMoments}
                        disabled={hasPostedToday}
                    />
                </div>

                {/* Timeline */}
                <div className="space-y-6">
                    {moments.length === 0 ? (
                        <div className="hf-card text-center py-12">
                            <div className="text-6xl mb-4">📝</div>
                            <h3 className="text-xl font-semibold text-[var(--hf-text)] mb-2">
                                还没有任何记录
                            </h3>
                            <p className="text-[var(--hf-text-muted)]">
                                来创建你们的第一条日记吧！
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-xl">📚</span>
                                <h2 className="font-semibold text-[var(--hf-text)] mono">Timeline</h2>
                                <span className="text-sm text-[var(--hf-text-muted)]">
                                    共 {moments.length} 条记录
                                </span>
                            </div>

                            {moments.map((moment, index) => (
                                <div key={moment.id} style={{ animationDelay: `${index * 0.1}s` }}>
                                    <MomentCard
                                        moment={moment}
                                        isCurrentUser={moment.user.id === currentUserId}
                                    />
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-[var(--hf-border)] bg-white py-4 mt-8">
                <p className="text-center text-xs text-[var(--hf-text-muted)] mono">
                    Made with 💛 • {new Date().getFullYear()}
                </p>
            </footer>
        </div>
    )
}
