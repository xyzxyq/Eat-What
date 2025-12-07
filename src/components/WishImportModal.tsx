'use client'

import { useState } from 'react'

interface WishImportModalProps {
    isOpen: boolean
    onClose: () => void
    onImport: () => void
}

// 预设心愿模板
const wishTemplates = {
    romantic: {
        name: '💕 浪漫约会',
        emoji: '💕',
        wishes: [
            '一起看日落',
            '星空下野餐',
            '拍一组情侣写真',
            '看一场浪漫电影',
            '互相写一封情书',
            '在沙滩上漫步',
            '一起放烟花',
            '跳一支舞'
        ]
    },
    food: {
        name: '🍜 美食探店',
        emoji: '🍜',
        wishes: [
            '一起学做寿司',
            '喝一次下午茶',
            '吃一顿火锅',
            '尝试一家新餐厅',
            '一起做蛋糕',
            '野餐烧烤',
            '吃遍当地小吃',
            '做一顿烛光晚餐'
        ]
    },
    travel: {
        name: '✈️ 旅行清单',
        emoji: '✈️',
        wishes: [
            '去海边度假',
            '看一次极光',
            '逛古镇老街',
            '爬一座山',
            '住一次民宿',
            '坐一次摩天轮',
            '看日出',
            '去游乐园玩'
        ]
    },
    home: {
        name: '🏠 居家时光',
        emoji: '🏠',
        wishes: [
            '一起做饭',
            '电影马拉松',
            'DIY手工',
            '一起玩游戏',
            '互相按摩放松',
            '整理家居',
            '一起养一盆植物',
            '拼一幅拼图'
        ]
    }
}

export default function WishImportModal({ isOpen, onClose, onImport }: WishImportModalProps) {
    const [textInput, setTextInput] = useState('')
    const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<string | null>(null)

    if (!isOpen) return null

    const toggleTemplate = (key: string) => {
        setSelectedTemplates(prev =>
            prev.includes(key)
                ? prev.filter(k => k !== key)
                : [...prev, key]
        )
    }

    const getPreviewWishes = () => {
        const textWishes = textInput
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)

        const templateWishes = selectedTemplates.flatMap(
            key => wishTemplates[key as keyof typeof wishTemplates].wishes
        )

        return [...new Set([...textWishes, ...templateWishes])]
    }

    const handleImport = async () => {
        const wishes = getPreviewWishes()
        if (wishes.length === 0) return

        setLoading(true)
        setResult(null)

        try {
            const res = await fetch('/api/wishes/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wishes })
            })

            const data = await res.json()

            if (res.ok) {
                setResult(`✅ ${data.message}`)
                setTextInput('')
                setSelectedTemplates([])
                setTimeout(() => {
                    onImport()
                    onClose()
                }, 1500)
            } else {
                setResult(`❌ ${data.error}`)
            }
        } catch {
            setResult('❌ 导入失败，请重试')
        } finally {
            setLoading(false)
        }
    }

    const previewWishes = getPreviewWishes()

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-[var(--hf-border)] flex items-center justify-between">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        📥 导入心愿
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-xl"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto max-h-[60vh] space-y-4">
                    {/* Text Input */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            ✏️ 粘贴心愿（每行一条）
                        </label>
                        <textarea
                            value={textInput}
                            onChange={e => setTextInput(e.target.value)}
                            placeholder="一起去看海&#10;学做一道新菜&#10;看一场电影..."
                            className="w-full h-32 p-3 border border-[var(--hf-border)] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[var(--hf-yellow)] text-sm"
                        />
                    </div>

                    {/* Templates */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            ✨ 或选择预设模板
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(wishTemplates).map(([key, template]) => (
                                <button
                                    key={key}
                                    onClick={() => toggleTemplate(key)}
                                    className={`p-3 rounded-lg border-2 text-left transition-all ${selectedTemplates.includes(key)
                                            ? 'border-[var(--hf-yellow)] bg-[var(--hf-yellow-light)]'
                                            : 'border-[var(--hf-border)] hover:border-[var(--hf-yellow)]'
                                        }`}
                                >
                                    <span className="text-lg">{template.emoji}</span>
                                    <span className="ml-2 text-sm font-medium">{template.name.replace(template.emoji + ' ', '')}</span>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {template.wishes.length} 条心愿
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    {previewWishes.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-sm font-medium mb-2 flex items-center justify-between">
                                <span>📋 预览 ({previewWishes.length} 条)</span>
                            </div>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                                {previewWishes.slice(0, 10).map((wish, i) => (
                                    <div key={i} className="text-xs text-gray-600 truncate">
                                        • {wish}
                                    </div>
                                ))}
                                {previewWishes.length > 10 && (
                                    <div className="text-xs text-gray-400">
                                        ... 还有 {previewWishes.length - 10} 条
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Result */}
                    {result && (
                        <div className={`text-center text-sm p-2 rounded-lg ${result.startsWith('✅') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                            }`}>
                            {result}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[var(--hf-border)] flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-lg border border-[var(--hf-border)] text-[var(--hf-text-muted)] hover:bg-gray-50 transition"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={loading || previewWishes.length === 0}
                        className="flex-1 py-2.5 rounded-lg bg-[var(--hf-yellow)] text-[var(--hf-text)] font-medium hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? '导入中...' : `导入 ${previewWishes.length} 条心愿`}
                    </button>
                </div>
            </div>
        </div>
    )
}
