'use client'

import { useState, useEffect } from 'react'

interface ThemeSelectorProps {
    onThemeChange?: (theme: string) => void
}

const THEMES = [
    { id: 'yellow', name: '阳光黄', color: '#FFD21E', emoji: '🌻' },
    { id: 'pink', name: '甜蜜粉', color: '#EC4899', emoji: '🌸' },
    { id: 'blue', name: '天空蓝', color: '#3B82F6', emoji: '🌊' },
    { id: 'purple', name: '浪漫紫', color: '#8B5CF6', emoji: '💜' },
    { id: 'green', name: '清新绿', color: '#10B981', emoji: '🌿' },
    { id: 'orange', name: '活力橙', color: '#F97316', emoji: '🍊' },
]

export default function ThemeSelector({ onThemeChange }: ThemeSelectorProps) {
    const [currentTheme, setCurrentTheme] = useState('yellow')
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchTheme()
    }, [])

    const fetchTheme = async () => {
        try {
            const res = await fetch('/api/space')
            if (res.ok) {
                const data = await res.json()
                const theme = data.theme || 'yellow'
                setCurrentTheme(theme)
                applyTheme(theme)
            }
        } catch (error) {
            console.error('Failed to fetch theme:', error)
        }
    }

    const applyTheme = (theme: string) => {
        document.documentElement.setAttribute('data-theme', theme === 'yellow' ? '' : theme)
    }

    const handleSelectTheme = async (themeId: string) => {
        setLoading(true)
        try {
            await fetch('/api/space', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme: themeId })
            })
            setCurrentTheme(themeId)
            applyTheme(themeId)
            onThemeChange?.(themeId)
        } catch (error) {
            console.error('Failed to update theme:', error)
        } finally {
            setLoading(false)
            setIsOpen(false)
        }
    }

    const currentThemeData = THEMES.find(t => t.id === currentTheme)

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-sm text-[var(--hf-text-muted)] hover:text-[var(--hf-text)] transition"
            >
                🎨 <span className="hidden sm:inline">主题更改</span>
                <span
                    className="w-4 h-4 rounded-full border border-[var(--hf-border)]"
                    style={{ backgroundColor: currentThemeData?.color }}
                ></span>
            </button>

            {isOpen && (
                <div className="absolute bottom-full left-0 mb-2 p-3 bg-white border border-[var(--hf-border)] rounded-xl shadow-lg z-50 min-w-[200px]">
                    <p className="text-xs text-[var(--hf-text-muted)] mb-3">选择主题颜色</p>
                    <div className="grid grid-cols-3 gap-2">
                        {THEMES.map(theme => (
                            <button
                                key={theme.id}
                                onClick={() => handleSelectTheme(theme.id)}
                                disabled={loading}
                                className={`flex flex-col items-center p-2 rounded-lg border transition ${currentTheme === theme.id
                                        ? 'border-[var(--hf-yellow)] bg-[var(--hf-yellow-light)]'
                                        : 'border-[var(--hf-border)] hover:border-[var(--hf-yellow)]'
                                    }`}
                            >
                                <span className="text-xl">{theme.emoji}</span>
                                <span
                                    className="w-5 h-5 rounded-full my-1 border border-white shadow-sm"
                                    style={{ backgroundColor: theme.color }}
                                ></span>
                                <span className="text-xs text-[var(--hf-text)]">{theme.name}</span>
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-full mt-3 text-xs text-[var(--hf-text-muted)] hover:text-[var(--hf-text)]"
                    >
                        关闭
                    </button>
                </div>
            )}
        </div>
    )
}

export { THEMES }
