'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { THEMES } from './ThemeSelector'

interface UserSettings {
    id: string
    nickname: string
    displayName: string | null
    avatarEmoji: string
    avatarUrl: string | null
    email: string | null
    isEmailVerified: boolean
    status: string
    notifyOnMoment: boolean
    notifyOnComment: boolean
    notifyOnWish: boolean
    partnerName: string
}

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const router = useRouter()
    const [settings, setSettings] = useState<UserSettings | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState<'notifications' | 'theme' | 'account' | 'email'>('notifications')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    // 更换邮箱状态
    const [newEmail, setNewEmail] = useState('')
    const [emailCode, setEmailCode] = useState('')
    const [emailStep, setEmailStep] = useState<'input' | 'verify'>('input')
    const [countdown, setCountdown] = useState(0)

    // 主题状态
    const [currentTheme, setCurrentTheme] = useState('yellow')

    useEffect(() => {
        if (isOpen) {
            fetchSettings()
            fetchTheme()
        }
    }, [isOpen])

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown])

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/user/settings')
            if (res.ok) {
                const data = await res.json()
                setSettings(data)
            }
        } catch (e) {
            console.error('Failed to fetch settings:', e)
        } finally {
            setLoading(false)
        }
    }

    const fetchTheme = async () => {
        try {
            const res = await fetch('/api/space')
            if (res.ok) {
                const data = await res.json()
                setCurrentTheme(data.theme || 'yellow')
            }
        } catch (e) {
            console.error('Failed to fetch theme:', e)
        }
    }

    const updateSettings = async (updates: Partial<UserSettings>) => {
        setSaving(true)
        setMessage('')
        setError('')
        try {
            const res = await fetch('/api/user/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            })
            if (res.ok) {
                const data = await res.json()
                setSettings(prev => prev ? { ...prev, ...data.user } : null)
                setMessage('设置已保存 ✓')
                setTimeout(() => setMessage(''), 2000)
            } else {
                setError('保存失败')
            }
        } catch {
            setError('网络错误')
        } finally {
            setSaving(false)
        }
    }

    const handleThemeChange = async (themeId: string) => {
        try {
            await fetch('/api/space', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme: themeId })
            })
            setCurrentTheme(themeId)
            document.documentElement.setAttribute('data-theme', themeId === 'yellow' ? '' : themeId)
        } catch (e) {
            console.error('Failed to update theme:', e)
        }
    }

    const handleSendEmailCode = async () => {
        if (!newEmail || countdown > 0) return
        setError('')
        setSaving(true)
        try {
            const res = await fetch('/api/user/change-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newEmail })
            })
            const data = await res.json()
            if (res.ok) {
                setEmailStep('verify')
                setCountdown(60)
                setMessage('验证码已发送')
            } else {
                setError(data.error || '发送失败')
            }
        } catch {
            setError('网络错误')
        } finally {
            setSaving(false)
        }
    }

    const handleVerifyEmail = async () => {
        if (!emailCode) return
        setError('')
        setSaving(true)
        try {
            const res = await fetch('/api/user/change-email', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newEmail, code: emailCode })
            })
            const data = await res.json()
            if (res.ok) {
                setMessage('邮箱更换成功！')
                setEmailStep('input')
                setNewEmail('')
                setEmailCode('')
                fetchSettings()
                setActiveTab('account')
            } else {
                setError(data.error || '验证失败')
            }
        } catch {
            setError('网络错误')
        } finally {
            setSaving(false)
        }
    }

    const handleExport = () => {
        window.open('/api/user/export', '_blank')
    }

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
            router.push('/')
        } catch {
            console.error('Logout failed')
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--hf-border)]">
                    <h2 className="text-lg font-bold text-[var(--hf-text)] flex items-center gap-2">
                        <span>⚙️</span>
                        <span>设置</span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--hf-bg)] transition"
                    >
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[var(--hf-border)] overflow-x-auto">
                    {[
                        { id: 'notifications', icon: '📬', label: '通知' },
                        { id: 'theme', icon: '🎨', label: '主题' },
                        { id: 'account', icon: '👤', label: '账户' },
                        { id: 'email', icon: '📧', label: '邮箱' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className={`flex-1 py-3 px-4 text-sm font-medium transition whitespace-nowrap ${activeTab === tab.id
                                    ? 'text-[var(--hf-yellow)] border-b-2 border-[var(--hf-yellow)]'
                                    : 'text-[var(--hf-text-muted)] hover:text-[var(--hf-text)]'
                                }`}
                        >
                            <span className="mr-1">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loading ? (
                        <div className="text-center py-8 text-[var(--hf-text-muted)]">
                            加载中...
                        </div>
                    ) : (
                        <>
                            {/* 通知设置 */}
                            {activeTab === 'notifications' && settings && (
                                <div className="space-y-4">
                                    <p className="text-xs text-[var(--hf-text-muted)]">
                                        当 {settings.partnerName} 有以下动态时，发送邮件通知到 {settings.email || '你的邮箱'}
                                    </p>

                                    {[
                                        { key: 'notifyOnMoment', icon: '📝', label: '发布日记时通知我' },
                                        { key: 'notifyOnComment', icon: '💬', label: '评论我的日记时通知我' },
                                        { key: 'notifyOnWish', icon: '✨', label: '添加新心愿时通知我' },
                                    ].map(item => (
                                        <label
                                            key={item.key}
                                            className="flex items-center justify-between p-4 bg-[var(--hf-bg)] rounded-xl cursor-pointer hover:bg-opacity-80 transition"
                                        >
                                            <span className="flex items-center gap-3">
                                                <span className="text-xl">{item.icon}</span>
                                                <span className="text-sm text-[var(--hf-text)]">{item.label}</span>
                                            </span>
                                            <input
                                                type="checkbox"
                                                checked={settings[item.key as keyof UserSettings] as boolean}
                                                onChange={(e) => updateSettings({ [item.key]: e.target.checked })}
                                                disabled={saving}
                                                className="w-5 h-5 accent-[var(--hf-yellow)]"
                                            />
                                        </label>
                                    ))}
                                </div>
                            )}

                            {/* 主题设置 */}
                            {activeTab === 'theme' && (
                                <div className="space-y-4">
                                    <p className="text-xs text-[var(--hf-text-muted)]">选择主题颜色</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        {THEMES.map(theme => (
                                            <button
                                                key={theme.id}
                                                onClick={() => handleThemeChange(theme.id)}
                                                className={`flex flex-col items-center p-4 rounded-xl border-2 transition ${currentTheme === theme.id
                                                        ? 'border-[var(--hf-yellow)] bg-[var(--hf-yellow-light)]'
                                                        : 'border-[var(--hf-border)] hover:border-[var(--hf-yellow)]'
                                                    }`}
                                            >
                                                <span className="text-2xl">{theme.emoji}</span>
                                                <span
                                                    className="w-6 h-6 rounded-full my-2 border border-white shadow"
                                                    style={{ backgroundColor: theme.color }}
                                                />
                                                <span className="text-xs text-[var(--hf-text)]">{theme.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 账户信息 */}
                            {activeTab === 'account' && settings && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-[var(--hf-bg)] rounded-xl space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-[var(--hf-text-muted)]">爱称</span>
                                            <span className="text-sm font-medium text-[var(--hf-text)]">
                                                {settings.displayName || settings.nickname}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-[var(--hf-text-muted)]">邮箱</span>
                                            <span className="text-sm font-medium text-[var(--hf-text)]">
                                                {settings.email || '未绑定'}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleExport}
                                        className="w-full p-4 bg-[var(--hf-bg)] rounded-xl text-left hover:bg-opacity-80 transition"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-3">
                                                <span className="text-xl">📥</span>
                                                <span className="text-sm text-[var(--hf-text)]">导出我的数据</span>
                                            </span>
                                            <span className="text-[var(--hf-text-muted)]">→</span>
                                        </div>
                                        <p className="text-xs text-[var(--hf-text-muted)] mt-1 ml-8">
                                            下载包含你所有日记、评论和心愿的 JSON 文件
                                        </p>
                                    </button>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full p-4 bg-red-50 rounded-xl text-left hover:bg-red-100 transition"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">🚪</span>
                                            <span className="text-sm text-red-600">退出登录</span>
                                        </div>
                                    </button>
                                </div>
                            )}

                            {/* 更换邮箱 */}
                            {activeTab === 'email' && settings && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-[var(--hf-bg)] rounded-xl">
                                        <p className="text-sm text-[var(--hf-text-muted)]">当前邮箱</p>
                                        <p className="text-lg font-medium text-[var(--hf-text)]">
                                            {settings.email || '未绑定'}
                                        </p>
                                    </div>

                                    {emailStep === 'input' ? (
                                        <>
                                            <input
                                                type="email"
                                                value={newEmail}
                                                onChange={(e) => setNewEmail(e.target.value)}
                                                placeholder="输入新邮箱..."
                                                className="hf-input"
                                            />
                                            <button
                                                onClick={handleSendEmailCode}
                                                disabled={saving || !newEmail || countdown > 0}
                                                className="hf-button w-full justify-center"
                                            >
                                                {saving ? '发送中...' : countdown > 0 ? `${countdown}秒后重试` : '发送验证码'}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-sm text-[var(--hf-text-muted)]">
                                                验证码已发送至 <strong>{newEmail}</strong>
                                            </p>
                                            <input
                                                type="text"
                                                value={emailCode}
                                                onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                placeholder="输入6位验证码..."
                                                className="hf-input text-center text-2xl tracking-[0.5em]"
                                                maxLength={6}
                                            />
                                            <button
                                                onClick={handleVerifyEmail}
                                                disabled={saving || emailCode.length !== 6}
                                                className="hf-button w-full justify-center"
                                            >
                                                {saving ? '验证中...' : '验证并更换'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEmailStep('input')
                                                    setEmailCode('')
                                                }}
                                                className="text-sm text-[var(--hf-text-muted)] hover:underline w-full text-center"
                                            >
                                                ← 返回修改邮箱
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {/* Messages */}
                    {message && (
                        <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg">
                            {message}
                        </div>
                    )}
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
