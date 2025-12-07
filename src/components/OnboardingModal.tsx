'use client'

import { useState, useRef } from 'react'
import confetti from 'canvas-confetti'

interface OnboardingModalProps {
    onComplete: () => void
}

const AVATAR_EMOJIS = [
    '😊', '😎', '🥰', '😇', '🤗', '😋',
    '👨', '👩', '👦', '👧', '🧑', '🧒',
    '🐱', '🐶', '🐰', '🐻', '🦊', '🐼',
    '🌸', '🌺', '🌻', '🌹', '🌷', '💐',
    '⭐', '🌙', '☀️', '🌈', '💕', '💖'
]

const GENDER_OPTIONS = [
    { id: 'male', emoji: '👨', label: '男生' },
    { id: 'female', emoji: '👩', label: '女生' },
    { id: 'other', emoji: '🧑', label: '其他' }
]

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
    const [step, setStep] = useState(1)
    const [gender, setGender] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [selectedEmoji, setSelectedEmoji] = useState('💕')
    const [avatarImage, setAvatarImage] = useState<string | null>(null)
    const [avatarType, setAvatarType] = useState<'emoji' | 'image'>('emoji')
    const [uploading, setUploading] = useState(false)
    const [loading, setLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleNext = () => {
        if (step < 3) {
            setStep(step + 1)
        }
    }

    const handlePrev = () => {
        if (step > 1) {
            setStep(step - 1)
        }
    }

    const celebrateConfetti = () => {
        const duration = 3000
        const end = Date.now() + duration

        const colors = ['#ff69b4', '#ff1493', '#ffb6c1', '#ffc0cb', '#ff6b6b', '#ffd700', '#87ceeb', '#98fb98', '#dda0dd']

        const frame = () => {
            confetti({
                particleCount: 7,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors
            })
            confetti({
                particleCount: 7,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors
            })

            if (Date.now() < end) {
                requestAnimationFrame(frame)
            }
        }

        frame()

        // 额外的中心爆发
        setTimeout(() => {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: colors
            })
        }, 500)

        setTimeout(() => {
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.5 },
                colors: colors,
                scalar: 1.2
            })
        }, 1000)
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // 检查文件大小 (最大 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('图片大小不能超过 2MB')
            return
        }

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            if (res.ok) {
                const data = await res.json()
                setAvatarImage(data.url)
                setAvatarType('image')
            } else {
                alert('上传失败，请重试')
            }
        } catch (error) {
            console.error('Upload error:', error)
            alert('上传失败，请重试')
        } finally {
            setUploading(false)
        }
    }

    const handleComplete = async () => {
        if (!gender || !displayName.trim()) return

        setLoading(true)
        try {
            await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gender,
                    displayName: displayName.trim(),
                    avatarEmoji: avatarType === 'emoji' ? selectedEmoji : null,
                    avatarUrl: avatarType === 'image' ? avatarImage : null,
                    isProfileComplete: true
                })
            })

            celebrateConfetti()

            setTimeout(() => {
                onComplete()
            }, 2000)
        } catch (error) {
            console.error('Failed to save profile:', error)
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-[var(--hf-yellow-light)] to-white p-6 text-center">
                    <div className="flex justify-center items-center gap-3 mb-2">
                        <img src="/eat_what_logo.png" alt="Eat What" className="w-12 h-12 rounded-xl shadow-md" />
                        <span className="text-4xl">
                            {step === 1 ? '👋' : step === 2 ? '✨' : '🎨'}
                        </span>
                    </div>
                    <h2 className="text-xl font-bold text-[var(--hf-text)]">
                        {step === 1 ? '欢迎加入！' : step === 2 ? '告诉我们你的名字' : '选择你的头像'}
                    </h2>
                    <p className="text-sm text-[var(--hf-text-muted)] mt-1">
                        {step === 1 ? '让我们先认识一下你' : step === 2 ? '这将显示在你的日记中' : '挑一个代表你的表情'}
                    </p>
                </div>

                {/* Progress */}
                <div className="flex px-6 py-3 gap-2">
                    {[1, 2, 3].map(i => (
                        <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition ${i <= step ? 'bg-[var(--hf-yellow)]' : 'bg-[var(--hf-border)]'
                                }`}
                        />
                    ))}
                </div>

                {/* Content */}
                <div className="p-6">
                    {step === 1 && (
                        <div className="space-y-4">
                            <p className="text-center text-[var(--hf-text-muted)] mb-4">你的性别是？</p>
                            <div className="grid grid-cols-3 gap-3">
                                {GENDER_OPTIONS.map(option => (
                                    <button
                                        key={option.id}
                                        onClick={() => setGender(option.id)}
                                        className={`p-4 rounded-xl border-2 transition ${gender === option.id
                                            ? 'border-[var(--hf-yellow)] bg-[var(--hf-yellow-light)]'
                                            : 'border-[var(--hf-border)] hover:border-[var(--hf-yellow)]'
                                            }`}
                                    >
                                        <div className="text-3xl mb-2">{option.emoji}</div>
                                        <div className="text-sm font-medium text-[var(--hf-text)]">{option.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <p className="text-center text-[var(--hf-text-muted)] mb-4">你的昵称是？</p>
                            <input
                                type="text"
                                value={displayName}
                                onChange={e => setDisplayName(e.target.value)}
                                placeholder="输入你的昵称..."
                                className="hf-input text-center text-lg"
                                maxLength={20}
                                autoFocus
                            />
                            <p className="text-xs text-center text-[var(--hf-text-muted)]">
                                这将显示在你的日记和评论中
                            </p>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            {/* Tab Switch */}
                            <div className="flex justify-center gap-2 mb-4">
                                <button
                                    onClick={() => setAvatarType('emoji')}
                                    className={`px-4 py-2 rounded-lg text-sm transition ${avatarType === 'emoji'
                                        ? 'bg-[var(--hf-yellow)] text-white'
                                        : 'bg-[var(--hf-bg-alt)] text-[var(--hf-text-muted)]'
                                        }`}
                                >
                                    😊 表情头像
                                </button>
                                <button
                                    onClick={() => setAvatarType('image')}
                                    className={`px-4 py-2 rounded-lg text-sm transition ${avatarType === 'image'
                                        ? 'bg-[var(--hf-yellow)] text-white'
                                        : 'bg-[var(--hf-bg-alt)] text-[var(--hf-text-muted)]'
                                        }`}
                                >
                                    📷 上传图片
                                </button>
                            </div>

                            {avatarType === 'emoji' ? (
                                <>
                                    <div className="grid grid-cols-6 gap-2">
                                        {AVATAR_EMOJIS.map(emoji => (
                                            <button
                                                key={emoji}
                                                onClick={() => setSelectedEmoji(emoji)}
                                                className={`p-2 text-2xl rounded-lg border-2 transition hover:scale-110 ${selectedEmoji === emoji
                                                    ? 'border-[var(--hf-yellow)] bg-[var(--hf-yellow-light)]'
                                                    : 'border-transparent hover:border-[var(--hf-border)]'
                                                    }`}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="text-center mt-4">
                                        <span className="text-5xl">{selectedEmoji}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center space-y-4">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />

                                    {avatarImage ? (
                                        <div className="relative inline-block">
                                            <img
                                                src={avatarImage}
                                                alt="头像预览"
                                                className="w-24 h-24 rounded-full object-cover border-4 border-[var(--hf-yellow)] shadow-lg"
                                            />
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="absolute bottom-0 right-0 w-8 h-8 bg-[var(--hf-yellow)] text-white rounded-full flex items-center justify-center text-sm hover:scale-110 transition"
                                            >
                                                ✏️
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploading}
                                            className="w-24 h-24 mx-auto rounded-full border-2 border-dashed border-[var(--hf-border)] flex flex-col items-center justify-center hover:border-[var(--hf-yellow)] hover:bg-[var(--hf-yellow-light)] transition cursor-pointer"
                                        >
                                            {uploading ? (
                                                <span className="spinner"></span>
                                            ) : (
                                                <>
                                                    <span className="text-2xl">📷</span>
                                                    <span className="text-xs text-[var(--hf-text-muted)] mt-1">点击上传</span>
                                                </>
                                            )}
                                        </button>
                                    )}

                                    <p className="text-xs text-[var(--hf-text-muted)]">
                                        支持 JPG、PNG 格式，最大 2MB
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="p-6 pt-0 flex gap-3">
                    {step > 1 && (
                        <button
                            onClick={handlePrev}
                            className="flex-1 py-3 border border-[var(--hf-border)] rounded-lg text-[var(--hf-text-muted)] hover:bg-[var(--hf-bg-alt)] transition"
                        >
                            上一步
                        </button>
                    )}

                    {step < 3 ? (
                        <button
                            onClick={handleNext}
                            disabled={step === 1 && !gender}
                            className="flex-1 hf-button justify-center"
                        >
                            下一步
                        </button>
                    ) : (
                        <button
                            onClick={handleComplete}
                            disabled={loading || !displayName.trim()}
                            className="flex-1 hf-button justify-center"
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    <span>保存中...</span>
                                </>
                            ) : (
                                <>
                                    <span>🎉</span>
                                    <span>完成设置</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
