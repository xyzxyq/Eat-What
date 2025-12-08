'use client'

import { useState, useEffect } from 'react'

interface EmailBindingModalProps {
    isOpen: boolean
    onSuccess: () => void
}

export default function EmailBindingModal({ isOpen, onSuccess }: EmailBindingModalProps) {
    const [email, setEmail] = useState('')
    const [code, setCode] = useState('')
    const [step, setStep] = useState<'email' | 'verify'>('email')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [countdown, setCountdown] = useState(0)

    // 倒计时效果
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown])

    // 发送验证码
    const handleSendCode = async () => {
        if (!email) {
            setError('请输入邮箱地址 📧')
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            setError('请输入有效的邮箱地址 📧')
            return
        }

        setLoading(true)
        setError('')
        setMessage('')

        try {
            const res = await fetch('/api/auth/email-verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error)
                setLoading(false)
                return
            }

            setMessage(data.message)
            setStep('verify')
            setCountdown(60) // 60秒后可重发
        } catch {
            setError('网络错误，请稍后重试 🌐')
        } finally {
            setLoading(false)
        }
    }

    // 验证并绑定
    const handleVerify = async () => {
        if (!code || code.length !== 6) {
            setError('请输入6位验证码 🔢')
            return
        }

        setLoading(true)
        setError('')
        setMessage('')

        try {
            const res = await fetch('/api/auth/email-verify/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code })
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error)
                setLoading(false)
                return
            }

            setMessage(data.message)

            // 短暂显示成功消息后回调
            setTimeout(() => {
                onSuccess()
            }, 1500)
        } catch {
            setError('网络错误，请稍后重试 🌐')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
                {/* Header */}
                <div className="bg-gradient-to-r from-[var(--hf-yellow)] to-[#FFE066] p-6 text-center">
                    <div className="text-5xl mb-2">📧</div>
                    <h2 className="text-xl font-bold text-[var(--hf-text)]">绑定邮箱</h2>
                    <p className="text-sm text-[var(--hf-text-muted)] mt-1">
                        用于账户验证和接收伴侣动态通知
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {step === 'email' ? (
                        <>
                            {/* Email Input */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-[var(--hf-text)]">
                                    <span>📮</span>
                                    <span className="mono">Email</span>
                                    <span className="text-[var(--hf-text-muted)]">邮箱地址</span>
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="请输入你的邮箱..."
                                    className="hf-input"
                                    disabled={loading}
                                />
                                <p className="text-xs text-[var(--hf-text-muted)]">
                                    💡 验证码将发送到此邮箱
                                </p>
                                <p className="text-xs text-[var(--hf-text-muted)] mt-1">
                                    💕 当伴侣发布日记、评论或更新心愿时，你将收到邮件通知
                                </p>
                                <p className="text-xs text-[var(--hf-text-muted)] mt-1">
                                    🇨🇳 中国（含台湾）用户推荐使用 QQ 邮箱
                                </p>
                            </div>

                            {/* Send Button */}
                            <button
                                onClick={handleSendCode}
                                disabled={loading || !email}
                                className="hf-button w-full justify-center text-lg"
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner"></span>
                                        <span>发送中...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>📨</span>
                                        <span>发送验证码</span>
                                    </>
                                )}
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Email Display */}
                            <div className="bg-[var(--hf-bg)] rounded-lg p-4 flex items-center gap-3">
                                <span className="text-2xl">📧</span>
                                <div>
                                    <p className="text-sm text-[var(--hf-text-muted)]">验证码已发送至</p>
                                    <p className="font-medium text-[var(--hf-text)] mono">{email}</p>
                                </div>
                            </div>

                            {/* Code Input */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-[var(--hf-text)]">
                                    <span>🔢</span>
                                    <span className="mono">Code</span>
                                    <span className="text-[var(--hf-text-muted)]">验证码</span>
                                </label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="请输入6位验证码..."
                                    className="hf-input text-center text-2xl tracking-[0.5em] font-mono"
                                    maxLength={6}
                                    disabled={loading}
                                />
                                <p className="text-xs text-[var(--hf-text-muted)]">
                                    ⏰ 验证码10分钟内有效
                                </p>
                            </div>

                            {/* Verify Button */}
                            <button
                                onClick={handleVerify}
                                disabled={loading || code.length !== 6}
                                className="hf-button w-full justify-center text-lg"
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner"></span>
                                        <span>验证中...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>✅</span>
                                        <span>验证并绑定</span>
                                    </>
                                )}
                            </button>

                            {/* Resend */}
                            <div className="text-center">
                                {countdown > 0 ? (
                                    <p className="text-sm text-[var(--hf-text-muted)]">
                                        {countdown}秒后可重新发送
                                    </p>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setStep('email')
                                            setCode('')
                                            setError('')
                                            setMessage('')
                                        }}
                                        className="text-sm text-[var(--hf-yellow)] hover:underline"
                                    >
                                        ← 更换邮箱或重新发送
                                    </button>
                                )}
                            </div>
                        </>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm animate-fade-in-up">
                            {error}
                        </div>
                    )}

                    {/* Success Message */}
                    {message && !error && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm animate-fade-in-up">
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
