'use client'

import { useState, ReactNode } from 'react'

interface SwipeablePanelProps {
    leftPanel: ReactNode   // 日记发布
    rightPanel: ReactNode  // 每日互动
}

export default function SwipeablePanel({ leftPanel, rightPanel }: SwipeablePanelProps) {
    const [activeIndex, setActiveIndex] = useState(0) // 0 = 日记, 1 = 互动

    return (
        <div className="relative">
            {/* 顶部标签切换 */}
            <div className="flex justify-center gap-3 mb-4">
                <button
                    onClick={() => setActiveIndex(0)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${activeIndex === 0
                        ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-lg shadow-amber-200'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                        }`}
                >
                    <span>📝</span>
                    <span>日记</span>
                </button>
                <button
                    onClick={() => setActiveIndex(1)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${activeIndex === 1
                        ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-lg shadow-pink-200'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                        }`}
                >
                    <span>💕</span>
                    <span>打卡</span>
                </button>
            </div>

            {/* 滑动容器 */}
            <div className="overflow-hidden rounded-xl">
                <div
                    className="flex transition-transform duration-300 ease-out"
                    style={{ transform: `translateX(-${activeIndex * 100}%)` }}
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
        </div>
    )
}
