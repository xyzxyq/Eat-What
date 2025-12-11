'use client'

import { useState, useRef, ReactNode } from 'react'

interface SwipeablePanelProps {
    leftPanel: ReactNode   // 日记发布
    rightPanel: ReactNode  // 每日互动
}

export default function SwipeablePanel({ leftPanel, rightPanel }: SwipeablePanelProps) {
    const [activeIndex, setActiveIndex] = useState(0) // 0 = 日记, 1 = 互动
    const [translateX, setTranslateX] = useState(0)
    const [isSwiping, setIsSwiping] = useState(false) // 是否正在滑动（区分点击和滑动）

    const touchStartX = useRef(0)
    const touchCurrentX = useRef(0)
    const touchStartTime = useRef(0)
    const containerRef = useRef<HTMLDivElement>(null)

    const SWIPE_THRESHOLD = 50 // 滑动阈值
    const SWIPE_START_THRESHOLD = 10 // 开始识别为滑动的最小距离

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX
        touchCurrentX.current = e.touches[0].clientX
        touchStartTime.current = Date.now()
        // 不立即设置 isSwiping，等 move 时判断
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        touchCurrentX.current = e.touches[0].clientX
        const diff = touchCurrentX.current - touchStartX.current

        // 只有移动超过阈值才开始处理滑动（区分点击和滑动）
        if (!isSwiping && Math.abs(diff) < SWIPE_START_THRESHOLD) {
            return
        }

        // 开始滑动
        if (!isSwiping) {
            setIsSwiping(true)
        }

        // 限制滑动范围
        if (activeIndex === 0 && diff > 0) {
            // 已经在最左边，向右滑动受限
            setTranslateX(diff * 0.2)
        } else if (activeIndex === 1 && diff < 0) {
            // 已经在最右边，向左滑动受限
            setTranslateX(diff * 0.2)
        } else {
            setTranslateX(diff)
        }
    }

    const handleTouchEnd = () => {
        const diff = touchCurrentX.current - touchStartX.current

        // 只有在真正滑动时才处理面板切换
        if (isSwiping && Math.abs(diff) > SWIPE_THRESHOLD) {
            if (diff > 0 && activeIndex === 1) {
                // 向右滑动，切换到左边面板
                setActiveIndex(0)
            } else if (diff < 0 && activeIndex === 0) {
                // 向左滑动，切换到右边面板
                setActiveIndex(1)
            }
        }

        setIsSwiping(false)
        setTranslateX(0)
    }

    return (
        <div className="relative">
            {/* 顶部标签切换 */}
            <div className="flex justify-center gap-2 sm:gap-3 mb-4">
                <button
                    onClick={() => setActiveIndex(0)}
                    className={`px-4 sm:px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 touch-feedback ${activeIndex === 0
                        ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-lg shadow-amber-200'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                        }`}
                >
                    <span>📝</span>
                    <span>日记</span>
                </button>
                <button
                    onClick={() => setActiveIndex(1)}
                    className={`px-4 sm:px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 touch-feedback ${activeIndex === 1
                        ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-lg shadow-pink-200'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                        }`}
                >
                    <span>💕</span>
                    <span>打卡</span>
                </button>
            </div>

            {/* 滑动指示器 */}
            <div className="flex justify-center gap-1.5 mb-3">
                <div className={`w-2 h-2 rounded-full transition-all ${activeIndex === 0 ? 'bg-amber-400 w-4' : 'bg-gray-300'}`} />
                <div className={`w-2 h-2 rounded-full transition-all ${activeIndex === 1 ? 'bg-pink-400 w-4' : 'bg-gray-300'}`} />
            </div>

            {/* 滑动容器 */}
            <div
                ref={containerRef}
                className="overflow-hidden rounded-xl"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div
                    className={`flex ${isSwiping ? '' : 'transition-transform duration-300 ease-out'}`}
                    style={{
                        transform: `translateX(calc(-${activeIndex * 100}% + ${translateX}px))`
                    }}
                >
                    {/* 左面板：日记发布 */}
                    <div className="w-full flex-shrink-0">
                        {leftPanel}
                    </div>
                    {/* 右面板：每日互动 */}
                    <div className="w-full flex-shrink-0">
                        {rightPanel}
                    </div>
                </div>
            </div>

            {/* 移动端滑动提示 */}
            <p className="text-center text-[10px] text-gray-400 mt-2 sm:hidden">
                👆 左右滑动切换
            </p>
        </div>
    )
}

