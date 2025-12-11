'use client'

import AnimatedBackground from '@/components/AnimatedBackground'

export default function EatLoadingSkeleton() {
    return (
        <div className="min-h-screen bg-[var(--hf-bg-alt)]">
            <AnimatedBackground />

            {/* Header Skeleton */}
            <header className="sticky top-0 z-50 border-b border-[var(--hf-border)] bg-white safe-area-top">
                <div className="max-w-2xl mx-auto px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                        <div>
                            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                            <div className="h-3 w-24 bg-gray-100 rounded mt-1 animate-pulse hidden sm:block" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Skeleton */}
            <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* 转盘区域骨架 */}
                <div className="hf-card text-center py-8">
                    <div className="h-7 w-40 bg-gray-200 rounded mx-auto mb-6 animate-pulse" />

                    {/* 转盘骨架 - 圆形 */}
                    <div className="relative mx-auto" style={{ width: 280, height: 280 }}>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
                        <div className="absolute inset-1/4 rounded-full bg-white shadow-inner" />

                        {/* 装饰性食物 emoji 位置 */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-2xl opacity-30">🍔</div>
                        <div className="absolute top-1/4 right-4 text-2xl opacity-30">🍜</div>
                        <div className="absolute bottom-1/4 right-4 text-2xl opacity-30">🍕</div>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-2xl opacity-30">🍲</div>
                        <div className="absolute bottom-1/4 left-4 text-2xl opacity-30">🍣</div>
                        <div className="absolute top-1/4 left-4 text-2xl opacity-30">🥗</div>
                    </div>

                    {/* 按钮骨架 */}
                    <div className="mt-6 flex justify-center">
                        <div className="h-14 w-40 bg-[var(--hf-yellow)] rounded-full animate-pulse opacity-50" />
                    </div>

                    <div className="mt-4 h-4 w-32 bg-gray-100 rounded mx-auto animate-pulse" />
                </div>

                {/* 筛选区域骨架 */}
                <div className="hf-card">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
                        <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
                    </div>

                    {/* 数据源选择骨架 */}
                    <div className="mb-4">
                        <div className="h-4 w-16 bg-gray-100 rounded mb-2 animate-pulse" />
                        <div className="flex gap-2">
                            <div className="flex-1 h-10 bg-gray-100 rounded-lg animate-pulse" />
                            <div className="flex-1 h-10 bg-gray-100 rounded-lg animate-pulse" />
                            <div className="flex-1 h-10 bg-gray-100 rounded-lg animate-pulse" />
                        </div>
                    </div>

                    {/* 分类骨架 */}
                    <div className="mb-4">
                        <div className="h-4 w-12 bg-gray-100 rounded mb-2 animate-pulse" />
                        <div className="flex flex-wrap gap-2">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-8 w-16 bg-gray-100 rounded-full animate-pulse" />
                            ))}
                        </div>
                    </div>

                    {/* 标签骨架 */}
                    <div>
                        <div className="h-4 w-16 bg-gray-100 rounded mb-2 animate-pulse" />
                        <div className="flex flex-wrap gap-2">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-8 w-14 bg-gray-100 rounded-full animate-pulse" />
                            ))}
                        </div>
                    </div>
                </div>

                {/* 历史记录骨架 */}
                <div className="hf-card">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
                        <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                                <div className="flex-1">
                                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-3 w-16 bg-gray-100 rounded mt-1 animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* 加载中提示 */}
            <div className="fixed bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2 z-50">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg px-6 py-4 flex items-center gap-3">
                    <div className="relative">
                        <span className="text-3xl animate-bounce">🍽️</span>
                    </div>
                    <div>
                        <p className="font-medium text-[var(--hf-text)]">正在准备美食...</p>
                        <p className="text-xs text-[var(--hf-text-muted)]">加载中，请稍候</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
