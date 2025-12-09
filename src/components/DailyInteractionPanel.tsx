'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface DailyInteractionPanelProps {
    hasPartner: boolean
}

interface InteractionStatus {
    currentUserDone: boolean
    partnerDone: boolean
    bothDone: boolean
}

interface StatsData {
    streak: number
    total: number
    thisMonth: string[]
}

export default function DailyInteractionPanel({ hasPartner }: DailyInteractionPanelProps) {
    const [kissStatus, setKissStatus] = useState<InteractionStatus>({ currentUserDone: false, partnerDone: false, bothDone: false })
    const [kissStats, setKissStats] = useState<StatsData | null>(null)
    const [kissing, setKissing] = useState(false)
    const [showKissHearts, setShowKissHearts] = useState(false)

    const [hugStatus, setHugStatus] = useState<InteractionStatus>({ currentUserDone: false, partnerDone: false, bothDone: false })
    const [hugStats, setHugStats] = useState<StatsData | null>(null)
    const [hugging, setHugging] = useState(false)
    const [showHugEmoji, setShowHugEmoji] = useState(false)

    const [goodnightStatus, setGoodnightStatus] = useState<InteractionStatus>({ currentUserDone: false, partnerDone: false, bothDone: false })
    const [goodnightStats, setGoodnightStats] = useState<StatsData | null>(null)
    const [isGoodnightTime, setIsGoodnightTime] = useState(false)
    const [saying, setSaying] = useState(false)
    const [showStars, setShowStars] = useState(false)

    const [graphType, setGraphType] = useState<'kiss' | 'hug' | 'goodnight'>('kiss')
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [showZoom, setShowZoom] = useState(false)
    const longPressTimer = useRef<NodeJS.Timeout | null>(null)
    const lastClickTime = useRef<number>(0)

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAll()
    }, [])

    const fetchAll = async () => {
        try {
            const [kissRes, hugRes, goodnightRes] = await Promise.all([
                fetch('/api/daily-kiss'),
                fetch('/api/daily-hug'),
                fetch('/api/goodnight')
            ])

            if (kissRes.ok) {
                const data = await kissRes.json()
                setKissStatus({ currentUserDone: data.currentUserKissed, partnerDone: data.partnerKissed, bothDone: data.bothKissed })
                setKissStats(data.stats)
            }

            if (hugRes.ok) {
                const data = await hugRes.json()
                setHugStatus({ currentUserDone: data.currentUserHugged, partnerDone: data.partnerHugged, bothDone: data.bothHugged })
                setHugStats(data.stats)
            }

            if (goodnightRes.ok) {
                const data = await goodnightRes.json()
                setGoodnightStatus({ currentUserDone: data.currentUserSaid, partnerDone: data.partnerSaid, bothDone: data.bothSaid })
                setGoodnightStats(data.stats)
                setIsGoodnightTime(data.isGoodnightTime)
            }
        } catch (e) {
            console.error('Failed to fetch:', e)
        } finally {
            setLoading(false)
        }
    }

    const handleKiss = async () => {
        if (kissStatus.currentUserDone || kissing) return
        setKissing(true)
        try {
            const res = await fetch('/api/daily-kiss', { method: 'POST' })
            const data = await res.json()
            if (res.ok) {
                setKissStatus(prev => ({ ...prev, currentUserDone: true, bothDone: data.bothKissed }))
                setKissStats(data.stats)
                if (data.bothKissed) {
                    setShowKissHearts(true)
                    setTimeout(() => setShowKissHearts(false), 2000)
                }
            }
        } catch (e) {
            console.error('Kiss failed:', e)
        } finally {
            setKissing(false)
        }
    }

    const handleHug = async () => {
        if (hugStatus.currentUserDone || hugging) return
        setHugging(true)
        try {
            const res = await fetch('/api/daily-hug', { method: 'POST' })
            const data = await res.json()
            if (res.ok) {
                setHugStatus(prev => ({ ...prev, currentUserDone: true, bothDone: data.bothHugged }))
                setHugStats(data.stats)
                if (data.bothHugged) {
                    setShowHugEmoji(true)
                    setTimeout(() => setShowHugEmoji(false), 2000)
                }
            }
        } catch (e) {
            console.error('Hug failed:', e)
        } finally {
            setHugging(false)
        }
    }

    const handleGoodnight = async () => {
        if (goodnightStatus.currentUserDone || saying || !isGoodnightTime) return
        setSaying(true)
        try {
            const res = await fetch('/api/goodnight', { method: 'POST' })
            const data = await res.json()
            if (res.ok) {
                setGoodnightStatus(prev => ({ ...prev, currentUserDone: true, bothDone: data.bothSaid }))
                setGoodnightStats(data.stats)
                if (data.bothSaid) {
                    setShowStars(true)
                    setTimeout(() => setShowStars(false), 2000)
                }
            }
        } catch (e) {
            console.error('Goodnight failed:', e)
        } finally {
            setSaying(false)
        }
    }

    const handleGraphLongPressStart = () => {
        longPressTimer.current = setTimeout(() => {
            setIsTransitioning(true)
            setTimeout(() => {
                setGraphType(prev => prev === 'kiss' ? 'hug' : prev === 'hug' ? 'goodnight' : 'kiss')
                setTimeout(() => setIsTransitioning(false), 300)
            }, 150)
        }, 800)
    }

    const handleGraphLongPressEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current)
            longPressTimer.current = null
        }
    }

    // 双击放大
    const handleDoubleClick = () => {
        const now = Date.now()
        if (now - lastClickTime.current < 300) {
            setShowZoom(true)
        }
        lastClickTime.current = now
    }

    if (!hasPartner || loading) return null

    const currentStats = graphType === 'kiss' ? kissStats : graphType === 'hug' ? hugStats : goodnightStats

    return (
        <>
            <div className="hf-card min-h-[280px] flex items-center justify-center">
                <div className="flex gap-3 items-stretch justify-center">
                    {/* 左侧：三个正方形按钮竖排 */}
                    <div className="flex flex-col gap-2">
                        {/* 亲亲按钮 */}
                        <div className="relative">
                            {showKissHearts && (
                                <div className="absolute -inset-2 pointer-events-none z-20">
                                    {[...Array(8)].map((_, i) => (
                                        <span key={i} className="absolute text-sm animate-ping"
                                            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 0.3}s` }}>
                                            {['💕', '💗', '💖'][i % 3]}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <button
                                onClick={handleKiss}
                                disabled={kissStatus.currentUserDone || kissing}
                                className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all ${kissStatus.bothDone
                                    ? 'bg-gradient-to-br from-pink-200 to-red-200 border-2 border-pink-400'
                                    : kissStatus.currentUserDone
                                        ? 'bg-pink-100 border border-pink-300'
                                        : 'bg-white border border-pink-200 hover:bg-pink-50 hover:scale-105 active:scale-95'
                                    }`}
                                title="每日亲亲"
                            >
                                <span className={`text-xl ${kissing ? 'animate-bounce' : ''}`}>
                                    {kissStatus.bothDone ? '💕' : kissStatus.currentUserDone ? '💋' : '😘'}
                                </span>
                                <div className="flex gap-0.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${kissStatus.currentUserDone ? 'bg-pink-500' : 'bg-gray-300'}`} />
                                    <div className={`w-1.5 h-1.5 rounded-full ${kissStatus.partnerDone ? 'bg-pink-500' : 'bg-gray-300'}`} />
                                </div>
                            </button>
                        </div>

                        {/* 抱抱按钮 */}
                        <div className="relative">
                            {showHugEmoji && (
                                <div className="absolute -inset-2 pointer-events-none z-20">
                                    {[...Array(8)].map((_, i) => (
                                        <span key={i} className="absolute text-sm animate-ping"
                                            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 0.3}s` }}>
                                            {['🤗', '💛', '🫂'][i % 3]}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <button
                                onClick={handleHug}
                                disabled={hugStatus.currentUserDone || hugging}
                                className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all ${hugStatus.bothDone
                                    ? 'bg-gradient-to-br from-amber-200 to-orange-200 border-2 border-amber-400'
                                    : hugStatus.currentUserDone
                                        ? 'bg-amber-100 border border-amber-300'
                                        : 'bg-white border border-amber-200 hover:bg-amber-50 hover:scale-105 active:scale-95'
                                    }`}
                                title="每日抱抱"
                            >
                                <span className={`text-xl ${hugging ? 'animate-bounce' : ''}`}>
                                    {hugStatus.bothDone ? '🫂' : hugStatus.currentUserDone ? '🤗' : '🤗'}
                                </span>
                                <div className="flex gap-0.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${hugStatus.currentUserDone ? 'bg-amber-500' : 'bg-gray-300'}`} />
                                    <div className={`w-1.5 h-1.5 rounded-full ${hugStatus.partnerDone ? 'bg-amber-500' : 'bg-gray-300'}`} />
                                </div>
                            </button>
                        </div>

                        {/* 晚安按钮 */}
                        <div className="relative">
                            {showStars && (
                                <div className="absolute -inset-2 pointer-events-none z-20">
                                    {[...Array(8)].map((_, i) => (
                                        <span key={i} className="absolute text-sm animate-ping"
                                            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 0.3}s` }}>
                                            {['⭐', '✨', '💫'][i % 3]}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <button
                                onClick={handleGoodnight}
                                disabled={goodnightStatus.currentUserDone || saying || !isGoodnightTime}
                                className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all ${goodnightStatus.bothDone
                                    ? 'bg-gradient-to-br from-indigo-200 to-purple-200 border-2 border-indigo-400'
                                    : goodnightStatus.currentUserDone
                                        ? 'bg-indigo-100 border border-indigo-300'
                                        : !isGoodnightTime
                                            ? 'bg-gray-100 border border-gray-200 opacity-50 cursor-not-allowed'
                                            : 'bg-white border border-indigo-200 hover:bg-indigo-50 hover:scale-105 active:scale-95'
                                    }`}
                                title={isGoodnightTime ? '晚安打卡' : '20:00-06:00'}
                            >
                                <span className={`text-xl ${saying ? 'animate-bounce' : ''}`}>
                                    {goodnightStatus.bothDone ? '💫' : goodnightStatus.currentUserDone ? '🌙' : '😴'}
                                </span>
                                <div className="flex gap-0.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${goodnightStatus.currentUserDone ? 'bg-yellow-400' : 'bg-gray-300'}`} />
                                    <div className={`w-1.5 h-1.5 rounded-full ${goodnightStatus.partnerDone ? 'bg-yellow-400' : 'bg-gray-300'}`} />
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* 右侧：月度打卡表 */}
                    <div
                        className={`rounded-xl p-2.5 border-2 transition-all duration-300 cursor-pointer ${graphType === 'kiss'
                            ? 'bg-gradient-to-br from-pink-50 to-white border-pink-300 shadow-md shadow-pink-100'
                            : graphType === 'hug'
                                ? 'bg-gradient-to-br from-amber-50 to-white border-amber-300 shadow-md shadow-amber-100'
                                : 'bg-gradient-to-br from-indigo-50 to-white border-indigo-300 shadow-md shadow-indigo-100'
                            } ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                        onMouseDown={handleGraphLongPressStart}
                        onMouseUp={handleGraphLongPressEnd}
                        onMouseLeave={handleGraphLongPressEnd}
                        onTouchStart={handleGraphLongPressStart}
                        onTouchEnd={handleGraphLongPressEnd}
                        onClick={handleDoubleClick}
                    >
                        {/* 标题行 */}
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1">
                                <span className="text-xs">{graphType === 'kiss' ? '💋' : graphType === 'hug' ? '🤗' : '🌙'}</span>
                                <span className="text-[10px] font-medium text-gray-600">
                                    {graphType === 'kiss' ? '亲亲' : graphType === 'hug' ? '抱抱' : '晚安'}
                                </span>
                            </div>
                            <div className="text-[10px] text-gray-500 font-medium">
                                🔥{currentStats?.streak || 0} · ✓{currentStats?.total || 0}
                            </div>
                        </div>

                        {/* 紧凑日历格子 */}
                        <CompactMonthGrid
                            checkedDates={currentStats?.thisMonth || []}
                            color={graphType === 'kiss' ? 'pink' : graphType === 'hug' ? 'amber' : 'indigo'}
                        />

                        <div className="text-[7px] text-gray-400 text-center mt-1">
                            长按切换 · 双击放大
                        </div>
                    </div>
                </div>
            </div>

            {/* 放大弹窗 - 使用 Portal 渲染到 body */}
            {showZoom && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
                    onClick={() => setShowZoom(false)}
                >
                    <div
                        className={`bg-white rounded-2xl p-4 w-full max-w-sm shadow-xl ${graphType === 'kiss' ? 'border-2 border-pink-300' : graphType === 'hug' ? 'border-2 border-amber-300' : 'border-2 border-indigo-300'
                            }`}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">{graphType === 'kiss' ? '💋' : graphType === 'hug' ? '🤗' : '🌙'}</span>
                                <span className="font-medium">
                                    {graphType === 'kiss' ? '亲亲' : graphType === 'hug' ? '抱抱' : '晚安'}打卡表
                                </span>
                            </div>
                            <button
                                onClick={() => setShowZoom(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >✕</button>
                        </div>

                        <div className="flex justify-center gap-6 mb-4 text-sm">
                            <div className="text-center">
                                <div className={`text-2xl font-bold ${graphType === 'kiss' ? 'text-pink-500' : graphType === 'hug' ? 'text-amber-500' : 'text-indigo-500'}`}>
                                    {currentStats?.streak || 0}
                                </div>
                                <div className="text-gray-500">连续天数</div>
                            </div>
                            <div className="text-center">
                                <div className={`text-2xl font-bold ${graphType === 'kiss' ? 'text-pink-500' : graphType === 'hug' ? 'text-amber-500' : 'text-indigo-500'}`}>
                                    {currentStats?.total || 0}
                                </div>
                                <div className="text-gray-500">累计次数</div>
                            </div>
                        </div>

                        <FullMonthGrid
                            checkedDates={currentStats?.thisMonth || []}
                            color={graphType === 'kiss' ? 'pink' : graphType === 'hug' ? 'amber' : 'indigo'}
                        />

                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => setGraphType('kiss')}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${graphType === 'kiss'
                                    ? 'bg-pink-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >💋 亲亲</button>
                            <button
                                onClick={() => setGraphType('hug')}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${graphType === 'hug'
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >🤗 抱抱</button>
                            <button
                                onClick={() => setGraphType('goodnight')}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${graphType === 'goodnight'
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >🌙 晚安</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}

// 紧凑版月度格子（无数字）
function CompactMonthGrid({ checkedDates, color }: { checkedDates: string[], color: 'pink' | 'amber' | 'indigo' }) {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfWeek = new Date(year, month, 1).getDay()

    const days: (number | null)[] = []
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)

    const isChecked = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        return checkedDates.includes(dateStr)
    }

    const today = now.getDate()
    const bgColor = color === 'pink' ? 'bg-pink-500' : color === 'amber' ? 'bg-amber-500' : 'bg-indigo-500'

    return (
        <div className="grid grid-cols-7 gap-[3px]">
            {days.map((day, i) => (
                <div
                    key={i}
                    className={`w-[18px] h-[18px] rounded-sm ${day === null
                        ? ''
                        : isChecked(day)
                            ? `${bgColor} shadow-sm`
                            : day === today
                                ? 'bg-gray-400 ring-1 ring-gray-500'
                                : 'bg-gray-200'
                        }`}
                />
            ))}
        </div>
    )
}

// 完整版月度格子（带数字）
function FullMonthGrid({ checkedDates, color }: { checkedDates: string[], color: 'pink' | 'amber' | 'indigo' }) {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfWeek = new Date(year, month, 1).getDay()

    const days: (number | null)[] = []
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)

    const isChecked = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        return checkedDates.includes(dateStr)
    }

    const today = now.getDate()
    const bgColor = color === 'pink' ? 'bg-pink-400' : color === 'amber' ? 'bg-amber-400' : 'bg-indigo-400'
    const lightBg = color === 'pink' ? 'bg-pink-100' : color === 'amber' ? 'bg-amber-100' : 'bg-indigo-100'

    return (
        <div>
            <div className="grid grid-cols-7 gap-1 mb-1">
                {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                    <div key={d} className="text-xs text-gray-400 text-center">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => (
                    <div
                        key={i}
                        className={`aspect-square rounded flex items-center justify-center text-xs ${day === null
                            ? ''
                            : isChecked(day)
                                ? `${bgColor} text-white font-medium`
                                : day === today
                                    ? `${lightBg} text-gray-700 ring-2 ring-${color}-300`
                                    : 'bg-gray-50 text-gray-400'
                            }`}
                    >
                        {day}
                    </div>
                ))}
            </div>
        </div>
    )
}
