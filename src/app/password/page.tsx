'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface TempAuthData {
    tempToken: string
    hasPassword: boolean
    user: {
        nickname: string
        avatarEmoji: string
        avatarUrl?: string | null
    }
    isNewSpace?: boolean
    inviteCode?: string | null
}

export default function PasswordPage() {
    const router = useRouter()
    const [authData, setAuthData] = useState<TempAuthData | null>(null)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        // 从 sessionStorage 获取临时认证数据
        const stored = sessionStorage.getItem('temp-auth')
        if (!stored) {
            router.push('/')
            return
        }
        try {
            const data = JSON.parse(stored) as TempAuthData
            setAuthData(data)
        } catch {
            router.push('/')
        }
    }, [router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!authData) return

        setLoading(true)
        setError('')

        // 如果是设置密码模式，验证两次密码一致
        if (!authData.hasPassword) {
            if (password !== confirmPassword) {
                setError('两次输入的密码不一致 😅')
                setLoading(false)
                return
            }
            if (password.length < 6) {
                setError('密码长度至少6位 🔐')
                setLoading(false)
                return
            }
        }

        try {
            const res = await fetch('/api/auth/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tempToken: authData.tempToken,
                    password,
                    isSetup: !authData.hasPassword
                })
            })

            const data = await res.json()

            if (!res.ok) {
                if (data.expired) {
                    sessionStorage.removeItem('temp-auth')
                    setError('会话已过期，请重新登录 ⏰')
                    setTimeout(() => router.push('/'), 2000)
                    return
                }
                setError(data.error || '验证失败')
                setLoading(false)
                return
            }

            // 成功后清除临时数据并跳转
            sessionStorage.removeItem('temp-auth')
            router.push('/timeline')

        } catch {
            setError('网络错误，请稍后重试 🌐')
            setLoading(false)
        }
    }

    if (!authData) {
        return (
            <div className="min-h-screen bg-[var(--hf-bg)] flex items-center justify-center">
                <div className="text-center">
                    <div className="spinner mx-auto mb-4" style={{ width: 48, height: 48 }}></div>
                    <p className="text-[var(--hf-text-muted)]">加载中...</p>
                </div>
            </div>
        )
    }

    const isSetupMode = !authData.hasPassword

    return (
        <div className="min-h-screen bg-[var(--hf-bg)] flex flex-col">
            {/* Header */}
            <header className="border-b border-[var(--hf-border)] bg-white">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/eat_what_logo.png" alt="Eat What" className="w-10 h-10 rounded-lg" />
                        <div>
                            <h1 className="text-xl font-bold text-[var(--hf-text)] logo-font">
                                Eat_What
                            </h1>
                            <p className="text-xs text-[var(--hf-text-muted)]">
                                {isSetupMode ? '🔐 设置密码' : '🔑 验证密码'}
                            </p>
                        </div>
                    </div>
                    <div className="hf-badge">
                        <span>💕</span>
                        <span className="mono text-xs">secure</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md animate-fade-in-up">
                    {/* User Card */}
                    <div className="hf-card mb-6 text-center">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--hf-yellow-light)] flex items-center justify-center text-4xl overflow-hidden">
                            {authData.user.avatarUrl ? (
                                <img src={authData.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                authData.user.avatarEmoji
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-[var(--hf-text)] mb-1">
                            {authData.user.nickname}
                        </h2>
                        <p className="text-sm text-[var(--hf-text-muted)]">
                            {isSetupMode ? '请设置您的登录密码' : '请输入您的登录密码'}
                        </p>
                    </div>

                    {/* Invite Code Card - Only for new space creators */}
                    {authData.isNewSpace && authData.inviteCode && (
                        <div className="hf-card mb-6 bg-gradient-to-br from-pink-50 to-purple-50 border-purple-200">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-xl">💌</span>
                                <span className="font-semibold text-[var(--hf-text)]">邀请 TA 加入</span>
                            </div>
                            <p className="text-sm text-[var(--hf-text-muted)] mb-4">
                                请将下方<strong>绑定码</strong>和<strong>口令</strong>分享给你的另一半，TA 可以用来加入你们的专属空间 💕
                            </p>

                            {/* 绑定码显示 */}
                            <div className="bg-white rounded-xl p-4 border border-purple-200 mb-4">
                                <p className="text-xs text-[var(--hf-text-muted)] mb-2 text-center">绑定码</p>
                                <div className="text-center">
                                    <span className="text-3xl font-mono font-bold tracking-[0.3em] text-purple-600">
                                        {authData.inviteCode}
                                    </span>
                                </div>
                            </div>

                            {/* 复制按钮 */}
                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        await navigator.clipboard.writeText(authData.inviteCode!)
                                        setCopied(true)
                                        setTimeout(() => setCopied(false), 2000)
                                    } catch {
                                        console.error('Failed to copy')
                                    }
                                }}
                                className={`w-full py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 ${copied
                                        ? 'bg-green-100 text-green-600'
                                        : 'bg-purple-500 text-white hover:bg-purple-600'
                                    }`}
                            >
                                {copied ? (
                                    <>
                                        <span>✓</span>
                                        <span>已复制到剪贴板</span>
                                    </>
                                ) : (
                                    <>
                                        <span>📋</span>
                                        <span>复制绑定码</span>
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-[var(--hf-text-muted)] text-center mt-3">
                                ⚠️ 请通过私密渠道分享口令和绑定码
                            </p>
                        </div>
                    )}

                    {/* Password Form */}
                    <div className="hf-card">
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[var(--hf-border)]">
                            <span className="text-xl">{isSetupMode ? '🔐' : '🔑'}</span>
                            <h3 className="font-semibold text-[var(--hf-text)] mono">
                                {isSetupMode ? 'Set Password' : 'Enter Password'}
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Password Input */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-[var(--hf-text)]">
                                    <span>🔒</span>
                                    <span className="mono">Password</span>
                                    <span className="text-[var(--hf-text-muted)]">密码</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={isSetupMode ? '设置登录密码（至少6位）...' : '输入您的登录密码...'}
                                        className="hf-input pr-12"
                                        required
                                        minLength={6}
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--hf-text-muted)] hover:text-[var(--hf-text)] transition"
                                    >
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password (Setup Mode Only) */}
                            {isSetupMode && (
                                <div className="space-y-2 animate-fade-in-up">
                                    <label className="flex items-center gap-2 text-sm font-medium text-[var(--hf-text)]">
                                        <span>🔒</span>
                                        <span className="mono">Confirm</span>
                                        <span className="text-[var(--hf-text-muted)]">确认密码</span>
                                    </label>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="再次输入密码..."
                                        className="hf-input"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm animate-fade-in-up">
                                    {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || !password || (isSetupMode && !confirmPassword)}
                                className="hf-button w-full justify-center text-lg"
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner"></span>
                                        <span>验证中...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>🚀</span>
                                        <span>{isSetupMode ? 'Set & Enter' : 'Enter Space'}</span>
                                    </>
                                )}
                            </button>

                            {/* Footer Hint */}
                            <div className="text-center space-y-2">
                                <p className="text-xs text-[var(--hf-text-muted)]">
                                    {isSetupMode
                                        ? '密码将用于保护您的账户安全'
                                        : '忘记密码？请联系另一半帮助找回'
                                    }
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        sessionStorage.removeItem('temp-auth')
                                        router.push('/')
                                    }}
                                    className="text-xs text-[var(--hf-text-muted)] hover:text-[var(--hf-yellow-dark)] transition"
                                >
                                    ← 返回登录
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-[var(--hf-border)] py-4 text-center">
                <p className="text-xs text-[var(--hf-text-muted)] mono">
                    © {new Date().getFullYear()} Eat_What. Made with 💛 for couples.
                </p>
            </footer>
        </div>
    )
}
