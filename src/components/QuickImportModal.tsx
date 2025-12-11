'use client'

import { useState } from 'react'
import { QUICK_TEMPLATES, PRESET_FOODS, type PresetFood } from '@/lib/food-categories'

interface QuickImportModalProps {
    isOpen: boolean
    onClose: () => void
    onImport: (foods: PresetFood[]) => void
}

const TEMPLATE_INFO: Record<string, { name: string; emoji: string; desc: string }> = {
    fastFood: { name: '快餐套餐', emoji: '🍔', desc: '麦当劳、肯德基等快餐品牌' },
    milkTea: { name: '奶茶饮品', emoji: '🧋', desc: '喜茶、奈雪、蜜雪冰城等' },
    hotpot: { name: '火锅品牌', emoji: '🍲', desc: '海底捞、小龙坎等' },
    delivery: { name: '外卖常点', emoji: '🥡', desc: '麻辣烫、黄焖鸡等快捷外卖' },
    date: { name: '约会餐厅', emoji: '💕', desc: '适合约会的餐厅类型' },
    lateNight: { name: '深夜食堂', emoji: '🌙', desc: '烧烤、小龙虾等夜宵' },
    healthy: { name: '健康轻食', emoji: '🥗', desc: '沙拉、轻食、低卡选择' },
}

export default function QuickImportModal({ isOpen, onClose, onImport }: QuickImportModalProps) {
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
    const [previewFoods, setPreviewFoods] = useState<PresetFood[]>([])

    const handleTemplateClick = (templateKey: string) => {
        if (selectedTemplate === templateKey) {
            setSelectedTemplate(null)
            setPreviewFoods([])
        } else {
            setSelectedTemplate(templateKey)
            const templateNames = QUICK_TEMPLATES[templateKey as keyof typeof QUICK_TEMPLATES]
            const foods = PRESET_FOODS.filter(f => templateNames.includes(f.name))
            setPreviewFoods(foods)
        }
    }

    const handleImport = () => {
        if (previewFoods.length > 0) {
            onImport(previewFoods)
            setSelectedTemplate(null)
            setPreviewFoods([])
            onClose()
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-xl">
                {/* Header */}
                <div className="border-b border-gray-100 p-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-[var(--hf-text)]">
                        ⚡ 快速导入
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto max-h-[60vh]">
                    <p className="text-sm text-[var(--hf-text-muted)] mb-4">
                        选择一个模板，快速添加常见食物选项
                    </p>

                    {/* Templates */}
                    <div className="space-y-2">
                        {Object.entries(TEMPLATE_INFO).map(([key, info]) => (
                            <button
                                key={key}
                                onClick={() => handleTemplateClick(key)}
                                className={`w-full p-3 rounded-xl border text-left transition ${selectedTemplate === key
                                        ? 'border-[var(--hf-yellow)] bg-[var(--hf-yellow-light)]'
                                        : 'border-gray-100 hover:border-gray-200'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{info.emoji}</span>
                                    <div>
                                        <p className="font-medium text-[var(--hf-text)]">{info.name}</p>
                                        <p className="text-xs text-[var(--hf-text-muted)]">{info.desc}</p>
                                    </div>
                                    <span className="ml-auto text-sm text-[var(--hf-text-muted)]">
                                        {QUICK_TEMPLATES[key as keyof typeof QUICK_TEMPLATES].length} 项
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Preview */}
                    {previewFoods.length > 0 && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                            <p className="text-sm font-medium text-[var(--hf-text)] mb-2">
                                预览 ({previewFoods.length} 项)
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {previewFoods.map((food, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 bg-white rounded-lg text-sm border border-gray-100"
                                    >
                                        {food.emoji} {food.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 p-4 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-[var(--hf-text-muted)] hover:bg-gray-50 transition"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={previewFoods.length === 0}
                        className={`flex-1 px-4 py-3 rounded-xl font-medium transition ${previewFoods.length > 0
                                ? 'bg-[var(--hf-yellow)] text-[var(--hf-text)] hover:opacity-90'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        导入 {previewFoods.length > 0 && `(${previewFoods.length})`}
                    </button>
                </div>
            </div>
        </div>
    )
}
