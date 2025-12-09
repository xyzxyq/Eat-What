'use client'

import { useState, useEffect, useRef } from 'react'

interface GoodnightButtonProps {
    hasPartner: boolean
}

interface StatsData {
    streak: number
    total: number
    thisMonth: string[]
}

export default function GoodnightButton({ hasPartner }: GoodnightButtonProps) {
    const [currentUserSaid, setCurrentUserSaid] = useState(false)
    const [partnerSaid, setPartnerSaid] = useState(false)
    const [bothSaid, setBothSaid] = useState(false)
    const [isGoodnightTime, setIsGoodnightTime] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saying, setSaying] = useState(false)
    const [showStars, setShowStars] = useState(false)
    const [showStats, setShowStats] = useState(false)
    const [stats, setStats] = useState<StatsData | null>(null)
    const longPressTimer = useRef<NodeJS.Timeout | null>(null)
    const [isLongPress, setIsLongPress] = useState(false)

    useEffect(() => {
        fetchStatus()
        const interval = setInterval(checkTime, 60000)
        return () => clearInterval(interval)
    }, [])

    const checkTime = () => {
        const hour = new Date().getHours()
        setIsGoodnightTime(hour >= 20 || hour < 6)
    }

    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/goodnight')
            if (res.ok) {
                const data = await res.json()
                setCurrentUserSaid(data.currentUserSaid)
                setPartnerSaid(data.partnerSaid)
                setBothSaid(data.bothSaid)
                setIsGoodnightTime(data.isGoodnightTime)
                if (data.stats) {
                    setStats(data.stats)
                }
            }
        } catch (e) {
            console.error('Failed to fetch goodnight status:', e)
        } finally {
            setLoading(false)
        }
    }

    const handleGoodnight = async () => {
        if (isLongPress) {
            setIsLongPress(false)
            return
        }
        if (currentUserSaid || saying || !isGoodnightTime) return

        setSaying(true)
        try {
            const res = await fetch('/api/goodnight', { method: 'POST' })
            const data = await res.json()

            if (res.ok) {
                setCurrentUserSaid(true)
                if (data.bothSaid) {
                    setBothSaid(true)
                    setShowStars(true)
                    setTimeout(() => setShowStars(false), 2000)
                }
                if (data.stats) {
                    setStats(data.stats)
                }
            }
        } catch (e) {
            console.error('Goodnight failed:', e)
        } finally {
            setSaying(false)
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

    // 非晚安时段且没人说过，不显示
    if (!isGoodnightTime && !currentUserSaid && !partnerSaid) return null

    return (
        <div className="relative">
            {/* 星星特效 */}
            {showStars && (
                <div className="absolute -inset-4 pointer-events-none z-20">
                    {[...Array(10)].map((_, i) => (
                        <span
                            key={i}
                            className="absolute animate-ping"
                            style={{
                                left: `${30 + Math.random() * 40}%`,
                                top: `${20 + Math.random() * 60}%`,
                                animationDelay: `${Math.random() * 0.3}s`,
                                animationDuration: `${0.4 + Math.random() * 0.3}s`,
                                fontSize: `${14 + Math.random() * 8}px`
                            }}
                        >
                            {['⭐', '✨', '🌟', '💫'][Math.floor(Math.random() * 4)]}
                        </span>
                    ))}
                </div>
            )}

            {/* 主按钮 */}
            <button
                onClick={handleGoodnight}
                onMouseDown={handleLongPressStart}
                onMouseUp={handleLongPressEnd}
                onMouseLeave={handleLongPressEnd}
                onTouchStart={handleLongPressStart}
                onTouchEnd={handleLongPressEnd}
                disabled={loading || saying || !isGoodnightTime}
                className={`relative flex items-center gap-2 px-4 py-3 rounded-2xl transition-all transform ${bothSaid
                        ? 'bg-gradient-to-r from-indigo-100 to-purple-100 border-2 border-indigo-300'
                        : currentUserSaid
                            ? 'bg-indigo-50 border border-indigo-200'
                            : !isGoodnightTime
                                ? 'bg-gray-100 border border-gray-200 opacity-50 cursor-not-allowed'
                                : 'bg-white border border-indigo-200 hover:bg-indigo-50 hover:scale-105 active:scale-95'
                    }`}
                title={!isGoodnightTime ? '晚安时段 20:00-06:00' : currentUserSaid ? '今晚已说晚安' : '点击说晚安'}
            >
                <span className={`text-2xl ${saying ? 'animate-bounce' : ''}`}>
                    {bothSaid ? '💫' : currentUserSaid ? '🌙' : isGoodnightTime ? '😴' : '🌙'}
                </span>

                {/* 状态点 */}
                <div className="flex flex-col gap-0.5">
                    <div className={`w-2 h-2 rounded-full ${currentUserSaid ? 'bg-yellow-400' : 'bg-gray-300'}`} />
                    <div className={`w-2 h-2 rounded-full ${partnerSaid ? 'bg-yellow-400' : 'bg-gray-300'}`} />
                </div>
            </button>

            {/* 统计弹窗 */}
            {showStats && stats && (
                <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 bg-indigo-900 text-white rounded-xl shadow-lg border border-indigo-700 p-3 min-w-[160px]"
                    onClick={() => setShowStats(false)}
                >
                    <div className="text-center space-y-2">
                        <div className="text-yellow-300 font-bold">🌙 晚安统计</div>
                        <div className="flex justify-around text-sm">
                            <div>
                                <div className="text-lg font-bold text-yellow-300">{stats.streak}</div>
                                <div className="text-xs text-indigo-300">连续</div>
                            </div>
                            <div className="border-l border-indigo-700" />
                            <div>
                                <div className="text-lg font-bold text-yellow-300">{stats.total}</div>
                                <div className="text-xs text-indigo-300">总计</div>
                            </div>
                        </div>
                        {stats.thisMonth.length > 0 && (
                            <div className="pt-2 border-t border-indigo-700">
                                <div className="text-xs text-indigo-300 mb-1">本月记录</div>
                                <div className="flex flex-wrap gap-1 justify-center">
                                    {stats.thisMonth.slice(-7).map((date, i) => (
                                        <span key={i} className="text-xs bg-indigo-700 text-yellow-300 px-1.5 py-0.5 rounded">
                                            {new Date(date).getDate()}日
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="text-xs text-center text-indigo-400 mt-2">点击关闭</div>
                </div>
            )}
        </div>
    )
}
