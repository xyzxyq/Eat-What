'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import EmailBindingModal from './EmailBindingModal'

export default function LoginForm() {
    const router = useRouter()
    const [passphrase, setPassphrase] = useState('')
    const [nickname, setNickname] = useState('')
    const [inviteCode, setInviteCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [showEmailBinding, setShowEmailBinding] = useState(false)
    const [requireInviteCode, setRequireInviteCode] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    passphrase,
                    nickname,
                    inviteCode: requireInviteCode ? inviteCode : undefined
                })
            })

            const data = await res.json()

            if (!res.ok) {
                // 检查是否需要绑定码
                if (data.requireInviteCode) {
                    setRequireInviteCode(true)
                    setError('此空间已有用户，请输入绑定码加入 🔐')
                } else {
                    setError(data.error)
                }
                setLoading(false)
                return
            }

            setMessage(data.message)

            // 检查是否需要邮箱绑定
            if (data.needEmailBinding) {
                setTimeout(() => {
                    setShowEmailBinding(true)
                    setLoading(false)
                }, 1000)
            } else {
                setTimeout(() => {
                    router.push('/timeline')
                }, 1500)
            }

        } catch {
            setError('网络错误，请稍后重试 🌐')
            setLoading(false)
        }
    }

    const handleEmailBindingSuccess = () => {
        setShowEmailBinding(false)
        router.push('/timeline')
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Passphrase Input */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-[var(--hf-text)]">
                        <span>🔑</span>
                        <span className="mono">Passphrase</span>
                        <span className="text-[var(--hf-text-muted)]">口令</span>
                    </label>
                    <input
                        type="text"
                        value={passphrase}
                        onChange={(e) => {
                            setPassphrase(e.target.value)
                            setRequireInviteCode(false) // 重置绑定码需求
                            setInviteCode('')
                        }}
                        placeholder="输入你们的专属暗号..."
                        className="hf-input"
                        required
                        minLength={4}
                    />
                    <p className="text-xs text-[var(--hf-text-muted)]">
                        💡 这是你们共同的空间密钥，请与你的另一半约定好
                    </p>
                </div>

                {/* Nickname Input */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-[var(--hf-text)]">
                        <span>👤</span>
                        <span className="mono">Nickname</span>
                        <span className="text-[var(--hf-text-muted)]">爱称</span>
                    </label>
                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="你的专属称呼..."
                        className="hf-input"
                        required
                        maxLength={20}
                    />
                    <p className="text-xs text-[var(--hf-text-muted)]">
                        💕 用于区分你和另一半，每个空间最多2人
                    </p>
                </div>

                {/* Invite Code Input - 仅当需要时显示 */}
                {requireInviteCode && (
                    <div className="space-y-2 animate-fade-in-up">
                        <label className="flex items-center gap-2 text-sm font-medium text-[var(--hf-text)]">
                            <span>🔐</span>
                            <span className="mono">Invite Code</span>
                            <span className="text-[var(--hf-text-muted)]">绑定码</span>
                        </label>
                        <input
                            type="text"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="输入6位绑定码..."
                            className="hf-input text-center text-xl tracking-widest"
                            maxLength={6}
                            required
                            autoFocus
                        />
                        <p className="text-xs text-[var(--hf-text-muted)]">
                            🔗 请向你的另一半索要绑定码
                        </p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm animate-fade-in-up">
                        {error}
                    </div>
                )}

                {/* Success Message */}
                {message && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm animate-fade-in-up">
                        {message}
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading || !passphrase || !nickname || (requireInviteCode && inviteCode.length !== 6)}
                    className="hf-button w-full justify-center text-lg"
                >
                    {loading ? (
                        <>
                            <span className="spinner"></span>
                            <span>Deploying...</span>
                        </>
                    ) : (
                        <>
                            <span>🚀</span>
                            <span>{requireInviteCode ? 'Join Space' : 'Deploy to Heart'}</span>
                        </>
                    )}
                </button>

                {/* Footer Hint */}
                <p className="text-center text-xs text-[var(--hf-text-muted)]">
                    {requireInviteCode
                        ? '输入绑定码以加入另一半的空间'
                        : '首次使用相同口令将创建新空间'
                    }
                </p>
            </form>

            {/* Email Binding Modal */}
            <EmailBindingModal
                isOpen={showEmailBinding}
                onSuccess={handleEmailBindingSuccess}
            />
        </>
    )
}
