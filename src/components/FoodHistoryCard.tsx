'use client'

import { useState } from 'react'

interface FoodChoice {
    id: string
    foodName: string
    foodEmoji: string
    category: string
    mode: string
    userARating?: number | null
    userBRating?: number | null
    note?: string | null
    chosenDate: string
}

interface FoodHistoryCardProps {
    choice: FoodChoice
    onRate?: (id: string, rating: number) => void
    onAddNote?: (id: string, note: string) => void
    isUserA?: boolean
}

export default function FoodHistoryCard({
    choice,
    onRate,
    onAddNote,
    isUserA = true,
}: FoodHistoryCardProps) {
    const [showNoteInput, setShowNoteInput] = useState(false)
    const [noteText, setNoteText] = useState(choice.note || '')
    const [hoveredRating, setHoveredRating] = useState(0)

    const currentRating = isUserA ? choice.userARating : choice.userBRating
    const partnerRating = isUserA ? choice.userBRating : choice.userARating
    const avgRating = ((choice.userARating || 0) + (choice.userBRating || 0)) / 2

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return '今天'
        if (diffDays === 1) return '昨天'
        if (diffDays < 7) return `${diffDays}天前`
        return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    }

    const handleSubmitNote = () => {
        if (noteText.trim() && onAddNote) {
            onAddNote(choice.id, noteText.trim())
        }
        setShowNoteInput(false)
    }

    return (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
            {/* Header */}
            <div className="flex items-start gap-3">
                <span className="text-3xl">{choice.foodEmoji}</span>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="font-medium text-[var(--hf-text)] truncate">{choice.foodName}</p>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-[var(--hf-text-muted)] rounded">
                            {choice.mode === 'vote' ? '💕投票' : '🎲随机'}
                        </span>
                    </div>
                    <p className="text-xs text-[var(--hf-text-muted)] mt-0.5">
                        {formatDate(choice.chosenDate)}
                    </p>
                </div>

                {/* 平均评分 */}
                {(choice.userARating || choice.userBRating) && (
                    <div className="text-right">
                        <div className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span className="font-medium text-[var(--hf-text)]">
                                {avgRating.toFixed(1)}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* 评分 */}
            <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-[var(--hf-text-muted)]">我的评分:</span>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => onRate?.(choice.id, star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className={`text-lg transition ${star <= (hoveredRating || currentRating || 0)
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                        >
                            ★
                        </button>
                    ))}
                </div>

                {partnerRating && (
                    <span className="text-xs text-[var(--hf-text-muted)] ml-2">
                        TA: {partnerRating}★
                    </span>
                )}
            </div>

            {/* 备注 */}
            {choice.note && !showNoteInput && (
                <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                    <p className="text-sm text-[var(--hf-text-muted)]">&ldquo;{choice.note}&rdquo;</p>
                </div>
            )}

            {/* 备注输入 */}
            {showNoteInput ? (
                <div className="mt-3 flex gap-2">
                    <input
                        type="text"
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="记录一下这次的体验..."
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[var(--hf-yellow)] focus:outline-none"
                    />
                    <button
                        onClick={handleSubmitNote}
                        className="px-3 py-2 bg-[var(--hf-yellow)] rounded-lg text-sm"
                    >
                        保存
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setShowNoteInput(true)}
                    className="mt-2 text-xs text-[var(--hf-text-muted)] hover:text-[var(--hf-text)]"
                >
                    {choice.note ? '修改备注' : '+ 添加备注'}
                </button>
            )}
        </div>
    )
}
