'use client'

import { useState, useEffect, useRef } from 'react'

interface DailyKissButtonProps {
    hasPartner: boolean
}

interface StatsData {
    streak: number
    total: number
    thisMonth: string[]  // 本月打卡日期列表
}

export default function DailyKissButton({ hasPartner }: DailyKissButtonProps) {
    const [currentUserKissed, setCurrentUserKissed] = useState(false)
    const [partnerKissed, setPartnerKissed] = useState(false)
    const [bothKissed, setBothKissed] = useState(false)
    const [loading, setLoading] = useState(true)
    const [kissing, setKissing] = useState(false)
    const [showHearts, setShowHearts] = useState(false)
    const [showStats, setShowStats] = useState(false)
    const [stats, setStats] = useState<StatsData | null>(null)
    const longPressTimer = useRef<NodeJS.Timeout | null>(null)
    const [isLongPress, setIsLongPress] = useState(false)

    useEffect(() => {
        fetchStatus()
    }, [])

    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/daily-kiss')
            if (res.ok) {
                const data = await res.json()
                setCurrentUserKissed(data.currentUserKissed)
                setPartnerKissed(data.partnerKissed)
                setBothKissed(data.bothKissed)
                if (data.stats) {
                    setStats(data.stats)
                }
            }
        } catch (e) {
            console.error('Failed to fetch kiss status:', e)
        } finally {
            setLoading(false)
        }
    }

    const handleKiss = async () => {
        if (isLongPress) {
            setIsLongPress(false)
            return
        }
        if (currentUserKissed || kissing) return

        setKissing(true)
        try {
            const res = await fetch('/api/daily-kiss', { method: 'POST' })
            const data = await res.json()

            if (res.ok) {
                setCurrentUserKissed(true)
                if (data.bothKissed) {
                    setBothKissed(true)
                    setShowHearts(true)
                    setTimeout(() => setShowHearts(false), 2000)
                }
                if (data.stats) {
                    setStats(data.stats)
                }
            }
        } catch (e) {
            console.error('Kiss failed:', e)
        } finally {
            setKissing(false)
        }
    }

    const handleLongPressStart = () => {
        longPressTimer.current = setTimeout(() => {
            setIsLongPress(true)
            setShowStats(true)
        }, 800)
    }

    const handleLongPressEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current)
            longPressTimer.current = null
        }
    }

    if (!hasPartner) return null

    return (
        <div className="relative">
            {/* 爱心爆炸特效 */}
            {showHearts && (
                <div className="absolute -inset-4 pointer-events-none z-20">
                    {[...Array(12)].map((_, i) => (
                        <span
                            key={i}
                            className="absolute text-lg animate-ping"
                            style={{
                                left: `${30 + Math.random() * 40}%`,
                                top: `${20 + Math.random() * 60}%`,
                                animationDelay: `${Math.random() * 0.3}s`,
                                animationDuration: `${0.4 + Math.random() * 0.3}s`
                            }}
                        >
                            {['💕', '💗', '💖', '❤️'][Math.floor(Math.random() * 4)]}
                        </span>
                    ))}
                </div>
            )}

            {/* 主按钮 */}
            <button
                onClick={handleKiss}
                onMouseDown={handleLongPressStart}
                onMouseUp={handleLongPressEnd}
                onMouseLeave={handleLongPressEnd}
                onTouchStart={handleLongPressStart}
                onTouchEnd={handleLongPressEnd}
                disabled={loading || kissing}
                className={`relative flex items-center gap-2 px-4 py-3 rounded-2xl transition-all transform ${bothKissed
                        ? 'bg-gradient-to-r from-pink-100 to-red-100 border-2 border-pink-300'
                        : currentUserKissed
                            ? 'bg-pink-50 border border-pink-200'
                            : 'bg-white border border-pink-200 hover:bg-pink-50 hover:scale-105 active:scale-95'
                    }`}
                title={currentUserKissed ? '今日已亲亲' : '点击亲亲'}
            >
                <span className={`text-2xl ${kissing ? 'animate-bounce' : ''}`}>
                    {bothKissed ? '💕' : currentUserKissed ? '💋' : '😘'}
                </span>

                {/* 状态点 */}
                <div className="flex flex-col gap-0.5">
                    <div className={`w-2 h-2 rounded-full ${currentUserKissed ? 'bg-pink-500' : 'bg-gray-300'}`} />
                    <div className={`w-2 h-2 rounded-full ${partnerKissed ? 'bg-pink-500' : 'bg-gray-300'}`} />
                </div>
            </button>

            {/* 统计弹窗 */}
            {showStats && stats && (
                <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 bg-white rounded-xl shadow-lg border border-pink-200 p-3 min-w-[160px]"
                    onClick={() => setShowStats(false)}
                >
                    <div className="text-center space-y-2">
                        <div className="text-pink-500 font-bold">💋 亲亲统计</div>
                        <div className="flex justify-around text-sm">
                            <div>
                                <div className="text-lg font-bold text-pink-600">{stats.streak}</div>
                                <div className="text-xs text-gray-500">连续</div>
                            </div>
                            <div className="border-l border-pink-100" />
                            <div>
                                <div className="text-lg font-bold text-pink-600">{stats.total}</div>
                                <div className="text-xs text-gray-500">总计</div>
                            </div>
                        </div>
                        {stats.thisMonth.length > 0 && (
                            <div className="pt-2 border-t border-pink-100">
                                <div className="text-xs text-gray-500 mb-1">本月记录</div>
                                <div className="flex flex-wrap gap-1 justify-center">
                                    {stats.thisMonth.slice(-7).map((date, i) => (
                                        <span key={i} className="text-xs bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded">
                                            {new Date(date).getDate()}日
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="text-xs text-center text-gray-400 mt-2">点击关闭</div>
                </div>
            )}
        </div>
    )
}
