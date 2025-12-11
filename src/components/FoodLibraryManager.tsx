'use client'

import { useState, useEffect, useCallback } from 'react'
import { FOOD_CATEGORIES, type PresetFood } from '@/lib/food-categories'

interface FoodLibrary {
    id: string
    name: string
    emoji: string
    description?: string
    isDefault: boolean
    _count: {
        foodOptions: number
    }
}

interface FoodOption {
    id: string
    name: string
    emoji: string
    category: string
    tags: string[]
    libraryId: string
}

interface FoodLibraryManagerProps {
    isOpen: boolean
    onClose: () => void
    onLibrarySelect?: (libraryId: string | null) => void
    onFoodsUpdated?: () => void
}

const LIBRARY_EMOJIS = ['📂', '⭐', '❤️', '🔥', '🌙', '☀️', '🌸', '🎉', '💕', '🍕', '🍜', '🥗']

export default function FoodLibraryManager({
    isOpen,
    onClose,
    onLibrarySelect,
    onFoodsUpdated
}: FoodLibraryManagerProps) {
    const [libraries, setLibraries] = useState<FoodLibrary[]>([])
    const [selectedLibrary, setSelectedLibrary] = useState<FoodLibrary | null>(null)
    const [libraryFoods, setLibraryFoods] = useState<FoodOption[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [showEditForm, setShowEditForm] = useState(false)
    const [newLibraryName, setNewLibraryName] = useState('')
    const [newLibraryEmoji, setNewLibraryEmoji] = useState('📂')
    const [newLibraryDesc, setNewLibraryDesc] = useState('')
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
    const [deleteMode, setDeleteMode] = useState<'move' | 'delete'>('move')

    const fetchLibraries = useCallback(async () => {
        try {
            const res = await fetch('/api/food/library')
            if (res.ok) {
                const data = await res.json()
                setLibraries(data.libraries || [])
            }
        } catch (error) {
            console.error('Failed to fetch libraries:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchLibraryFoods = useCallback(async (libraryId: string) => {
        try {
            const res = await fetch(`/api/food/options?libraryId=${libraryId}`)
            if (res.ok) {
                const data = await res.json()
                setLibraryFoods(data.options || [])
            }
        } catch (error) {
            console.error('Failed to fetch library foods:', error)
        }
    }, [])

    useEffect(() => {
        if (isOpen) {
            fetchLibraries()
        }
    }, [isOpen, fetchLibraries])

    useEffect(() => {
        if (selectedLibrary) {
            fetchLibraryFoods(selectedLibrary.id)
        } else {
            setLibraryFoods([])
        }
    }, [selectedLibrary, fetchLibraryFoods])

    const handleCreateLibrary = async () => {
        if (!newLibraryName.trim()) return

        try {
            const res = await fetch('/api/food/library', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newLibraryName.trim(),
                    emoji: newLibraryEmoji,
                    description: newLibraryDesc.trim() || undefined,
                }),
            })

            if (res.ok) {
                const data = await res.json()
                setLibraries(prev => [...prev, data.library])
                setShowCreateForm(false)
                setNewLibraryName('')
                setNewLibraryEmoji('📂')
                setNewLibraryDesc('')
            }
        } catch (error) {
            console.error('Failed to create library:', error)
        }
    }

    const handleUpdateLibrary = async () => {
        if (!selectedLibrary || !newLibraryName.trim()) return

        try {
            const res = await fetch('/api/food/library', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedLibrary.id,
                    name: newLibraryName.trim(),
                    emoji: newLibraryEmoji,
                    description: newLibraryDesc.trim() || undefined,
                }),
            })

            if (res.ok) {
                setLibraries(prev => prev.map(lib =>
                    lib.id === selectedLibrary.id
                        ? { ...lib, name: newLibraryName.trim(), emoji: newLibraryEmoji, description: newLibraryDesc.trim() }
                        : lib
                ))
                setSelectedLibrary(prev => prev ? { ...prev, name: newLibraryName.trim(), emoji: newLibraryEmoji } : null)
                setShowEditForm(false)
            }
        } catch (error) {
            console.error('Failed to update library:', error)
        }
    }

    const handleDeleteLibrary = async (libraryId: string) => {
        try {
            const res = await fetch(`/api/food/library?id=${libraryId}&moveToDefault=${deleteMode === 'move'}`, {
                method: 'DELETE',
            })

            if (res.ok) {
                setLibraries(prev => prev.filter(lib => lib.id !== libraryId))
                if (selectedLibrary?.id === libraryId) {
                    setSelectedLibrary(null)
                }
                setShowDeleteConfirm(null)
                onFoodsUpdated?.()
            }
        } catch (error) {
            console.error('Failed to delete library:', error)
        }
    }

    const handleDeleteFood = async (foodId: string) => {
        try {
            const res = await fetch(`/api/food/options?id=${foodId}`, {
                method: 'DELETE',
            })

            if (res.ok) {
                setLibraryFoods(prev => prev.filter(food => food.id !== foodId))
                // 更新库的食物数量
                if (selectedLibrary) {
                    setLibraries(prev => prev.map(lib =>
                        lib.id === selectedLibrary.id
                            ? { ...lib, _count: { foodOptions: lib._count.foodOptions - 1 } }
                            : lib
                    ))
                }
                onFoodsUpdated?.()
            }
        } catch (error) {
            console.error('Failed to delete food:', error)
        }
    }

    const getCategoryInfo = (categoryId: string) => {
        return FOOD_CATEGORIES.find(c => c.id === categoryId)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-xl flex flex-col">
                {/* Header */}
                <div className="border-b border-gray-100 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {selectedLibrary && (
                            <button
                                onClick={() => setSelectedLibrary(null)}
                                className="p-1 hover:bg-gray-100 rounded-full transition"
                            >
                                ←
                            </button>
                        )}
                        <h2 className="text-lg font-bold text-[var(--hf-text)]">
                            {selectedLibrary ? (
                                <span>{selectedLibrary.emoji} {selectedLibrary.name}</span>
                            ) : (
                                '📚 我的美食库'
                            )}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="spinner mx-auto mb-2" style={{ width: 32, height: 32 }}></div>
                            <p className="text-sm text-[var(--hf-text-muted)]">加载中...</p>
                        </div>
                    ) : selectedLibrary ? (
                        // 库内食物列表
                        <div>
                            {/* 库操作 */}
                            {!selectedLibrary.isDefault && (
                                <div className="flex gap-2 mb-4">
                                    <button
                                        onClick={() => {
                                            setNewLibraryName(selectedLibrary.name)
                                            setNewLibraryEmoji(selectedLibrary.emoji)
                                            setNewLibraryDesc(selectedLibrary.description || '')
                                            setShowEditForm(true)
                                        }}
                                        className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition"
                                    >
                                        ✏️ 编辑库
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(selectedLibrary.id)}
                                        className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition"
                                    >
                                        🗑️ 删除库
                                    </button>
                                </div>
                            )}

                            {/* 食物列表 */}
                            {libraryFoods.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-4xl mb-3">🍽️</div>
                                    <p className="text-[var(--hf-text-muted)]">这个库还没有食物</p>
                                    <p className="text-sm text-[var(--hf-text-muted)] mt-1">
                                        点击右下角 + 按钮添加
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {libraryFoods.map(food => {
                                        const category = getCategoryInfo(food.category)
                                        return (
                                            <div
                                                key={food.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{food.emoji}</span>
                                                    <div>
                                                        <p className="font-medium text-[var(--hf-text)]">{food.name}</p>
                                                        <p className="text-xs text-[var(--hf-text-muted)]">
                                                            {category?.emoji} {category?.name}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteFood(food.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                                                    title="删除"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                        // 库列表
                        <div>
                            {/* 创建新库按钮 */}
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="w-full p-4 border-2 border-dashed border-gray-200 rounded-xl text-[var(--hf-text-muted)] hover:border-[var(--hf-yellow)] hover:text-[var(--hf-text)] transition mb-4"
                            >
                                <span className="text-xl">➕</span>
                                <span className="ml-2">创建新的美食库</span>
                            </button>

                            {/* 库列表 */}
                            <div className="space-y-2">
                                {libraries.map(library => (
                                    <button
                                        key={library.id}
                                        onClick={() => setSelectedLibrary(library)}
                                        className="w-full p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition text-left flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{library.emoji}</span>
                                            <div>
                                                <p className="font-medium text-[var(--hf-text)]">
                                                    {library.name}
                                                    {library.isDefault && (
                                                        <span className="ml-2 text-xs bg-[var(--hf-yellow)] px-2 py-0.5 rounded-full">
                                                            默认
                                                        </span>
                                                    )}
                                                </p>
                                                {library.description && (
                                                    <p className="text-xs text-[var(--hf-text-muted)]">{library.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-[var(--hf-text-muted)]">
                                                {library._count.foodOptions} 项
                                            </span>
                                            <span className="text-gray-300">→</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* 使用选中库的按钮 */}
                {selectedLibrary && onLibrarySelect && (
                    <div className="border-t border-gray-100 p-4">
                        <button
                            onClick={() => {
                                onLibrarySelect(selectedLibrary.id)
                                onClose()
                            }}
                            className="w-full py-3 bg-[var(--hf-yellow)] rounded-xl font-medium text-[var(--hf-text)] hover:opacity-90 transition"
                        >
                            🎯 使用此库作为转盘数据源
                        </button>
                    </div>
                )}

                {/* 创建库弹窗 */}
                {showCreateForm && (
                    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
                            <h3 className="text-lg font-bold text-[var(--hf-text)] mb-4">创建新美食库</h3>

                            {/* Emoji 选择 */}
                            <div className="mb-4">
                                <p className="text-sm text-[var(--hf-text-muted)] mb-2">选择图标</p>
                                <div className="flex flex-wrap gap-2">
                                    {LIBRARY_EMOJIS.map(emoji => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => setNewLibraryEmoji(emoji)}
                                            className={`w-10 h-10 text-xl rounded-lg transition ${newLibraryEmoji === emoji
                                                ? 'bg-[var(--hf-yellow)]'
                                                : 'bg-gray-100 hover:bg-gray-200'
                                                }`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-[var(--hf-text-muted)] mb-2">库名称</p>
                                <input
                                    type="text"
                                    value={newLibraryName}
                                    onChange={(e) => setNewLibraryName(e.target.value)}
                                    placeholder="例如：常吃的外卖"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--hf-yellow)]"
                                />
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-[var(--hf-text-muted)] mb-2">描述 (可选)</p>
                                <input
                                    type="text"
                                    value={newLibraryDesc}
                                    onChange={(e) => setNewLibraryDesc(e.target.value)}
                                    placeholder="简单描述这个库"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--hf-yellow)]"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateForm(false)
                                        setNewLibraryName('')
                                        setNewLibraryEmoji('📂')
                                        setNewLibraryDesc('')
                                    }}
                                    className="flex-1 py-3 border border-gray-200 rounded-xl text-[var(--hf-text-muted)] hover:bg-gray-50"
                                >
                                    取消
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCreateLibrary}
                                    disabled={!newLibraryName.trim()}
                                    className="flex-1 py-3 bg-[var(--hf-yellow)] rounded-xl font-medium text-[var(--hf-text)] disabled:opacity-50 hover:opacity-90 transition"
                                >
                                    创建
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 编辑库弹窗 */}
                {showEditForm && selectedLibrary && (
                    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
                            <h3 className="text-lg font-bold text-[var(--hf-text)] mb-4">编辑美食库</h3>

                            {/* Emoji 选择 */}
                            <div className="mb-4">
                                <p className="text-sm text-[var(--hf-text-muted)] mb-2">选择图标</p>
                                <div className="flex flex-wrap gap-2">
                                    {LIBRARY_EMOJIS.map(emoji => (
                                        <button
                                            key={emoji}
                                            onClick={() => setNewLibraryEmoji(emoji)}
                                            className={`w-10 h-10 text-xl rounded-lg transition ${newLibraryEmoji === emoji
                                                ? 'bg-[var(--hf-yellow)]'
                                                : 'bg-gray-100 hover:bg-gray-200'
                                                }`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-[var(--hf-text-muted)] mb-2">库名称</p>
                                <input
                                    type="text"
                                    value={newLibraryName}
                                    onChange={(e) => setNewLibraryName(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--hf-yellow)]"
                                />
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-[var(--hf-text-muted)] mb-2">描述 (可选)</p>
                                <input
                                    type="text"
                                    value={newLibraryDesc}
                                    onChange={(e) => setNewLibraryDesc(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--hf-yellow)]"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowEditForm(false)}
                                    className="flex-1 py-3 border border-gray-200 rounded-xl text-[var(--hf-text-muted)] hover:bg-gray-50"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={handleUpdateLibrary}
                                    disabled={!newLibraryName.trim()}
                                    className="flex-1 py-3 bg-[var(--hf-yellow)] rounded-xl font-medium text-[var(--hf-text)] disabled:opacity-50"
                                >
                                    保存
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 删除确认弹窗 */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
                            <h3 className="text-lg font-bold text-[var(--hf-text)] mb-2">删除美食库</h3>
                            <p className="text-sm text-[var(--hf-text-muted)] mb-4">
                                确定要删除这个库吗？请选择如何处理库内的食物：
                            </p>

                            <div className="space-y-2 mb-4">
                                <button
                                    onClick={() => setDeleteMode('move')}
                                    className={`w-full p-3 rounded-xl border text-left transition ${deleteMode === 'move'
                                        ? 'border-[var(--hf-yellow)] bg-[var(--hf-yellow-light)]'
                                        : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <p className="font-medium">📦 移动到默认库</p>
                                    <p className="text-xs text-[var(--hf-text-muted)]">保留食物，仅删除库</p>
                                </button>
                                <button
                                    onClick={() => setDeleteMode('delete')}
                                    className={`w-full p-3 rounded-xl border text-left transition ${deleteMode === 'delete'
                                        ? 'border-red-400 bg-red-50'
                                        : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <p className="font-medium text-red-600">🗑️ 一并删除</p>
                                    <p className="text-xs text-[var(--hf-text-muted)]">删除库和其中所有食物</p>
                                </button>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="flex-1 py-3 border border-gray-200 rounded-xl text-[var(--hf-text-muted)] hover:bg-gray-50"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={() => handleDeleteLibrary(showDeleteConfirm)}
                                    className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600"
                                >
                                    确认删除
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
