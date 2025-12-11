'use client'

import { useState } from 'react'
import { FOOD_CATEGORIES, FOOD_TAGS, type PresetFood } from '@/lib/food-categories'

interface AddFoodModalProps {
    isOpen: boolean
    onClose: () => void
    onAdd: (food: Omit<PresetFood, 'isPreset'>) => void
    editFood?: PresetFood | null
}

const EMOJI_OPTIONS = [
    '🍜', '🍚', '🍝', '🍲', '🍛', '🍱', '🥟', '🥢',
    '🍔', '🍟', '🍕', '🌮', '🥪', '🥙', '🧆', '🌯',
    '🍗', '🍖', '🥩', '🥓', '🍳', '🥚', '🧇', '🥞',
    '🍣', '🍤', '🦐', '🦀', '🦞', '🦪', '🐟', '🐙',
    '🥗', '🥬', '🥒', '🥦', '🍄', '🧄', '🧅', '🥕',
    '🍰', '🧁', '🍩', '🍪', '🍡', '🍧', '🍦', '🥧',
    '🧋', '☕', '🍵', '🥤', '🧃', '🍹', '🥛', '🍺',
]

export default function AddFoodModal({ isOpen, onClose, onAdd, editFood }: AddFoodModalProps) {
    const [name, setName] = useState(editFood?.name || '')
    const [emoji, setEmoji] = useState(editFood?.emoji || '🍽️')
    const [category, setCategory] = useState(editFood?.category || '')
    const [selectedTags, setSelectedTags] = useState<string[]>(editFood?.tags || [])
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = () => {
        if (!name.trim()) {
            setError('请输入食物名称')
            return
        }
        if (!category) {
            setError('请选择分类')
            return
        }

        onAdd({
            name: name.trim(),
            emoji,
            category,
            tags: selectedTags,
        })

        // 重置表单
        setName('')
        setEmoji('🍽️')
        setCategory('')
        setSelectedTags([])
        setError('')
        onClose()
    }

    const toggleTag = (tagId: string) => {
        setSelectedTags(prev =>
            prev.includes(tagId)
                ? prev.filter(t => t !== tagId)
                : [...prev, tagId]
        )
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-[var(--hf-text)]">
                        {editFood ? '编辑食物' : '添加自定义食物'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* 错误提示 */}
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Emoji 选择 */}
                    <div>
                        <label className="text-sm font-medium text-[var(--hf-text-muted)] mb-2 block">
                            选择图标
                        </label>
                        <button
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="w-16 h-16 text-4xl bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition"
                        >
                            {emoji}
                        </button>
                        {showEmojiPicker && (
                            <div className="mt-2 p-2 bg-gray-50 rounded-lg grid grid-cols-8 gap-1">
                                {EMOJI_OPTIONS.map((e) => (
                                    <button
                                        key={e}
                                        onClick={() => {
                                            setEmoji(e)
                                            setShowEmojiPicker(false)
                                        }}
                                        className={`p-2 text-xl hover:bg-white rounded transition ${emoji === e ? 'bg-white shadow-sm' : ''
                                            }`}
                                    >
                                        {e}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 食物名称 */}
                    <div>
                        <label className="text-sm font-medium text-[var(--hf-text-muted)] mb-2 block">
                            食物名称 *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="例如：兰州拉面、海底捞..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[var(--hf-yellow)] focus:outline-none transition"
                        />
                    </div>

                    {/* 分类 */}
                    <div>
                        <label className="text-sm font-medium text-[var(--hf-text-muted)] mb-2 block">
                            选择分类 *
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {FOOD_CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategory(cat.id)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${category === cat.id
                                            ? 'bg-[var(--hf-yellow)] text-[var(--hf-text)]'
                                            : 'bg-gray-100 text-[var(--hf-text-muted)] hover:bg-gray-200'
                                        }`}
                                >
                                    {cat.emoji} {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 标签 */}
                    <div>
                        <label className="text-sm font-medium text-[var(--hf-text-muted)] mb-2 block">
                            添加标签 (可选)
                        </label>

                        {/* 口味 */}
                        <p className="text-xs text-[var(--hf-text-muted)] mt-2 mb-1">口味</p>
                        <div className="flex flex-wrap gap-1">
                            {FOOD_TAGS.filter(t => t.group === 'taste').map((tag) => (
                                <button
                                    key={tag.id}
                                    onClick={() => toggleTag(tag.id)}
                                    className={`px-2 py-1 rounded-full text-xs font-medium transition ${selectedTags.includes(tag.id)
                                            ? 'bg-[var(--hf-yellow)] text-[var(--hf-text)]'
                                            : 'bg-gray-100 text-[var(--hf-text-muted)] hover:bg-gray-200'
                                        }`}
                                >
                                    {tag.emoji} {tag.name}
                                </button>
                            ))}
                        </div>

                        {/* 价格 */}
                        <p className="text-xs text-[var(--hf-text-muted)] mt-2 mb-1">价格</p>
                        <div className="flex flex-wrap gap-1">
                            {FOOD_TAGS.filter(t => t.group === 'price').map((tag) => (
                                <button
                                    key={tag.id}
                                    onClick={() => toggleTag(tag.id)}
                                    className={`px-2 py-1 rounded-full text-xs font-medium transition ${selectedTags.includes(tag.id)
                                            ? 'bg-[var(--hf-yellow)] text-[var(--hf-text)]'
                                            : 'bg-gray-100 text-[var(--hf-text-muted)] hover:bg-gray-200'
                                        }`}
                                >
                                    {tag.emoji} {tag.name}
                                </button>
                            ))}
                        </div>

                        {/* 场景 */}
                        <p className="text-xs text-[var(--hf-text-muted)] mt-2 mb-1">场景</p>
                        <div className="flex flex-wrap gap-1">
                            {FOOD_TAGS.filter(t => t.group === 'scene').map((tag) => (
                                <button
                                    key={tag.id}
                                    onClick={() => toggleTag(tag.id)}
                                    className={`px-2 py-1 rounded-full text-xs font-medium transition ${selectedTags.includes(tag.id)
                                            ? 'bg-[var(--hf-yellow)] text-[var(--hf-text)]'
                                            : 'bg-gray-100 text-[var(--hf-text-muted)] hover:bg-gray-200'
                                        }`}
                                >
                                    {tag.emoji} {tag.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-[var(--hf-text-muted)] hover:bg-gray-50 transition"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 px-4 py-3 bg-[var(--hf-yellow)] rounded-xl text-[var(--hf-text)] font-medium hover:opacity-90 transition"
                    >
                        {editFood ? '保存' : '添加'}
                    </button>
                </div>
            </div>
        </div>
    )
}
