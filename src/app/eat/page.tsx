'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AnimatedBackground from '@/components/AnimatedBackground'
import FoodWheel from '@/components/FoodWheel'
import AddFoodModal from '@/components/AddFoodModal'
import QuickImportModal from '@/components/QuickImportModal'
import FoodVotePanel from '@/components/FoodVotePanel'
import EatLoadingSkeleton from '@/components/EatLoadingSkeleton'
import FoodLibraryManager from '@/components/FoodLibraryManager'
import { FOOD_CATEGORIES, PRESET_FOODS, FOOD_TAGS, getTagsByGroup, type PresetFood } from '@/lib/food-categories'

interface FoodOption {
    id: string
    name: string
    emoji: string
    category: string
    subCategory?: string
    tags: string[]
    isPreset: boolean
    isActive: boolean
}

interface FoodChoice {
    id: string
    foodName: string
    foodEmoji: string
    category: string
    mode: string
    userARating?: number
    userBRating?: number
    note?: string
    chosenDate: string
}

export default function EatWhatPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [options, setOptions] = useState<FoodOption[]>([])
    const [history, setHistory] = useState<FoodChoice[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [showAddModal, setShowAddModal] = useState(false)
    const [showQuickImport, setShowQuickImport] = useState(false)
    const [showVotePanel, setShowVotePanel] = useState(false)
    const [customFoods, setCustomFoods] = useState<(PresetFood & { id?: string })[]>([])
    const [isSpinning, setIsSpinning] = useState(false)
    const [spinResult, setSpinResult] = useState<PresetFood | null>(null)
    const [showResult, setShowResult] = useState(false)
    const [currentTheme, setCurrentTheme] = useState('yellow')
    const [activeTab, setActiveTab] = useState<'spin' | 'manage'>('spin')
    const [dataSource, setDataSource] = useState<'preset' | 'custom' | 'all'>('preset')
    const [showLibraryManager, setShowLibraryManager] = useState(false)
    const [selectedLibraryId, setSelectedLibraryId] = useState<string | null>(null)
    const [editingHistory, setEditingHistory] = useState<FoodChoice | null>(null)
    const [editRating, setEditRating] = useState(0)
    const [editNote, setEditNote] = useState('')

    // 获取食物选项
    const fetchOptions = useCallback(async () => {
        try {
            const res = await fetch('/api/food/options')
            if (res.status === 401) {
                router.push('/')
                return
            }
            if (res.ok) {
                const data = await res.json()
                setOptions(data.options || [])
                // 同步到 customFoods
                const customList = (data.options || []).map((opt: FoodOption) => ({
                    name: opt.name,
                    emoji: opt.emoji,
                    category: opt.category,
                    subCategory: opt.subCategory,
                    tags: opt.tags,
                    id: opt.id,
                }))
                setCustomFoods(customList)
            }
        } catch (error) {
            console.error('Failed to fetch food options:', error)
        }
    }, [router])

    // 获取历史记录
    const fetchHistory = useCallback(async () => {
        try {
            const res = await fetch('/api/food/history?limit=10')
            if (res.ok) {
                const data = await res.json()
                setHistory(data.choices || [])
            }
        } catch (error) {
            console.error('Failed to fetch history:', error)
        }
    }, [])

    // 获取主题
    const fetchTheme = useCallback(async () => {
        try {
            const res = await fetch('/api/space')
            if (res.ok) {
                const data = await res.json()
                const theme = data.theme || 'yellow'
                setCurrentTheme(theme)
                document.documentElement.setAttribute('data-theme', theme === 'yellow' ? '' : theme)
            }
        } catch (error) {
            console.error('Failed to fetch theme:', error)
        }
    }, [])

    useEffect(() => {
        Promise.all([fetchOptions(), fetchHistory(), fetchTheme()]).finally(() => {
            setLoading(false)
        })
    }, [fetchOptions, fetchHistory, fetchTheme])

    // 过滤可用的食物选项
    const getAvailableFoods = (): PresetFood[] => {
        let foods: PresetFood[] = []

        // 根据数据源选择
        if (dataSource === 'preset') {
            foods = [...PRESET_FOODS]
        } else if (dataSource === 'custom') {
            foods = customFoods.map(f => ({ ...f, tags: f.tags || [] }))
        } else {
            // all: 合并预设和自定义
            foods = [
                ...PRESET_FOODS,
                ...customFoods.map(f => ({ ...f, tags: f.tags || [] }))
            ]
        }

        // 按分类过滤
        if (selectedCategory) {
            foods = foods.filter(f => f.category === selectedCategory)
        }

        // 按标签过滤
        if (selectedTags.length > 0) {
            foods = foods.filter(f => selectedTags.some(tag => f.tags.includes(tag)))
        }

        return foods
    }

    // 开始转盘
    const handleSpin = async () => {
        const availableFoods = getAvailableFoods()
        if (availableFoods.length === 0) {
            alert('没有可选的食物，请调整筛选条件')
            return
        }

        setIsSpinning(true)
        setShowResult(false)

        // 随机选择
        const randomIndex = Math.floor(Math.random() * availableFoods.length)
        const selected = availableFoods[randomIndex]

        // 模拟转盘动画时间 - 不再自动保存，等待用户确认
        setTimeout(() => {
            setSpinResult(selected)
            setIsSpinning(false)
            setShowResult(true)
        }, 3000)
    }

    // 用户确认选择 - 只有点击"就这个！"时才保存到历史
    const handleConfirmChoice = async () => {
        if (!spinResult) return

        try {
            await fetch('/api/food/spin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    foodName: spinResult.name,
                    foodEmoji: spinResult.emoji,
                    category: spinResult.category,
                }),
            })
            fetchHistory()
            // 显示确认成功
            setShowResult(false)
            setSpinResult(null)
        } catch (error) {
            console.error('Failed to save choice:', error)
        }
    }

    // 重新选择 - 不保存当前结果
    const handleRespin = () => {
        setShowResult(false)
        setSpinResult(null)
    }

    // 添加自定义食物
    const handleAddCustomFood = async (food: Omit<PresetFood, 'isPreset'>) => {
        try {
            const res = await fetch('/api/food/options', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(food),
            })
            if (res.ok) {
                const data = await res.json()
                setCustomFoods(prev => [...prev, { ...food, id: data.option.id, isPreset: false }])
            }
        } catch (error) {
            console.error('Failed to add custom food:', error)
        }
    }

    // 快速导入
    const handleQuickImport = async (foods: PresetFood[]) => {
        for (const food of foods) {
            await handleAddCustomFood(food)
        }
    }

    // 删除自定义食物
    const handleDeleteCustomFood = async (id: string) => {
        try {
            const res = await fetch(`/api/food/options?id=${id}`, {
                method: 'DELETE',
            })
            if (res.ok) {
                setCustomFoods(prev => prev.filter(f => f.id !== id))
            }
        } catch (error) {
            console.error('Failed to delete food:', error)
        }
    }

    // 删除历史记录
    const handleDeleteHistory = async (id: string) => {
        try {
            const res = await fetch(`/api/food/history?id=${id}`, {
                method: 'DELETE',
            })
            if (res.ok) {
                setHistory(prev => prev.filter(h => h.id !== id))
            }
        } catch (error) {
            console.error('Failed to delete history:', error)
        }
    }

    // 更新历史记录评分和备注
    const handleUpdateHistory = async () => {
        if (!editingHistory) return
        try {
            const res = await fetch('/api/food/rating', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    choiceId: editingHistory.id,
                    rating: editRating,
                    note: editNote,
                }),
            })
            if (res.ok) {
                const data = await res.json()
                setHistory(prev => prev.map(h =>
                    h.id === editingHistory.id
                        ? { ...h, userARating: data.choice.userARating, userBRating: data.choice.userBRating, note: data.choice.note }
                        : h
                ))
                setEditingHistory(null)
            }
        } catch (error) {
            console.error('Failed to update history:', error)
        }
    }

    if (loading) {
        return <EatLoadingSkeleton />
    }

    const availableFoods = getAvailableFoods()
    const tasteTags = getTagsByGroup('taste')
    const priceTags = getTagsByGroup('price')
    const sceneTags = getTagsByGroup('scene')

    return (
        <div className="min-h-screen bg-[var(--hf-bg-alt)]">
            <AnimatedBackground />

            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-[var(--hf-border)] bg-white safe-area-top">
                <div className="max-w-2xl mx-auto px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={() => router.push('/timeline')}
                            className="p-2 rounded-full hover:bg-gray-100 transition touch-feedback"
                        >
                            <span className="text-lg">←</span>
                        </button>
                        <div>
                            <h1 className="font-bold text-[var(--hf-text)] logo-font text-sm sm:text-base flex items-center gap-2">
                                <span className="text-xl">🍽️</span> 今天吃什么
                            </h1>
                            <p className="text-xs text-[var(--hf-text-muted)] hidden sm:block">
                                让命运决定今天的美食！
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* 转盘区域 */}
                <div className="hf-card text-center py-8">
                    <h2 className="text-xl font-bold text-[var(--hf-text)] mb-6">
                        {showResult ? '🎉 今天就吃...' : '🎲 转动转盘'}
                    </h2>

                    <FoodWheel
                        foods={availableFoods}
                        isSpinning={isSpinning}
                        result={spinResult}
                        showResult={showResult}
                    />

                    <div className="mt-6 flex justify-center gap-3">
                        {showResult ? (
                            <>
                                <button
                                    onClick={handleRespin}
                                    className="px-6 py-3 rounded-full bg-gray-100 text-[var(--hf-text)] font-medium hover:bg-gray-200 transition touch-feedback"
                                >
                                    🔄 换一个
                                </button>
                                <button
                                    onClick={handleConfirmChoice}
                                    className="hf-button"
                                >
                                    ✅ 就这个！记一下
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleSpin}
                                disabled={isSpinning || availableFoods.length === 0}
                                className="hf-button text-lg px-8 py-4"
                            >
                                {isSpinning ? (
                                    <>
                                        <span className="spinner" style={{ width: 20, height: 20 }}></span>
                                        转动中...
                                    </>
                                ) : (
                                    <>🎲 开始随机</>
                                )}
                            </button>
                        )}
                    </div>

                    <p className="mt-4 text-sm text-[var(--hf-text-muted)]">
                        当前可选: {availableFoods.length} 种美食
                    </p>
                </div>

                {/* 分类筛选 */}
                <div className="hf-card">
                    <h3 className="font-semibold text-[var(--hf-text)] mb-4 flex items-center gap-2">
                        <span>🏷️</span> 筛选范围
                    </h3>

                    {/* 数据源选择 */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-[var(--hf-text-muted)]">美食库</p>
                            <button
                                onClick={() => setShowLibraryManager(true)}
                                className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
                            >
                                📚 管理库
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setDataSource('preset')
                                    setSelectedLibraryId(null)
                                }}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition touch-feedback ${dataSource === 'preset'
                                    ? 'bg-[var(--hf-yellow)] text-[var(--hf-text)]'
                                    : 'bg-gray-100 text-[var(--hf-text-muted)] hover:bg-gray-200'
                                    }`}
                            >
                                📦 预设库 ({PRESET_FOODS.length})
                            </button>
                            <button
                                onClick={() => {
                                    setDataSource('custom')
                                    setSelectedLibraryId(null)
                                }}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition touch-feedback ${dataSource === 'custom'
                                    ? 'bg-[var(--hf-yellow)] text-[var(--hf-text)]'
                                    : 'bg-gray-100 text-[var(--hf-text-muted)] hover:bg-gray-200'
                                    }`}
                            >
                                ✨ 自定义 ({customFoods.length})
                            </button>
                            <button
                                onClick={() => {
                                    setDataSource('all')
                                    setSelectedLibraryId(null)
                                }}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition touch-feedback ${dataSource === 'all'
                                    ? 'bg-[var(--hf-yellow)] text-[var(--hf-text)]'
                                    : 'bg-gray-100 text-[var(--hf-text-muted)] hover:bg-gray-200'
                                    }`}
                            >
                                🌟 全部
                            </button>
                        </div>
                        {dataSource === 'custom' && customFoods.length === 0 && (
                            <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                                <p className="text-sm text-orange-700 mb-2">
                                    💡 自定义库为空
                                </p>
                                <p className="text-xs text-orange-600 mb-2">
                                    先创建一个美食库，然后在库里添加你喜欢的食物：
                                </p>
                                <button
                                    onClick={() => setShowLibraryManager(true)}
                                    className="w-full py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg text-sm font-medium transition"
                                >
                                    📚 创建美食库
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 分类 */}
                    <div className="mb-4">
                        <p className="text-sm text-[var(--hf-text-muted)] mb-2">分类</p>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition touch-feedback ${selectedCategory === null
                                    ? 'bg-[var(--hf-yellow)] text-[var(--hf-text)]'
                                    : 'bg-gray-100 text-[var(--hf-text-muted)] hover:bg-gray-200'
                                    }`}
                            >
                                全部
                            </button>
                            {FOOD_CATEGORIES.slice(0, 8).map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition touch-feedback ${selectedCategory === cat.id
                                        ? 'bg-[var(--hf-yellow)] text-[var(--hf-text)]'
                                        : 'bg-gray-100 text-[var(--hf-text-muted)] hover:bg-gray-200'
                                        }`}
                                >
                                    {cat.emoji} {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 口味标签 */}
                    <div className="mb-4">
                        <p className="text-sm text-[var(--hf-text-muted)] mb-2">口味偏好</p>
                        <div className="flex flex-wrap gap-2">
                            {tasteTags.map(tag => (
                                <button
                                    key={tag.id}
                                    onClick={() => {
                                        setSelectedTags(prev =>
                                            prev.includes(tag.id)
                                                ? prev.filter(t => t !== tag.id)
                                                : [...prev, tag.id]
                                        )
                                    }}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition touch-feedback ${selectedTags.includes(tag.id)
                                        ? 'bg-[var(--hf-yellow)] text-[var(--hf-text)]'
                                        : 'bg-gray-100 text-[var(--hf-text-muted)] hover:bg-gray-200'
                                        }`}
                                >
                                    {tag.emoji} {tag.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 价格标签 */}
                    <div className="mb-4">
                        <p className="text-sm text-[var(--hf-text-muted)] mb-2">价格</p>
                        <div className="flex flex-wrap gap-2">
                            {priceTags.map(tag => (
                                <button
                                    key={tag.id}
                                    onClick={() => {
                                        setSelectedTags(prev =>
                                            prev.includes(tag.id)
                                                ? prev.filter(t => t !== tag.id)
                                                : [...prev, tag.id]
                                        )
                                    }}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition touch-feedback ${selectedTags.includes(tag.id)
                                        ? 'bg-[var(--hf-yellow)] text-[var(--hf-text)]'
                                        : 'bg-gray-100 text-[var(--hf-text-muted)] hover:bg-gray-200'
                                        }`}
                                >
                                    {tag.emoji} {tag.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 场景标签 */}
                    <div>
                        <p className="text-sm text-[var(--hf-text-muted)] mb-2">场景</p>
                        <div className="flex flex-wrap gap-2">
                            {sceneTags.map(tag => (
                                <button
                                    key={tag.id}
                                    onClick={() => {
                                        setSelectedTags(prev =>
                                            prev.includes(tag.id)
                                                ? prev.filter(t => t !== tag.id)
                                                : [...prev, tag.id]
                                        )
                                    }}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition touch-feedback ${selectedTags.includes(tag.id)
                                        ? 'bg-[var(--hf-yellow)] text-[var(--hf-text)]'
                                        : 'bg-gray-100 text-[var(--hf-text-muted)] hover:bg-gray-200'
                                        }`}
                                >
                                    {tag.emoji} {tag.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 清除筛选 */}
                    {(selectedCategory || selectedTags.length > 0) && (
                        <button
                            onClick={() => {
                                setSelectedCategory(null)
                                setSelectedTags([])
                            }}
                            className="mt-4 text-sm text-[var(--hf-text-muted)] hover:text-[var(--hf-text)] transition"
                        >
                            ✕ 清除筛选条件
                        </button>
                    )}
                </div>

                {/* 最近选择 */}
                {history.length > 0 && (
                    <div className="hf-card">
                        <h3 className="font-semibold text-[var(--hf-text)] mb-4 flex items-center gap-2">
                            <span>📜</span> 最近吃过
                        </h3>
                        <div className="space-y-3">
                            {history.slice(0, 5).map(choice => (
                                <div
                                    key={choice.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <span className="text-2xl">{choice.foodEmoji}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-[var(--hf-text)]">{choice.foodName}</p>
                                            <p className="text-xs text-[var(--hf-text-muted)]">
                                                {new Date(choice.chosenDate).toLocaleDateString('zh-CN', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    weekday: 'short',
                                                })}
                                                {choice.note && (
                                                    <span className="ml-2 text-gray-400">· {choice.note}</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {(choice.userARating || choice.userBRating) && (
                                            <div className="text-sm text-[var(--hf-yellow)] mr-1">
                                                {'⭐'.repeat(Math.max(choice.userARating || 0, choice.userBRating || 0))}
                                            </div>
                                        )}
                                        <button
                                            onClick={() => {
                                                setEditingHistory(choice)
                                                setEditRating(choice.userARating || choice.userBRating || 0)
                                                setEditNote(choice.note || '')
                                            }}
                                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition opacity-0 group-hover:opacity-100"
                                            title="编辑"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDeleteHistory(choice.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition opacity-0 group-hover:opacity-100"
                                            title="删除记录"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-[var(--hf-border)] bg-white py-4 mt-8">
                <div className="max-w-2xl mx-auto px-4 text-center">
                    <p className="text-xs text-[var(--hf-text-muted)] mono">
                        💕 让美食成为我们的回忆
                    </p>
                </div>
            </footer>

            {/* 自定义管理按钮 */}
            <div className="fixed bottom-20 right-4 flex flex-col gap-2 z-40">
                <button
                    onClick={() => setShowQuickImport(true)}
                    className="w-12 h-12 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition flex items-center justify-center"
                    title="快速导入"
                >
                    ⚡
                </button>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="w-12 h-12 rounded-full bg-[var(--hf-yellow)] text-[var(--hf-text)] shadow-lg hover:opacity-90 transition flex items-center justify-center text-2xl"
                    title="添加自定义食物"
                >
                    +
                </button>
            </div>

            {/* Modals */}
            <AddFoodModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={handleAddCustomFood}
            />

            <QuickImportModal
                isOpen={showQuickImport}
                onClose={() => setShowQuickImport(false)}
                onImport={handleQuickImport}
            />

            <FoodVotePanel
                isOpen={showVotePanel}
                onClose={() => setShowVotePanel(false)}
                onResult={(food) => {
                    if (food) {
                        setSpinResult(food)
                        setShowResult(true)
                    }
                }}
            />

            <FoodLibraryManager
                isOpen={showLibraryManager}
                onClose={() => setShowLibraryManager(false)}
                onLibrarySelect={(libraryId) => {
                    if (libraryId) {
                        setSelectedLibraryId(libraryId)
                        setDataSource('custom')
                    }
                }}
                onFoodsUpdated={fetchOptions}
            />

            {/* 编辑历史记录弹窗 */}
            {editingHistory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
                        <h3 className="text-lg font-bold text-[var(--hf-text)] mb-4 flex items-center gap-2">
                            <span>{editingHistory.foodEmoji}</span>
                            <span>{editingHistory.foodName}</span>
                        </h3>

                        {/* 评分 */}
                        <div className="mb-4">
                            <p className="text-sm text-[var(--hf-text-muted)] mb-2">评分</p>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setEditRating(star)}
                                        className={`w-10 h-10 text-xl rounded-lg transition ${editRating >= star
                                            ? 'bg-[var(--hf-yellow)]'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                            }`}
                                    >
                                        ⭐
                                    </button>
                                ))}
                                {editRating > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setEditRating(0)}
                                        className="w-10 h-10 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500"
                                    >
                                        清除
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* 备注 */}
                        <div className="mb-4">
                            <p className="text-sm text-[var(--hf-text-muted)] mb-2">备注</p>
                            <input
                                type="text"
                                value={editNote}
                                onChange={(e) => setEditNote(e.target.value)}
                                placeholder="例如：味道不错、下次再来"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--hf-yellow)]"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setEditingHistory(null)}
                                className="flex-1 py-3 border border-gray-200 rounded-xl text-[var(--hf-text-muted)] hover:bg-gray-50"
                            >
                                取消
                            </button>
                            <button
                                type="button"
                                onClick={handleUpdateHistory}
                                className="flex-1 py-3 bg-[var(--hf-yellow)] rounded-xl font-medium text-[var(--hf-text)] hover:opacity-90 transition"
                            >
                                保存
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 双人投票入口 */}
            <button
                onClick={() => setShowVotePanel(true)}
                className="fixed bottom-20 left-4 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full shadow-lg hover:opacity-90 transition flex items-center gap-2 z-40"
            >
                <span>💕</span>
                <span className="text-sm font-medium">双人投票</span>
            </button>
        </div>
    )
}

