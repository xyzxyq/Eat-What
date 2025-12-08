'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Anniversary {
    id: string
    title: string
    date: string
    emoji: string
    type: 'countdown' | 'countup'
    isRecurring: boolean
    isPinned: boolean
    sortOrder: number
}

const EMOJI_OPTIONS = ['💕', '❤️', '🎂', '🎉', '💍', '✈️', '🏠', '👶', '🎓', '💼', '🌸', '⭐', '🎄', '🌹', '💝']

// 卡片尺寸和颜色配置
const CARD_SIZES = ['normal', 'large', 'wide'] as const
const CARD_COLORS = [
    { bg: 'from-rose-500 to-pink-600', shadow: 'shadow-rose-500/30' },
    { bg: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/30' },
    { bg: 'from-blue-500 to-cyan-600', shadow: 'shadow-blue-500/30' },
    { bg: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/30' },
    { bg: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/30' },
    { bg: 'from-fuchsia-500 to-pink-600', shadow: 'shadow-fuchsia-500/30' },
]

export default function AnniversaryPage() {
    const router = useRouter()
    const [anniversaries, setAnniversaries] = useState<Anniversary[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        emoji: '💕',
        type: 'countup' as 'countdown' | 'countup',
        isRecurring: false
    })
    const [saving, setSaving] = useState(false)
    const [animatingId, setAnimatingId] = useState<string | null>(null)
    const [animationDirection, setAnimationDirection] = useState<'up' | 'down' | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const fetchAnniversaries = useCallback(async () => {
        try {
            const res = await fetch('/api/anniversaries')
            if (res.status === 401) {
                router.push('/')
                return
            }
            if (res.ok) {
                const data = await res.json()
                setAnniversaries(data.anniversaries)
            }
        } catch (e) {
            console.error('Failed to fetch anniversaries:', e)
        } finally {
            setLoading(false)
        }
    }, [router])

    useEffect(() => {
        fetchAnniversaries()
    }, [fetchAnniversaries])

    const calculateDays = (date: string, type: string, isRecurring: boolean) => {
        const target = new Date(date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        target.setHours(0, 0, 0, 0)

        if (type === 'countup') {
            const diff = Math.floor((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24))
            return { days: diff, isCountdown: false, isPast: diff >= 0 }
        } else {
            let nextDate = new Date(target)
            if (isRecurring) {
                nextDate.setFullYear(today.getFullYear())
                if (nextDate < today) {
                    nextDate.setFullYear(today.getFullYear() + 1)
                }
            }
            const diff = Math.floor((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            return { days: diff, isCountdown: true, isPast: diff < 0 }
        }
    }

    const handleSubmit = async () => {
        if (!formData.title || !formData.date) return
        setSaving(true)
        try {
            const url = '/api/anniversaries'
            const method = editingId ? 'PUT' : 'POST'
            const body = editingId
                ? { id: editingId, ...formData }
                : { ...formData, sortOrder: anniversaries.length }

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if (res.ok) {
                setShowModal(false)
                setEditingId(null)
                setFormData({ title: '', date: '', emoji: '💕', type: 'countup', isRecurring: false })
                fetchAnniversaries()
            }
        } catch (e) {
            console.error('Failed to save:', e)
        } finally {
            setSaving(false)
        }
    }

    const handleEdit = (anniversary: Anniversary) => {
        setEditingId(anniversary.id)
        setFormData({
            title: anniversary.title,
            date: anniversary.date.split('T')[0],
            emoji: anniversary.emoji,
            type: anniversary.type,
            isRecurring: anniversary.isRecurring
        })
        setShowModal(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('确定删除这个纪念日吗？')) return
        try {
            await fetch(`/api/anniversaries?id=${id}`, { method: 'DELETE' })
            fetchAnniversaries()
        } catch (e) {
            console.error('Failed to delete:', e)
        }
    }

    // 置顶功能
    const handlePin = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            const res = await fetch('/api/anniversaries/pin', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            })
            if (res.ok) {
                fetchAnniversaries()
            }
        } catch (e) {
            console.error('Failed to pin:', e)
        }
    }

    // 带动画的移动
    const moveItem = async (id: string, direction: 'up' | 'down') => {
        const index = anniversaries.findIndex(a => a.id === id)
        if (direction === 'up' && index === 0) return
        if (direction === 'down' && index === anniversaries.length - 1) return

        // 触发动画
        setAnimatingId(id)
        setAnimationDirection(direction)

        // 等待动画
        await new Promise(resolve => setTimeout(resolve, 300))

        const newList = [...anniversaries]
        const swapIndex = direction === 'up' ? index - 1 : index + 1
            ;[newList[index], newList[swapIndex]] = [newList[swapIndex], newList[index]]
        setAnniversaries(newList)

        // 重置动画状态
        setAnimatingId(null)
        setAnimationDirection(null)

        try {
            await fetch('/api/anniversaries/reorder', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orders: newList.map((a, i) => ({ id: a.id, sortOrder: i }))
                })
            })
        } catch (e) {
            console.error('Failed to reorder:', e)
        }
    }

    // 获取卡片大小类型（根据索引变化）
    const getCardSize = (index: number): typeof CARD_SIZES[number] => {
        const pattern = [0, 1, 2, 0, 2, 1] // 交替模式
        return CARD_SIZES[pattern[index % pattern.length]]
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 animate-spin opacity-75 blur-sm"></div>
                        <div className="absolute inset-2 rounded-full bg-slate-900 flex items-center justify-center">
                            <span className="text-4xl">💝</span>
                        </div>
                    </div>
                    <p className="text-white/70 text-lg">加载中...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
            {/* 动态背景 */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {/* 大型装饰圆 */}
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl"></div>

                {/* 星星 */}
                {[...Array(30)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 3}s`,
                        }}
                    />
                ))}
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/50 border-b border-white/10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => router.push('/timeline')}
                        className="flex items-center gap-2 text-white/70 hover:text-white transition group"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform">←</span>
                        <span>返回</span>
                    </button>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-2xl animate-bounce">💝</span>
                        <span className="bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">期盼的日子</span>
                    </h1>
                    <button
                        onClick={() => {
                            setEditingId(null)
                            setFormData({ title: '', date: '', emoji: '💕', type: 'countup', isRecurring: false })
                            setShowModal(true)
                        }}
                        className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-full text-sm font-medium hover:shadow-lg hover:shadow-pink-500/30 hover:scale-105 transition-all"
                    >
                        ✨ 添加
                    </button>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 py-8 relative z-10" ref={containerRef}>
                {anniversaries.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="relative inline-block mb-8">
                            <div className="text-9xl animate-bounce">💝</div>
                            <div className="absolute -top-4 -right-4 text-3xl animate-ping">✨</div>
                            <div className="absolute -bottom-2 -left-4 text-2xl animate-pulse">💫</div>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">还没有添加任何纪念日</h2>
                        <p className="text-white/60 mb-10 text-lg">记录属于你们的每一个重要时刻</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-10 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500 text-white rounded-2xl font-medium text-lg hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-105 transition-all"
                        >
                            ✨ 创建第一个纪念日
                        </button>
                    </div>
                ) : (
                    <>
                        <p className="text-white/50 text-sm text-center mb-8">
                            点击卡片可编辑 · 使用 ↑↓ 调整顺序 · ⭐ 置顶优先显示
                        </p>

                        {/* 置顶项 - 紧凑设计 */}
                        {anniversaries.filter(a => a.isPinned).map((item) => {
                            const { days, isCountdown, isPast } = calculateDays(item.date, item.type, item.isRecurring)
                            const absDay = Math.abs(days)
                            return (
                                <div
                                    key={`pinned-${item.id}`}
                                    onClick={() => handleEdit(item)}
                                    className="relative mb-6 p-[2px] rounded-2xl cursor-pointer group animate-in fade-in slide-in-from-top-4 duration-500"
                                    style={{
                                        background: 'linear-gradient(135deg, #f59e0b, #ec4899, #8b5cf6, #f59e0b)',
                                        backgroundSize: '300% 300%',
                                        animation: 'gradient-shift 3s ease infinite',
                                    }}
                                >
                                    <div className="relative overflow-hidden rounded-[calc(1rem-2px)] bg-gradient-to-br from-slate-800 via-purple-900/90 to-slate-900 px-4 py-3 sm:px-6 sm:py-4">
                                        {/* 光效装饰 */}
                                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl"></div>
                                            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-pink-500/20 rounded-full blur-2xl"></div>
                                        </div>

                                        {/* 主内容 - 一行式紧凑布局 */}
                                        <div className="relative flex items-center gap-3 sm:gap-4">
                                            {/* 置顶标识 */}
                                            <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-lg shadow-amber-500/30 shrink-0">
                                                <span className="text-xs" style={{ animation: 'spin 3s linear infinite' }}>⭐</span>
                                                <span className="text-white text-[10px] font-bold hidden sm:inline">置顶</span>
                                            </div>

                                            {/* Emoji */}
                                            <div className="text-3xl sm:text-4xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                                                {item.emoji}
                                            </div>

                                            {/* 标题和日期 */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base sm:text-lg font-bold text-white drop-shadow-lg truncate">
                                                    {item.title}
                                                </h3>
                                                <p className="text-white/50 text-xs">
                                                    {new Date(item.date).toLocaleDateString('zh-CN', {
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>

                                            {/* 天数 */}
                                            <div className="shrink-0 text-right">
                                                <div className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-amber-400 via-pink-400 to-violet-400 bg-clip-text text-transparent leading-none">
                                                    {absDay}
                                                </div>
                                                <div className="text-white/70 text-xs sm:text-sm font-medium">
                                                    {isCountdown
                                                        ? (isPast ? '天前' : '天后')
                                                        : (days >= 0 ? '天' : '天前')
                                                    }
                                                </div>
                                            </div>

                                            {/* 取消置顶按钮 */}
                                            <button
                                                onClick={(e) => handlePin(item.id, e)}
                                                className="shrink-0 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/50 hover:text-white text-xs transition-all"
                                                title="取消置顶"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}

                        {/* 蜂巢/瀑布流布局 */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-fr">
                            {anniversaries.filter(a => !a.isPinned).map((item, index) => {
                                const { days, isCountdown, isPast } = calculateDays(item.date, item.type, item.isRecurring)
                                const absDay = Math.abs(days)
                                const color = CARD_COLORS[index % CARD_COLORS.length]
                                const size = getCardSize(index)
                                const isAnimating = animatingId === item.id

                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => handleEdit(item)}
                                        className={`
                                            group relative overflow-hidden rounded-3xl cursor-pointer
                                            transition-all duration-300 ease-out
                                            ${size === 'large' ? 'row-span-2' : ''}
                                            ${size === 'wide' ? 'col-span-2 md:col-span-1' : ''}
                                            ${isAnimating ? (animationDirection === 'up' ? 'animate-slide-up' : 'animate-slide-down') : ''}
                                            hover:scale-[1.03] hover:z-10
                                        `}
                                        style={{
                                            minHeight: size === 'large' ? '280px' : '140px',
                                        }}
                                    >
                                        {/* 背景渐变 */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${color.bg}`}></div>

                                        {/* 光效 */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/20"></div>
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

                                        {/* 内容 */}
                                        <div className={`relative h-full flex flex-col justify-between p-5 ${size === 'large' ? 'p-6' : ''}`}>
                                            {/* 顶部：Emoji和标题 */}
                                            <div>
                                                <div className={`${size === 'large' ? 'text-5xl mb-3' : 'text-3xl mb-2'}`}>
                                                    {item.emoji}
                                                </div>
                                                <h3 className={`font-bold text-white drop-shadow-lg ${size === 'large' ? 'text-xl' : 'text-base'}`}>
                                                    {item.title}
                                                </h3>
                                                {size === 'large' && (
                                                    <p className="text-white/70 text-sm mt-1">
                                                        {new Date(item.date).toLocaleDateString('zh-CN', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                )}
                                            </div>

                                            {/* 底部：天数 */}
                                            <div className="mt-auto">
                                                <div className={`font-black text-white drop-shadow-lg ${size === 'large' ? 'text-6xl' : 'text-4xl'}`}>
                                                    {absDay}
                                                </div>
                                                <div className="text-white/80 text-sm font-medium">
                                                    {isCountdown
                                                        ? (isPast ? '天前' : '天后')
                                                        : (days >= 0 ? '天' : '天前')
                                                    }
                                                    {item.isRecurring && ' 🔄'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* 操作按钮 */}
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all flex flex-col gap-1">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); moveItem(item.id, 'up') }}
                                                disabled={index === 0}
                                                className="p-1.5 bg-black/40 backdrop-blur rounded-lg text-white/80 hover:text-white hover:bg-black/60 transition disabled:opacity-30 text-xs"
                                            >
                                                ↑
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); moveItem(item.id, 'down') }}
                                                disabled={index === anniversaries.length - 1}
                                                className="p-1.5 bg-black/40 backdrop-blur rounded-lg text-white/80 hover:text-white hover:bg-black/60 transition disabled:opacity-30 text-xs"
                                            >
                                                ↓
                                            </button>
                                            {!item.isPinned && (
                                                <button
                                                    onClick={(e) => handlePin(item.id, e)}
                                                    className="p-1.5 bg-black/40 backdrop-blur rounded-lg text-white/80 hover:text-amber-400 hover:bg-black/60 transition text-xs"
                                                    title="置顶"
                                                >
                                                    ⭐
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(item.id) }}
                                                className="p-1.5 bg-black/40 backdrop-blur rounded-lg text-white/80 hover:text-red-400 hover:bg-black/60 transition text-xs"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}
            </main>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div
                        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/10 animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="relative p-8 text-center overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/30 via-purple-500/30 to-violet-500/30"></div>
                            <div className="absolute inset-0 backdrop-blur-xl"></div>
                            <div className="relative">
                                <div className="text-5xl mb-3 animate-bounce">{formData.emoji || '💝'}</div>
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
                                    {editingId ? '编辑纪念日' : '新的纪念日'}
                                </h2>
                            </div>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">📝 标题</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="例如：在一起、生日、周年纪念..."
                                    className="w-full px-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-pink-400/50 focus:ring-2 focus:ring-pink-400/20 focus:bg-white/10 transition-all outline-none"
                                />
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">📅 日期</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                    className="w-full px-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-pink-400/50 focus:ring-2 focus:ring-pink-400/20 focus:bg-white/10 transition-all outline-none"
                                />
                            </div>

                            {/* Emoji */}
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">✨ 图标</label>
                                <div className="flex flex-wrap gap-2">
                                    {EMOJI_OPTIONS.map(emoji => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, emoji }))}
                                            className={`w-11 h-11 text-xl rounded-xl transition-all duration-200 ${formData.emoji === emoji
                                                ? 'bg-gradient-to-br from-pink-500 to-violet-500 scale-110 shadow-lg shadow-pink-500/30'
                                                : 'bg-white/5 hover:bg-white/10 hover:scale-105'
                                                }`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">⏱️ 类型</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, type: 'countup' }))}
                                        className={`py-3.5 rounded-2xl border-2 transition-all font-medium ${formData.type === 'countup'
                                            ? 'border-pink-400 bg-pink-500/20 text-pink-300 shadow-lg shadow-pink-500/20'
                                            : 'border-white/10 text-white/50 hover:border-white/20 hover:bg-white/5'
                                            }`}
                                    >
                                        📅 已过天数
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, type: 'countdown' }))}
                                        className={`py-3.5 rounded-2xl border-2 transition-all font-medium ${formData.type === 'countdown'
                                            ? 'border-violet-400 bg-violet-500/20 text-violet-300 shadow-lg shadow-violet-500/20'
                                            : 'border-white/10 text-white/50 hover:border-white/20 hover:bg-white/5'
                                            }`}
                                    >
                                        ⏳ 倒计时
                                    </button>
                                </div>
                            </div>

                            {/* Recurring */}
                            {formData.type === 'countdown' && (
                                <label className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl cursor-pointer hover:bg-white/10 transition-all group">
                                    <input
                                        type="checkbox"
                                        checked={formData.isRecurring}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                                        className="w-5 h-5 accent-violet-500 rounded"
                                    />
                                    <span className="text-white/70 group-hover:text-white/90 transition">🔄 每年重复提醒</span>
                                </label>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 p-6 bg-black/20">
                            <button
                                onClick={() => {
                                    setShowModal(false)
                                    setEditingId(null)
                                }}
                                className="flex-1 py-3.5 rounded-2xl border border-white/10 text-white/70 font-medium hover:bg-white/5 hover:text-white transition-all"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={saving || !formData.title || !formData.date}
                                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 text-white font-medium hover:shadow-lg hover:shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {saving ? '保存中...' : '💾 保存'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes twinkle {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
                @keyframes slide-up {
                    0% { transform: translateY(0); }
                    50% { transform: translateY(-20px); opacity: 0.5; }
                    100% { transform: translateY(0); }
                }
                @keyframes slide-down {
                    0% { transform: translateY(0); }
                    50% { transform: translateY(20px); opacity: 0.5; }
                    100% { transform: translateY(0); }
                }
                @keyframes gradient-shift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
                .animate-slide-down {
                    animation: slide-down 0.3s ease-out;
                }
            `}</style>
        </div>
    )
}
