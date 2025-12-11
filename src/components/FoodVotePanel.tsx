'use client'

import { useState, useEffect, useCallback } from 'react'
import { FOOD_CATEGORIES, PRESET_FOODS, type PresetFood } from '@/lib/food-categories'

interface VoteSession {
    id: string
    status: 'waiting' | 'complete' | 'expired'
    userAId?: string
    userBId?: string
    userAChoice: string[]
    userBChoice: string[]
    matchedResult: string[]
    finalChoice?: string
    expiresAt: string
}

interface FoodVotePanelProps {
    isOpen: boolean
    onClose: () => void
    onResult?: (food: PresetFood | null) => void
}

export default function FoodVotePanel({ isOpen, onClose, onResult }: FoodVotePanelProps) {
    const [session, setSession] = useState<VoteSession | null>(null)
    const [isUserA, setIsUserA] = useState(false)
    const [selectedFoods, setSelectedFoods] = useState<string[]>([])
    const [fetchingSession, setFetchingSession] = useState(false)  // 用于获取会话
    const [submitting, setSubmitting] = useState(false)  // 用于提交投票
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState('')
    const [step, setStep] = useState<'select' | 'waiting' | 'result'>('select')

    // 重置状态
    const resetState = () => {
        setSession(null)
        setIsUserA(false)
        setSelectedFoods([])
        setSubmitted(false)
        setError('')
        setStep('select')
    }

    // 获取或创建投票会话
    const fetchOrCreateSession = useCallback(async () => {
        try {
            setFetchingSession(true)
            setError('')
            // 先尝试获取现有会话
            let res = await fetch('/api/food/vote')
            let data = await res.json()

            if (!data.session) {
                // 创建新会话
                res = await fetch('/api/food/vote', { method: 'POST' })
                data = await res.json()
            }

            if (data.session) {
                setSession(data.session)
                setIsUserA(data.isUserA ?? data.session.userAId === undefined)

                // 检查是否已经投票
                if (data.isUserA && data.session.userAChoice.length > 0) {
                    setSubmitted(true)
                    setSelectedFoods(data.session.userAChoice)
                    setStep('waiting')
                } else if (!data.isUserA && data.session.userBChoice.length > 0) {
                    setSubmitted(true)
                    setSelectedFoods(data.session.userBChoice)
                    setStep('waiting')
                }

                // 检查是否已完成
                if (data.session.status === 'complete') {
                    setStep('result')
                }
            }
        } catch (err) {
            setError('无法创建投票会话，请稍后重试')
            console.error(err)
        } finally {
            setFetchingSession(false)
        }
    }, [])

    // 轮询检查会话状态
    useEffect(() => {
        if (!isOpen) return

        fetchOrCreateSession()

        // 每5秒轮询一次
        const interval = setInterval(async () => {
            if (step === 'waiting' && session) {
                try {
                    const res = await fetch('/api/food/vote')
                    const data = await res.json()
                    if (data.session) {
                        setSession(data.session)
                        if (data.session.status === 'complete') {
                            setStep('result')
                        }
                    }
                } catch (err) {
                    console.error('Polling error:', err)
                }
            }
        }, 5000)

        return () => clearInterval(interval)
    }, [isOpen, session, step, fetchOrCreateSession])

    // 切换食物选择
    const toggleFood = (foodName: string) => {
        if (submitted) return
        setSelectedFoods(prev =>
            prev.includes(foodName)
                ? prev.filter(f => f !== foodName)
                : [...prev, foodName]
        )
    }

    // 提交投票
    const handleSubmit = async () => {
        if (selectedFoods.length === 0 || !session) {
            setError('请至少选择一个食物')
            return
        }

        try {
            setSubmitting(true)
            const res = await fetch('/api/food/vote', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: session.id,
                    choices: selectedFoods,
                }),
            })

            const data = await res.json()
            if (data.success) {
                setSession(data.session)
                setSubmitted(true)
                if (data.isComplete) {
                    setStep('result')
                } else {
                    setStep('waiting')
                }
            }
        } catch (err) {
            setError('Failed to submit vote')
            console.error(err)
        } finally {
            setSubmitting(false)
        }
    }

    // 获取匹配的食物信息
    const getMatchedFood = (): PresetFood | null => {
        if (!session?.finalChoice) return null
        return PRESET_FOODS.find(f => f.name === session.finalChoice) || {
            name: session.finalChoice,
            emoji: '🍽️',
            category: 'other',
            tags: [],
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-xl">
                {/* Header */}
                <div className="border-b border-gray-100 p-4 flex items-center justify-between bg-gradient-to-r from-pink-50 to-purple-50">
                    <h2 className="text-lg font-bold text-[var(--hf-text)] flex items-center gap-2">
                        <span className="text-2xl">💕</span> 双人投票
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/50 rounded-full transition"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto max-h-[60vh]">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Step 1: 选择食物 */}
                    {step === 'select' && (
                        <>
                            <p className="text-sm text-[var(--hf-text-muted)] mb-4">
                                🤫 悄悄选择你想吃的食物，选好后等待 TA 也选择，系统会找出你们的共同选择！
                            </p>

                            <p className="text-xs text-[var(--hf-text-muted)] mb-2">
                                按分类选择 ({selectedFoods.length} 项已选)
                            </p>

                            {FOOD_CATEGORIES.slice(0, 8).map(category => {
                                const categoryFoods = PRESET_FOODS.filter(f => f.category === category.id).slice(0, 6)
                                return (
                                    <div key={category.id} className="mb-4">
                                        <p className="text-sm font-medium text-[var(--hf-text)] mb-2">
                                            {category.emoji} {category.name}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {categoryFoods.map(food => (
                                                <button
                                                    key={food.name}
                                                    onClick={() => toggleFood(food.name)}
                                                    className={`px-3 py-1.5 rounded-full text-sm transition ${selectedFoods.includes(food.name)
                                                        ? 'bg-[var(--hf-yellow)] text-[var(--hf-text)]'
                                                        : 'bg-gray-100 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {food.emoji} {food.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </>
                    )}

                    {/* Step 2: 等待对方 */}
                    {step === 'waiting' && (
                        <div className="text-center py-8">
                            <div className="animate-pulse">
                                <span className="text-6xl">💕</span>
                            </div>
                            <p className="mt-4 text-lg font-medium text-[var(--hf-text)]">
                                等待 TA 选择...
                            </p>
                            <p className="mt-2 text-sm text-[var(--hf-text-muted)]">
                                你已选择 {selectedFoods.length} 项，TA 正在选择中
                            </p>
                            <div className="mt-4 flex justify-center">
                                <div className="spinner"></div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: 结果 */}
                    {step === 'result' && (
                        <div className="text-center py-8">
                            {session?.matchedResult && session.matchedResult.length > 0 ? (
                                <>
                                    <span className="text-6xl animate-bounce block">🎉</span>
                                    <p className="mt-4 text-lg font-bold text-[var(--hf-text)]">
                                        太棒了！你们都想吃...
                                    </p>

                                    <div className="mt-6 p-6 bg-gradient-to-br from-[var(--hf-yellow-light)] to-pink-50 rounded-2xl">
                                        <span className="text-5xl">{getMatchedFood()?.emoji}</span>
                                        <p className="mt-2 text-2xl font-bold text-[var(--hf-text)]">
                                            {session.finalChoice}
                                        </p>
                                    </div>

                                    {session.matchedResult.length > 1 && (
                                        <p className="mt-4 text-sm text-[var(--hf-text-muted)]">
                                            你们还都想吃: {session.matchedResult.filter(f => f !== session.finalChoice).join(', ')}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <>
                                    <span className="text-6xl">😢</span>
                                    <p className="mt-4 text-lg font-medium text-[var(--hf-text)]">
                                        没有找到共同选择...
                                    </p>
                                    <p className="mt-2 text-sm text-[var(--hf-text-muted)]">
                                        你们的口味还真是不一样呢，要不再试一次？
                                    </p>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 p-4 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-[var(--hf-text-muted)] hover:bg-gray-50 transition"
                    >
                        {step === 'result' ? '关闭' : '取消'}
                    </button>

                    {step === 'select' && (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || selectedFoods.length === 0}
                            className={`flex-1 px-4 py-3 rounded-xl font-medium transition ${selectedFoods.length > 0 && !submitting
                                ? 'bg-[var(--hf-yellow)] text-[var(--hf-text)] hover:opacity-90'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {submitting ? '提交中...' : `确认选择 (${selectedFoods.length})`}
                        </button>
                    )}

                    {step === 'result' && session?.matchedResult && session.matchedResult.length > 0 && (
                        <button
                            onClick={() => {
                                onResult?.(getMatchedFood())
                                onClose()
                            }}
                            className="flex-1 px-4 py-3 bg-[var(--hf-yellow)] rounded-xl text-[var(--hf-text)] font-medium hover:opacity-90 transition"
                        >
                            就这个了！
                        </button>
                    )}
                </div>
            </div>

            <style jsx>{`
        .spinner {
          width: 24px;
          height: 24px;
          border: 3px solid #f0f0f0;
          border-top-color: var(--hf-yellow);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    )
}
