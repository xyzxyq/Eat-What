'use client'

import { useState, useRef, useEffect } from 'react'
import UserAvatar from '@/components/UserAvatar'

interface UserData {
    id: string
    nickname: string
    displayName?: string | null
    avatarEmoji: string
    avatarUrl?: string | null
    status?: string
}

interface ProfilePopupProps {
    user: UserData
    onClose: () => void
    onUpdate: () => void
}

const AVATAR_EMOJIS = [
    '😊', '😎', '🥰', '😇', '🤗', '😋',
    '👨', '👩', '👦', '👧', '🧑', '🧒',
    '🐱', '🐶', '🐰', '🐻', '🦊', '🐼',
    '🌸', '🌺', '🌻', '🌹', '🌷', '💐',
    '⭐', '🌙', '☀️', '🌈', '💕', '💖'
]

const PRESET_STATUSES = [
    '😊 心情很好',
    '😴 困困的',
    '💪 充满能量',
    '🥰 想你了',
    '😋 饿了',
    '🎮 在玩游戏',
    '📚 在学习',
    '🎵 在听歌',
    '🏃 在运动',
    '😢 有点难过',
]

export default function ProfilePopup({ user, onClose, onUpdate }: ProfilePopupProps) {
    const [activeTab, setActiveTab] = useState<'status' | 'avatar' | 'name'>('status')
    const [status, setStatus] = useState(user.status || '')
    const [customStatus, setCustomStatus] = useState('')
    const [displayName, setDisplayName] = useState(user.displayName || '')
    const [avatarEmoji, setAvatarEmoji] = useState(user.avatarEmoji)
    const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || null)
    const [avatarType, setAvatarType] = useState<'emoji' | 'image'>(user.avatarUrl ? 'image' : 'emoji')
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const popupRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
                onClose()
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [onClose])

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

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
                setAvatarUrl(data.url)
                setAvatarType('image')
            }
        } catch (error) {
            console.error('Upload error:', error)
        } finally {
            setUploading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            // 更新状态
            await fetch('/api/user/status', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            })

            // 更新头像和昵称
            await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    displayName: displayName.trim() || null,
                    avatarEmoji: avatarType === 'emoji' ? avatarEmoji : user.avatarEmoji,
                    avatarUrl: avatarType === 'image' ? avatarUrl : null
                })
            })

            onUpdate()
            onClose()
        } catch (error) {
            console.error('Save error:', error)
        } finally {
            setSaving(false)
        }
    }

    const handleSelectStatus = (newStatus: string) => {
        setStatus(newStatus)
    }

    return (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-start justify-center pt-20">
            <div
                ref={popupRef}
                className="bg-white rounded-2xl shadow-2xl w-[340px] max-h-[70vh] overflow-hidden animate-fade-in-up"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-[var(--hf-yellow-light)] to-white p-4 text-center">
                    <div className="relative inline-block">
                        <UserAvatar
                            avatarUrl={avatarType === 'image' ? avatarUrl : undefined}
                            avatarEmoji={avatarType === 'emoji' ? avatarEmoji : user.avatarEmoji}
                            size="xl"
                        />
                    </div>
                    <p className="font-semibold text-[var(--hf-text)] mt-2">{user.displayName || user.nickname}</p>
                    {status && (
                        <p className="text-sm text-[var(--hf-text-muted)]">{status}</p>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[var(--hf-border)]">
                    {[
                        { id: 'status', label: '状态', icon: '💭' },
                        { id: 'avatar', label: '头像', icon: '🎨' },
                        { id: 'name', label: '昵称', icon: '✏️' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as 'status' | 'avatar' | 'name')}
                            className={`flex-1 py-2 text-sm transition ${activeTab === tab.id
                                ? 'text-[var(--hf-text)] border-b-2 border-[var(--hf-yellow)]'
                                : 'text-[var(--hf-text-muted)]'
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-4 max-h-[40vh] overflow-y-auto">
                    {activeTab === 'status' && (
                        <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {PRESET_STATUSES.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => handleSelectStatus(s)}
                                        className={`px-2 py-1 text-xs rounded-full border transition ${status === s
                                            ? 'bg-[var(--hf-yellow-light)] border-[var(--hf-yellow)]'
                                            : 'bg-[var(--hf-bg-alt)] border-[var(--hf-border)] hover:border-[var(--hf-yellow)]'
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={customStatus}
                                    onChange={e => setCustomStatus(e.target.value)}
                                    placeholder="自定义状态..."
                                    className="hf-input text-sm flex-1"
                                    maxLength={50}
                                />
                                <button
                                    onClick={() => {
                                        if (customStatus.trim()) {
                                            handleSelectStatus(customStatus.trim())
                                            setCustomStatus('')
                                        }
                                    }}
                                    className="hf-button text-xs px-2"
                                >
                                    确定
                                </button>
                            </div>
                            {status && (
                                <button
                                    onClick={() => setStatus('')}
                                    className="text-xs text-[var(--hf-text-muted)] hover:text-red-500"
                                >
                                    ✕ 清除状态
                                </button>
                            )}
                        </div>
                    )}

                    {activeTab === 'avatar' && (
                        <div className="space-y-3">
                            <div className="flex justify-center gap-2 mb-3">
                                <button
                                    onClick={() => setAvatarType('emoji')}
                                    className={`px-3 py-1 rounded-lg text-xs transition ${avatarType === 'emoji'
                                        ? 'bg-[var(--hf-yellow)] text-white'
                                        : 'bg-[var(--hf-bg-alt)] text-[var(--hf-text-muted)]'
                                        }`}
                                >
                                    😊 表情
                                </button>
                                <button
                                    onClick={() => setAvatarType('image')}
                                    className={`px-3 py-1 rounded-lg text-xs transition ${avatarType === 'image'
                                        ? 'bg-[var(--hf-yellow)] text-white'
                                        : 'bg-[var(--hf-bg-alt)] text-[var(--hf-text-muted)]'
                                        }`}
                                >
                                    📷 图片
                                </button>
                            </div>

                            {avatarType === 'emoji' ? (
                                <div className="grid grid-cols-6 gap-1">
                                    {AVATAR_EMOJIS.map(emoji => (
                                        <button
                                            key={emoji}
                                            onClick={() => setAvatarEmoji(emoji)}
                                            className={`p-1 text-xl rounded-lg border transition hover:scale-110 ${avatarEmoji === emoji
                                                ? 'border-[var(--hf-yellow)] bg-[var(--hf-yellow-light)]'
                                                : 'border-transparent'
                                                }`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                    {avatarUrl ? (
                                        <div className="relative inline-block">
                                            <img
                                                src={avatarUrl}
                                                alt="头像"
                                                className="w-20 h-20 rounded-full object-cover border-4 border-[var(--hf-yellow)]"
                                            />
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="absolute bottom-0 right-0 w-6 h-6 bg-[var(--hf-yellow)] text-white rounded-full text-xs"
                                            >
                                                ✏️
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploading}
                                            className="w-20 h-20 mx-auto rounded-full border-2 border-dashed border-[var(--hf-border)] flex flex-col items-center justify-center hover:border-[var(--hf-yellow)] transition"
                                        >
                                            {uploading ? (
                                                <span className="spinner"></span>
                                            ) : (
                                                <>
                                                    <span className="text-xl">📷</span>
                                                    <span className="text-xs text-[var(--hf-text-muted)]">上传</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'name' && (
                        <div className="space-y-3">
                            <p className="text-xs text-[var(--hf-text-muted)]">设置显示昵称（不影响登录爱称）</p>
                            <input
                                type="text"
                                value={displayName}
                                onChange={e => setDisplayName(e.target.value)}
                                placeholder={user.nickname}
                                className="hf-input text-center"
                                maxLength={20}
                            />
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-[var(--hf-border)] flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 border border-[var(--hf-border)] rounded-lg text-[var(--hf-text-muted)] text-sm"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 hf-button justify-center text-sm"
                    >
                        {saving ? '保存中...' : '保存'}
                    </button>
                </div>
            </div>
        </div>
    )
}
