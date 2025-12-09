'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import MomentCard, { MomentData } from '@/components/MomentCard'
import CreateMoment from '@/components/CreateMoment'
import OnboardingModal from '@/components/OnboardingModal'
import UserAvatar from '@/components/UserAvatar'
import ProfilePopup from '@/components/ProfilePopup'
import CoupleCard from '@/components/CoupleCard'
import SettingsModal from '@/components/SettingsModal'
import AnimatedBackground from '@/components/AnimatedBackground'
import DailyInteractionPanel from '@/components/DailyInteractionPanel'
import SwipeablePanel from '@/components/SwipeablePanel'

interface UserData {
    id: string
    nickname: string
    displayName?: string | null
    avatarEmoji: string
    avatarUrl?: string | null
    status?: string
}

export default function TimelinePage() {
    const router = useRouter()
    const [moments, setMoments] = useState<MomentData[]>([])
    const [users, setUsers] = useState<UserData[]>([])
    const [currentUserId, setCurrentUserId] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showOnboarding, setShowOnboarding] = useState(false)
    const [showProfilePopup, setShowProfilePopup] = useState(false)
    const [showSettings, setShowSettings] = useState(false)

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
        checkOnboarding()
    }, [fetchMoments])

    const checkOnboarding = async () => {
        try {
            const res = await fetch('/api/user/profile')
            if (res.ok) {
                const data = await res.json()
                if (!data.isProfileComplete) {
                    setShowOnboarding(true)
                }
            }
        } catch (error) {
            console.error('Check onboarding error:', error)
        }
    }

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
            {/* Onboarding Modal */}
            {showOnboarding && (
                <OnboardingModal onComplete={() => setShowOnboarding(false)} />
            )}

            {/* Profile Popup */}
            {showProfilePopup && currentUser && (
                <ProfilePopup
                    user={currentUser}
                    onClose={() => setShowProfilePopup(false)}
                    onUpdate={fetchMoments}
                />
            )}

            {/* Settings Modal */}
            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
            />

            {/* Animated Background */}
            <AnimatedBackground />

            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-[var(--hf-border)] bg-white safe-area-top">
                <div className="max-w-2xl mx-auto px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <img src="/eat_what_logo.png" alt="Eat What" className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg" />
                        <div>
                            <h1 className="font-bold text-[var(--hf-text)] logo-font text-sm sm:text-base">Eat_What</h1>
                            <p className="text-xs text-[var(--hf-text-muted)] hidden sm:block">
                                {users.length === 2 ? '💕 空间已配对' : '⏳ 等待另一半加入'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => router.push('/wishes')}
                            className="px-2 py-1.5 sm:px-3 sm:py-2 rounded-full bg-gradient-to-r from-[var(--hf-yellow-light)] to-white border border-[var(--hf-yellow)] hover:shadow-md transition-all flex items-center gap-1 flex-shrink-0 touch-feedback"
                        >
                            <span className="text-sm sm:text-base">✨</span>
                            <span className="text-xs sm:text-sm font-medium text-[var(--hf-text)]">心愿</span>
                        </button>

                        <button
                            onClick={() => router.push('/anniversary')}
                            className="px-2 py-1.5 sm:px-3 sm:py-2 rounded-full bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 hover:shadow-md transition-all flex items-center gap-1 flex-shrink-0 touch-feedback"
                        >
                            <span className="text-sm sm:text-base">💝</span>
                            <span className="text-xs sm:text-sm font-medium text-[var(--hf-text)]">期盼</span>
                        </button>

                        <button
                            onClick={() => router.push('/gallery')}
                            className="px-2 py-1.5 sm:px-3 sm:py-2 rounded-full bg-gradient-to-r from-pink-50 to-white border border-pink-200 hover:shadow-md transition-all flex items-center gap-1 flex-shrink-0 touch-feedback"
                        >
                            <span className="text-sm sm:text-base">💕</span>
                            <span className="text-xs sm:text-sm font-medium text-[var(--hf-text)]">日记</span>
                        </button>

                        <button
                            onClick={() => setShowSettings(true)}
                            className="px-2 py-1.5 sm:px-3 sm:py-2 rounded-full bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all text-xs sm:text-sm text-[var(--hf-text-muted)] flex items-center gap-1 flex-shrink-0 touch-feedback"
                        >
                            <span>⚙️</span>
                            <span className="hidden sm:inline">设置</span>
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

                {/* Couple Status Card */}
                <div className="mb-6">
                    <CoupleCard
                        currentUser={currentUser}
                        partner={partner}
                        onAvatarClick={() => setShowProfilePopup(true)}
                    />
                </div>

                {/* Swipeable Panel: CreateMoment <-> DailyInteraction */}
                <div className="mb-8">
                    <SwipeablePanel
                        leftPanel={
                            <CreateMoment
                                onSuccess={fetchMoments}
                                disabled={hasPostedToday}
                            />
                        }
                        rightPanel={
                            <DailyInteractionPanel hasPartner={!!partner} />
                        }
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
                                        onUpdate={fetchMoments}
                                        onDelete={() => setMoments(prev => prev.filter(m => m.id !== moment.id))}
                                    />
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-[var(--hf-border)] bg-white py-4 mt-8">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-[var(--hf-text-muted)]">💕 我们的故事</span>
                        <a
                            href="https://github.com/xyzxyq/Eat-What"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[var(--hf-text-muted)] hover:text-[var(--hf-yellow)] transition flex items-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
                            GitHub
                        </a>
                    </div>
                    <div className="text-center text-xs text-[var(--hf-text-muted)]">
                        <p className="mono">© {new Date().getFullYear()} Eat_What. Made with 💛 for couples.</p>
                        <p className="mt-1">MIT License • v0.1.0</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
