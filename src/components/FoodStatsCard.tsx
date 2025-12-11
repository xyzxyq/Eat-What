'use client'

interface FoodStats {
    totalChoices: number
    categoryBreakdown: { category: string; count: number }[]
    topRated: { foodName: string; avgRating: number }[]
    recentChoices: { foodName: string; chosenDate: string }[]
}

interface FoodStatsCardProps {
    stats: FoodStats | null
}

const CATEGORY_EMOJIS: Record<string, string> = {
    chinese: '🥢',
    japanese: '🍣',
    korean: '🍚',
    western: '🍔',
    fastfood: '🍟',
    hotpot: '🍲',
    bbq: '🍖',
    snacks: '🥟',
    dessert: '🍰',
    seafood: '🦐',
    vegetarian: '🥗',
    southeast_asian: '🍜',
}

const CATEGORY_NAMES: Record<string, string> = {
    chinese: '中餐',
    japanese: '日料',
    korean: '韩餐',
    western: '西餐',
    fastfood: '快餐',
    hotpot: '火锅',
    bbq: '烧烤',
    snacks: '小吃',
    dessert: '甜品',
    seafood: '海鲜',
    vegetarian: '素食',
    southeast_asian: '东南亚',
}

export default function FoodStatsCard({ stats }: FoodStatsCardProps) {
    if (!stats || stats.totalChoices === 0) {
        return (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
                <span className="text-4xl">📊</span>
                <p className="mt-2 text-[var(--hf-text-muted)]">
                    还没有美食记录，快去转个盘吧！
                </p>
            </div>
        )
    }

    // 计算最常吃的分类
    const topCategory = stats.categoryBreakdown[0]
    const maxCount = topCategory?.count || 0

    return (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-bold text-[var(--hf-text)] mb-4 flex items-center gap-2">
                <span>📊</span> 美食统计
            </h3>

            {/* 总计 */}
            <div className="mb-4 p-3 bg-gradient-to-r from-[var(--hf-yellow-light)] to-orange-50 rounded-xl">
                <p className="text-sm text-[var(--hf-text-muted)]">共同的美食回忆</p>
                <p className="text-3xl font-bold text-[var(--hf-text)]">
                    {stats.totalChoices} <span className="text-lg font-normal">次</span>
                </p>
            </div>

            {/* 分类统计 */}
            <div className="mb-4">
                <p className="text-sm text-[var(--hf-text-muted)] mb-2">口味偏好</p>
                <div className="space-y-2">
                    {stats.categoryBreakdown.slice(0, 5).map((cat) => (
                        <div key={cat.category} className="flex items-center gap-2">
                            <span className="w-8 text-center">
                                {CATEGORY_EMOJIS[cat.category] || '🍽️'}
                            </span>
                            <span className="text-sm text-[var(--hf-text)] w-16">
                                {CATEGORY_NAMES[cat.category] || cat.category}
                            </span>
                            <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[var(--hf-yellow)] to-orange-400 rounded-full transition-all"
                                    style={{ width: `${(cat.count / maxCount) * 100}%` }}
                                />
                            </div>
                            <span className="text-sm text-[var(--hf-text-muted)] w-8 text-right">
                                {cat.count}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top 评分 */}
            {stats.topRated.length > 0 && (
                <div>
                    <p className="text-sm text-[var(--hf-text-muted)] mb-2">最爱TOP3</p>
                    <div className="flex gap-2">
                        {stats.topRated.slice(0, 3).map((food, index) => (
                            <div
                                key={food.foodName}
                                className={`flex-1 p-2 rounded-lg text-center ${index === 0
                                        ? 'bg-yellow-50 border border-yellow-200'
                                        : 'bg-gray-50'
                                    }`}
                            >
                                <span className="text-lg">{['🥇', '🥈', '🥉'][index]}</span>
                                <p className="text-xs font-medium text-[var(--hf-text)] truncate mt-1">
                                    {food.foodName}
                                </p>
                                <p className="text-xs text-[var(--hf-text-muted)]">
                                    {food.avgRating.toFixed(1)}★
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
