'use client'

import { useState, useEffect } from 'react'

interface InvitePartnerCardProps {
    onClose?: () => void
}

export default function InvitePartnerCard({ onClose }: InvitePartnerCardProps) {
    const [inviteCode, setInviteCode] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)

    // 获取绑定码
    useEffect(() => {
        const fetchInviteCode = async () => {
            try {
                const res = await fetch('/api/space/invite')
                if (res.ok) {
                    const data = await res.json()
                    setInviteCode(data.inviteCode)
                }
            } catch (e) {
                console.error('Failed to fetch invite code:', e)
            } finally {
                setLoading(false)
            }
        }
        fetchInviteCode()
    }, [])

    const handleCopy = async () => {
        if (!inviteCode) return

        try {
            await navigator.clipboard.writeText(inviteCode)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            console.error('Failed to copy')
        }
    }

    return (
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-5 border border-purple-200 shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">💌</span>
                    <span className="font-semibold text-[var(--hf-text)]">邀请 TA 加入</span>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/50 text-[var(--hf-text-muted)] hover:text-[var(--hf-text)] transition"
                    >
                        ✕
                    </button>
                )}
            </div>

            {loading ? (
                <div className="text-center py-8 text-[var(--hf-text-muted)]">
                    加载中...
                </div>
            ) : inviteCode ? (
                <div className="space-y-4">
                    <p className="text-sm text-[var(--hf-text-muted)]">
                        让 TA 使用<strong>相同的口令</strong>和<strong>下方绑定码</strong>登录，即可加入你的专属空间 💕
                    </p>

                    {/* 绑定码显示区域 */}
                    <div className="bg-white rounded-xl p-4 border border-purple-200">
                        <p className="text-xs text-[var(--hf-text-muted)] mb-2 text-center">绑定码</p>
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-3xl font-mono font-bold tracking-[0.3em] text-purple-600">
                                {inviteCode}
                            </span>
                        </div>
                    </div>

                    {/* 复制按钮 */}
                    <button
                        onClick={handleCopy}
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

                    {/* 使用步骤 */}
                    <div className="bg-white/60 rounded-lg p-4 space-y-3">
                        <p className="text-xs font-medium text-[var(--hf-text)]">TA 需要这样做：</p>
                        <div className="flex items-start gap-3">
                            <span className="text-base">1️⃣</span>
                            <p className="text-sm text-[var(--hf-text)]">在登录页输入<strong>相同的口令</strong></p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-base">2️⃣</span>
                            <p className="text-sm text-[var(--hf-text)]">输入自己的爱称</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-base">3️⃣</span>
                            <p className="text-sm text-[var(--hf-text)]">输入上方的<strong>绑定码</strong></p>
                        </div>
                    </div>

                    <div className="text-xs text-[var(--hf-text-muted)] text-center">
                        ⚠️ 请通过私密渠道分享口令和绑定码
                    </div>
                </div>
            ) : (
                <div className="text-center py-4 text-[var(--hf-text-muted)]">
                    <p>暂无绑定码</p>
                    <p className="text-xs mt-2">可能是旧版本空间，请联系开发者</p>
                </div>
            )}
        </div>
    )
}
