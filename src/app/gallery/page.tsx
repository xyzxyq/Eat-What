'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import GalleryCard from '@/components/GalleryCard'
import UserAvatar from '@/components/UserAvatar'
import AnimatedBackground from '@/components/AnimatedBackground'
import confetti from 'canvas-confetti'

interface UserData {
    id: string
    nickname: string
    displayName?: string | null
    avatarEmoji: string
    avatarUrl?: string | null
    status: string
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

export default function GalleryPage() {
    const router = useRouter()
    const [moments, setMoments] = useState<MomentData[]>([])
    const [users, setUsers] = useState<UserData[]>([])
    const [currentUserId, setCurrentUserId] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [showStatusPicker, setShowStatusPicker] = useState(false)
    const [customStatus, setCustomStatus] = useState('')
    const [showCustomInput, setShowCustomInput] = useState(false)
    const [startDate, setStartDate] = useState<string | null>(null)
    const [editingDate, setEditingDate] = useState(false)
    const [newStartDate, setNewStartDate] = useState('')

    const PRESET_STATUSES = [
        '😊 心情很好',
        '😴 困困的',
        '💪 充满能量',
        '🥰 想你了',
        '😋 饿了',
        '🎮 在玩游戏',
        '📚 在学习',
        '🎵 在听歌',
        '🏃 在运动',
        '😢 有点难过',
    ]

    const fetchMoments = useCallback(async () => {
        try {
            const res = await fetch('/api/moments')
            if (res.status === 401) {
                router.push('/')
                return
            }
            if (!res.ok) throw new Error('Failed to fetch')

            const data = await res.json()
            setMoments(data.moments)
            setUsers(data.users)
            setCurrentUserId(data.currentUserId)
        } catch {
            console.error('Failed to load moments')
        } finally {
            setLoading(false)
        }
    }, [router])

    useEffect(() => {
        fetchMoments()
        fetchStartDate()
    }, [fetchMoments])

    const fetchStartDate = async () => {
        const res = await fetch('/api/space')
        if (res.ok) {
            const data = await res.json()
            setStartDate(data.startDate)
        }
    }

    const handleUpdateStartDate = async () => {
        await fetch('/api/space', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ startDate: newStartDate })
        })
        setEditingDate(false)
        fetchStartDate()

        // 🌸 花朵爱心特效
        const shapes = ['🌸', '🌺', '🌻', '🌷', '🌹', '❤️', '💕', '💖', '💗', '💝']
        const defaults = {
            spread: 360,
            ticks: 100,
            gravity: 0.5,
            decay: 0.94,
            startVelocity: 30,
            origin: { y: 0.3 }
        }

        function shoot() {
            confetti({
                ...defaults,
                particleCount: 40,
                scalar: 1.2,
                shapes: ['circle'],
                colors: ['#ff69b4', '#ff1493', '#ffb6c1', '#ffc0cb', '#ff6b6b', '#ffd700']
            })
        }

        shoot()
        setTimeout(shoot, 100)
        setTimeout(shoot, 200)
    }

    const calculateDays = () => {
        if (!startDate) return 0
        // Parse the start date and normalize to local midnight
        const start = new Date(startDate)
        const startLocal = new Date(start.getFullYear(), start.getMonth(), start.getDate())

        // Get today at local midnight
        const today = new Date()
        const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate())

        const diffTime = todayLocal.getTime() - startLocal.getTime()
        return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
    }

    const formatStartDate = () => {
        if (!startDate) return null
        const d = new Date(startDate)
        return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
    }

    const handleSelectStatus = async (status: string) => {
        await fetch('/api/user/status', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        })
        setShowStatusPicker(false)
        setShowCustomInput(false)
        setCustomStatus('')
        fetchMoments()
    }

    const handleClearStatus = async () => {
        await handleSelectStatus('')
    }

    const currentUser = users.find(u => u.id === currentUserId)
    const partner = users.find(u => u.id !== currentUserId)

    // 按日期分组
    const groupedByDate = moments.reduce((acc, moment) => {
        const date = new Date(moment.momentDate).toLocaleDateString('zh-CN')
        if (!acc[date]) acc[date] = []
        acc[date].push(moment)
        return acc
    }, {} as Record<string, MomentData[]>)

    // 获取所有日期并排序（最新在前）
    const sortedDates = Object.keys(groupedByDate).sort((a, b) =>
        new Date(b).getTime() - new Date(a).getTime()
    )

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--hf-bg-alt)] flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4 animate-bounce">💕</div>
                    <p className="text-[var(--hf-text-muted)]">加载中...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[var(--hf-bg-alt)] relative">
            {/* Animated Background */}
            <AnimatedBackground />

            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-[var(--hf-border)] bg-white">
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">💕</span>
                        <h1 className="font-bold text-[var(--hf-text)]">我们的日子</h1>
                    </div>
                    <button
                        onClick={() => router.push('/timeline')}
                        className="text-sm text-[var(--hf-text-muted)] hover:text-[var(--hf-text)] transition flex items-center gap-1"
                    >
                        ← 返回
                    </button>
                </div>
            </header>

            {/* Anniversary Counter Banner */}
            <div className="bg-gradient-to-r from-[var(--hf-yellow-light)] to-white border-b border-[var(--hf-border)]">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    {editingDate ? (
                        <div className="flex items-center justify-center gap-3 flex-wrap">
                            <span className="text-[var(--hf-text)]">选择你们的起始日期：</span>
                            <input
                                type="date"
                                value={newStartDate}
                                onChange={e => setNewStartDate(e.target.value)}
                                className="hf-input text-sm w-auto"
                            />
                            <button onClick={handleUpdateStartDate} className="hf-button text-sm px-3">
                                保存
                            </button>
                            <button
                                onClick={() => setEditingDate(false)}
                                className="text-sm text-[var(--hf-text-muted)]"
                            >
                                取消
                            </button>
                        </div>
                    ) : startDate ? (
                        <div
                            onClick={() => {
                                setNewStartDate(startDate.split('T')[0])
                                setEditingDate(true)
                            }}
                            className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap cursor-pointer hover:opacity-80 transition"
                        >
                            <span className="text-[var(--hf-text-muted)] text-sm">从</span>
                            <div className="px-3 py-1.5 bg-white border-2 border-[var(--hf-yellow)] rounded-xl shadow-sm">
                                <span className="text-base sm:text-lg font-bold text-[var(--hf-text)]">{formatStartDate()}</span>
                            </div>
                            <span className="text-[var(--hf-text-muted)] text-sm">到今天，我们走过了</span>
                            <div className="px-4 py-1.5 bg-[var(--hf-yellow)] rounded-xl shadow-sm">
                                <span className="text-xl sm:text-2xl font-bold text-white">{calculateDays()}</span>
                                <span className="text-white text-sm sm:text-base ml-1">个日子</span>
                            </div>
                            <span className="text-xs text-[var(--hf-text-muted)]">✏️</span>
                        </div>
                    ) : (
                        <div
                            onClick={() => setEditingDate(true)}
                            className="text-center cursor-pointer hover:opacity-80 transition py-4"
                        >
                            <p className="text-[var(--hf-text-muted)]">💕 设置你们在一起的日期，开始计算走过的日子吧~</p>
                        </div>
                    )}
                </div>
            </div>

            {/* User Status Headers */}
            {users.length === 2 && (
                <div className="sticky top-[57px] z-40 border-b border-[var(--hf-border)] bg-white">
                    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 px-4 py-4">
                        {/* Current User Column Header */}
                        <div className="hf-card p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <UserAvatar
                                    avatarUrl={currentUser?.avatarUrl}
                                    avatarEmoji={currentUser?.avatarEmoji}
                                    size="lg"
                                />
                                <span className="font-semibold text-[var(--hf-text)]">{currentUser?.nickname}</span>
                                <span className="text-xs text-[var(--hf-text-muted)]">(我)</span>
                            </div>
                            {showStatusPicker ? (
                                <div className="space-y-3">
                                    {/* Preset Options */}
                                    <div className="flex flex-wrap gap-2">
                                        {PRESET_STATUSES.map(status => (
                                            <button
                                                key={status}
                                                onClick={() => handleSelectStatus(status)}
                                                className="px-3 py-1.5 text-sm bg-[var(--hf-bg-alt)] border border-[var(--hf-border)] rounded-full hover:border-[var(--hf-yellow)] hover:bg-[var(--hf-yellow-light)] transition"
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Custom Input */}
                                    {showCustomInput ? (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={customStatus}
                                                onChange={e => setCustomStatus(e.target.value)}
                                                placeholder="自定义状态..."
                                                maxLength={50}
                                                className="hf-input text-sm flex-1"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => customStatus.trim() && handleSelectStatus(customStatus.trim())}
                                                className="hf-button text-sm px-3"
                                                disabled={!customStatus.trim()}
                                            >
                                                确定
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowCustomInput(true)}
                                            className="text-sm text-[var(--hf-text-muted)] hover:text-[var(--hf-text)]"
                                        >
                                            ✏️ 自定义状态
                                        </button>
                                    )}

                                    {/* Cancel */}
                                    <div className="pt-2 border-t border-[var(--hf-border)]">
                                        <button
                                            onClick={() => {
                                                setShowStatusPicker(false)
                                                setShowCustomInput(false)
                                            }}
                                            className="text-sm text-[var(--hf-text-muted)] hover:text-[var(--hf-text)]"
                                        >
                                            取消
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() => setShowStatusPicker(true)}
                                    className="text-sm cursor-pointer hover:opacity-80 transition flex items-center gap-2"
                                >
                                    {currentUser?.status ? (
                                        <>
                                            <span className="text-[var(--hf-text)]">{currentUser.status}</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleClearStatus()
                                                }}
                                                className="text-xs text-[var(--hf-text-muted)] hover:text-red-500"
                                            >
                                                ✕
                                            </button>
                                        </>
                                    ) : (
                                        <span className="text-[var(--hf-text-muted)]">添加当前的状态吧~</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Partner Column Header */}
                        <div className="hf-card p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <UserAvatar
                                    avatarUrl={partner?.avatarUrl}
                                    avatarEmoji={partner?.avatarEmoji}
                                    size="lg"
                                />
                                <span className="font-semibold text-[var(--hf-text)]">{partner?.nickname}</span>
                            </div>
                            <div className="text-sm text-[var(--hf-text-muted)]">
                                {partner?.status || '暂无状态'}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Gallery Content */}
            <main className="max-w-5xl mx-auto px-4 py-6">
                {sortedDates.length === 0 ? (
                    <div className="hf-card text-center py-12">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-xl font-semibold text-[var(--hf-text)] mb-2">
                            还没有任何记录
                        </h3>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {sortedDates.map(date => {
                            const dayMoments = groupedByDate[date]
                            const currentMoment = dayMoments.find(m => m.user.id === currentUserId)
                            const partnerMoment = dayMoments.find(m => m.user.id !== currentUserId)

                            return (
                                <div key={date}>
                                    {/* Date Header */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-lg">📅</span>
                                        <span className="font-semibold text-[var(--hf-text)] mono">{date}</span>
                                    </div>

                                    {/* Two Column Layout */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Current User Column */}
                                        <div>
                                            {currentMoment ? (
                                                <GalleryCard
                                                    moment={currentMoment}
                                                    currentUserId={currentUserId}
                                                    onUpdate={fetchMoments}
                                                />
                                            ) : (
                                                <div className="hf-card bg-[var(--hf-bg-alt)] text-center py-8 opacity-50">
                                                    <p className="text-[var(--hf-text-muted)]">无记录</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Partner Column */}
                                        <div>
                                            {partnerMoment ? (
                                                <GalleryCard
                                                    moment={partnerMoment}
                                                    currentUserId={currentUserId}
                                                    onUpdate={fetchMoments}
                                                />
                                            ) : (
                                                <div className="hf-card bg-[var(--hf-bg-alt)] text-center py-8 opacity-50">
                                                    <p className="text-[var(--hf-text-muted)]">无记录</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-[var(--hf-border)] bg-white py-4 mt-8">
                <div className="max-w-4xl mx-auto px-4 text-center text-xs text-[var(--hf-text-muted)]">
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
        </div>
    )
}
