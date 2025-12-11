'use client'

import { useState } from 'react'
import { type PresetFood } from '@/lib/food-categories'

interface FoodOptionCardProps {
    food: PresetFood & { id?: string; isCustom?: boolean }
    onDelete?: (id: string) => void
    onEdit?: (food: PresetFood & { id?: string }) => void
    selectable?: boolean
    selected?: boolean
    onSelect?: (food: PresetFood) => void
}

export default function FoodOptionCard({
    food,
    onDelete,
    onEdit,
    selectable = false,
    selected = false,
    onSelect,
}: FoodOptionCardProps) {
    const [showActions, setShowActions] = useState(false)

    const handleClick = () => {
        if (selectable && onSelect) {
            onSelect(food)
        } else {
            setShowActions(!showActions)
        }
    }

    return (
        <div
            className={`
        relative p-3 rounded-xl border transition-all cursor-pointer
        ${selected
                    ? 'bg-[var(--hf-yellow-light)] border-[var(--hf-yellow)] shadow-md'
                    : 'bg-white border-gray-100 hover:border-[var(--hf-yellow)] hover:shadow-sm'
                }
      `}
            onClick={handleClick}
        >
            <div className="flex items-center gap-3">
                {/* Emoji */}
                <span className="text-2xl">{food.emoji}</span>

                {/* 信息 */}
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--hf-text)] truncate">{food.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {food.tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag}
                                className="text-xs px-1.5 py-0.5 bg-gray-100 text-[var(--hf-text-muted)] rounded"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* 选择指示器 */}
                {selectable && (
                    <div
                        className={`
              w-5 h-5 rounded-full border-2 flex items-center justify-center
              ${selected
                                ? 'bg-[var(--hf-yellow)] border-[var(--hf-yellow)]'
                                : 'border-gray-300'
                            }
            `}
                    >
                        {selected && <span className="text-white text-xs">✓</span>}
                    </div>
                )}

                {/* 自定义标记 */}
                {food.isCustom && (
                    <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded">
                        自定义
                    </span>
                )}
            </div>

            {/* 操作按钮 */}
            {showActions && !selectable && food.isCustom && (
                <div className="absolute right-2 top-2 flex gap-1 bg-white rounded-lg shadow-lg p-1 z-10">
                    {onEdit && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onEdit(food)
                                setShowActions(false)
                            }}
                            className="p-1.5 hover:bg-gray-100 rounded text-sm"
                            title="编辑"
                        >
                            ✏️
                        </button>
                    )}
                    {onDelete && food.id && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                if (confirm('确定删除这个食物选项吗？')) {
                                    onDelete(food.id!)
                                }
                                setShowActions(false)
                            }}
                            className="p-1.5 hover:bg-red-50 rounded text-sm"
                            title="删除"
                        >
                            🗑️
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
