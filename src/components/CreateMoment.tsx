'use client'

import { useState, useRef } from 'react'

interface CreateMomentProps {
    onSuccess: () => void
    disabled: boolean
}

export default function CreateMoment({ onSuccess, disabled }: CreateMomentProps) {
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [uploadedMedia, setUploadedMedia] = useState<{ url: string; type: string } | null>(null)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        setError('')

        try {
            const formData = new FormData()
            formData.append('file', file)

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error)
                return
            }

            setUploadedMedia({ url: data.url, type: data.mediaType })
        } catch {
            setError('上传失败，请重试 📤')
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return

        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/moments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: content.trim(),
                    mediaUrl: uploadedMedia?.url || null,
                    mediaType: uploadedMedia?.type || 'none'
                })
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error)
                return
            }

            setContent('')
            setUploadedMedia(null)
            onSuccess()
        } catch {
            setError('发布失败，请重试 😢')
        } finally {
            setLoading(false)
        }
    }

    const removeMedia = () => {
        setUploadedMedia(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    if (disabled) {
        return (
            <div className="hf-card bg-[var(--hf-bg-alt)] text-center min-h-[280px] flex flex-col items-center justify-center">
                <div className="text-4xl mb-3">✅</div>
                <p className="font-semibold text-[var(--hf-text)]">今日已提交</p>
                <p className="text-sm text-[var(--hf-text-muted)] mt-1">
                    明天再来记录新的美好时刻吧！
                </p>
            </div>
        )
    }

    return (
        <div className="hf-card">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[var(--hf-border)]">
                <span className="text-xl">✍️</span>
                <h3 className="font-semibold text-[var(--hf-text)] mono">New Commit</h3>
                <span className="text-[var(--hf-text-muted)] text-sm">记录今日心情</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Content Input */}
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="今天想记录什么呢...✨"
                    className="hf-input min-h-32 resize-none"
                    required
                />

                {/* Uploaded Media Preview */}
                {uploadedMedia && (
                    <div className="relative rounded-lg overflow-hidden border border-[var(--hf-border)]">
                        {uploadedMedia.type === 'video' ? (
                            <video src={uploadedMedia.url} controls className="w-full max-h-48 object-contain" />
                        ) : (
                            <img src={uploadedMedia.url} alt="preview" className="w-full max-h-48 object-contain" />
                        )}
                        <button
                            type="button"
                            onClick={removeMedia}
                            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {error}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between flex-wrap gap-3 sm:flex-nowrap">
                    <div className="flex items-center gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="media-upload"
                        />
                        <label
                            htmlFor="media-upload"
                            className="flex items-center gap-2 px-4 py-2 border border-[var(--hf-border)] rounded-lg cursor-pointer hover:border-[var(--hf-yellow)] hover:bg-[var(--hf-bg-alt)] transition text-sm"
                        >
                            {uploading ? (
                                <>
                                    <span className="spinner"></span>
                                    <span>上传中...</span>
                                </>
                            ) : (
                                <>
                                    <span>📷</span>
                                    <span className="hidden sm:inline">添加图片/视频</span>
                                    <span className="sm:hidden">添加</span>
                                </>
                            )}
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !content.trim()}
                        className="hf-button"
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                <span>Pushing...</span>
                            </>
                        ) : (
                            <>
                                <span>⬆️</span>
                                <span>Push Commit</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
