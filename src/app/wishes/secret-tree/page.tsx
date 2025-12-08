'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'

interface SecretWish {
    id: string
    content: string
    emoji: string
    isRevealed: boolean
    isHidden?: boolean
    createdById: string
    createdBy: {
        id: string
        nickname: string
        displayName: string
        avatarEmoji: string
    }
}

interface RevealRequest {
    id: string
    status: string
    secretWishId?: string
    createdAt: string
    requester: {
        id: string
        nickname: string
        displayName: string
        avatarEmoji: string
    }
    secretWish?: {
        id: string
        emoji: string
    }
}

export default function SecretTreePage() {
    const [wishes, setWishes] = useState<SecretWish[]>([])
    const [currentUserId, setCurrentUserId] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [selectedWish, setSelectedWish] = useState<SecretWish | null>(null)
    const [hasRequestedToday, setHasRequestedToday] = useState(false)
    const [isRequesting, setIsRequesting] = useState(false)
    const [newWishContent, setNewWishContent] = useState('')
    const [newWishEmoji, setNewWishEmoji] = useState('🎁')
    const [receivedRequests, setReceivedRequests] = useState<RevealRequest[]>([])
    const [requestToRespond, setRequestToRespond] = useState<RevealRequest | null>(null)

    const { treeWishes, fallenStars } = useMemo(() => {
        const tree: SecretWish[] = []
        const fallen: SecretWish[] = []
        wishes.forEach(wish => {
            if (wish.isRevealed && wish.createdById !== currentUserId) {
                fallen.push(wish)
            } else {
                tree.push(wish)
            }
        })
        return { treeWishes: tree, fallenStars: fallen }
    }, [wishes, currentUserId])

    useEffect(() => { fetchData() }, [])

    const fetchData = async () => {
        try {
            const profileRes = await fetch('/api/user/profile', { cache: 'no-store' })
            if (profileRes.ok) {
                const profileData = await profileRes.json()
                setCurrentUserId(profileData.id || '')
            }
            const wishesRes = await fetch('/api/secret-wishes', { cache: 'no-store' })
            const wishesData = await wishesRes.json()
            if (Array.isArray(wishesData)) setWishes(wishesData)
            const reqRes = await fetch('/api/secret-wishes/request', { cache: 'no-store' })
            const reqData = await reqRes.json()
            setHasRequestedToday(reqData.hasRequestedToday || false)
            if (reqData.receivedRequests?.length > 0) {
                setReceivedRequests(reqData.receivedRequests)
                if (!requestToRespond) setRequestToRespond(reqData.receivedRequests[0])
            }
            setLoading(false)
        } catch (error) {
            console.error('Error fetching data:', error)
            setLoading(false)
        }
    }

    const handleCreateWish = async () => {
        if (!newWishContent.trim()) return
        try {
            const res = await fetch('/api/secret-wishes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newWishContent, emoji: newWishEmoji })
            })
            if (res.ok) {
                setShowCreateModal(false)
                setNewWishContent('')
                await fetchData()
                alert('心愿已挂上树梢！✨')
            } else alert('创建失败，请重试')
        } catch (error) { console.error('Error:', error) }
    }

    const handleRequestReveal = async (wish: SecretWish) => {
        if (hasRequestedToday || isRequesting) return
        setIsRequesting(true)
        try {
            const res = await fetch('/api/secret-wishes/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUserId: wish.createdById, secretWishId: wish.id })
            })
            if (res.ok) {
                setHasRequestedToday(true)
                setSelectedWish(null)
                alert('已发送查看请求！等待对方同意。')
            } else {
                const data = await res.json()
                alert(data.error || '请求失败')
            }
        } catch (error) { console.error('Error:', error) }
        finally { setIsRequesting(false) }
    }

    const handleDeleteWish = async (id: string) => {
        if (!confirm('确定要删除这个心愿吗？')) return
        try {
            const res = await fetch(`/api/secret-wishes/${id}`, { method: 'DELETE' })
            if (res.ok) { setSelectedWish(null); fetchData() }
        } catch (error) { console.error('Error:', error) }
    }

    const handleRespondToRequest = async (status: 'approved' | 'rejected') => {
        if (!requestToRespond) return
        try {
            const res = await fetch('/api/secret-wishes/respond', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId: requestToRespond.id, status })
            })
            if (res.ok) {
                setReceivedRequests(prev => prev.filter(r => r.id !== requestToRespond.id))
                setRequestToRespond(null)
                alert(status === 'approved' ? '已同意！对方现在可以看到这个心愿了。' : '已拒绝请求。')
                if (receivedRequests.length > 1) setRequestToRespond(receivedRequests[1])
                fetchData()
            }
        } catch (error) { console.error('Error:', error) }
    }
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#050a15] via-[#0a1628] to-[#0f1f3a] flex flex-col items-center justify-center relative overflow-hidden">
                {/* Simple loading animation - no random values for hydration */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[10%] left-[20%] w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
                    <div className="absolute top-[30%] left-[70%] w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                    <div className="absolute top-[15%] left-[50%] w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
                    <div className="absolute top-[60%] left-[15%] w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.9s' }} />
                    <div className="absolute top-[45%] left-[80%] w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '1.2s' }} />
                    <div className="absolute top-[70%] left-[40%] w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
                    <div className="absolute top-[25%] left-[90%] w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="absolute top-[80%] left-[60%] w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.8s' }} />
                    <div className="absolute top-[50%] left-[30%] w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '1.1s' }} />
                    <div className="absolute top-[85%] left-[85%] w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                </div>

                {/* Animated tree growing */}
                <div className="relative flex flex-col items-center">
                    <div className="text-6xl mb-4 animate-bounce" style={{ animationDuration: '1.5s' }}>🌳</div>
                    <div className="flex items-center gap-2 text-emerald-200 text-lg font-medium">
                        <span>心愿树生长中</span>
                        <span className="flex gap-1">
                            <span className="animate-bounce" style={{ animationDelay: '0s' }}>.</span>
                            <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                            <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
                        </span>
                    </div>
                    <div className="mt-4 text-white/40 text-sm">正在加载秘密心愿</div>
                </div>

                {/* Decorative sparkles */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 text-2xl animate-ping" style={{ animationDuration: '2s' }}>✨</div>
                    <div className="absolute top-1/3 right-1/4 text-xl animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>🌟</div>
                    <div className="absolute bottom-1/3 left-1/3 text-lg animate-ping" style={{ animationDuration: '2s', animationDelay: '1s' }}>💫</div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#050a15] via-[#0a1628] to-[#0f1f3a] text-white relative overflow-x-hidden flex flex-col">
            <style jsx>{`
                @keyframes twinkle {
                    0%, 100% { opacity: 0.2; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.3); }
                }
                @keyframes twinkleBright {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; box-shadow: 0 0 6px 2px white; }
                }
                @keyframes shootingStar {
                    0% { transform: translateX(0) translateY(0); opacity: 1; }
                    70% { opacity: 1; }
                    100% { transform: translateX(300px) translateY(300px); opacity: 0; }
                }
                @keyframes sway {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(0deg); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes starPulse {
                    0%, 100% { transform: scale(1); filter: drop-shadow(0 0 8px gold); }
                    50% { transform: scale(1.15); filter: drop-shadow(0 0 20px gold); }
                }
                @keyframes leafShimmer {
                    0%, 100% { opacity: 0.2; }
                    50% { opacity: 0.6; }
                }
                @keyframes grassSway {
                    0%, 100% { transform: skewX(-2deg); }
                    50% { transform: skewX(2deg); }
                }
                @keyframes fireflyFloat {
                    0% { transform: translate(0, 0); opacity: 0; }
                    10% { opacity: 1; }
                    25% { transform: translate(15px, -20px); }
                    50% { transform: translate(-10px, -35px); opacity: 0.6; }
                    75% { transform: translate(20px, -15px); opacity: 1; }
                    90% { opacity: 0.8; }
                    100% { transform: translate(5px, -50px); opacity: 0; }
                }
                @keyframes fireflyGlow {
                    0%, 100% { box-shadow: 0 0 2px 1px #90EE90, 0 0 6px 2px #90EE90; }
                    50% { box-shadow: 0 0 4px 2px #ADFF2F, 0 0 12px 4px #ADFF2F; }
                }
                .tree-container { animation: sway 8s ease-in-out infinite; transform-origin: bottom center; }
                .wish-orb { animation: float 4s ease-in-out infinite; }
                .wish-orb:nth-child(even) { animation-delay: -2s; }
                .fallen-star { animation: starPulse 2s ease-in-out infinite; cursor: pointer; }
                .shooting-star {
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: white;
                    border-radius: 50%;
                    box-shadow: 0 0 6px 2px white, -20px 0 12px 1px rgba(255,255,255,0.3), -40px 0 16px 0px rgba(255,255,255,0.1);
                    animation: shootingStar 3s linear infinite;
                }
                .grass-blade {
                    animation: grassSway 3s ease-in-out infinite;
                    transform-origin: bottom center;
                }
                .firefly {
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: #ADFF2F;
                    border-radius: 50%;
                    animation: fireflyFloat 8s ease-in-out infinite, fireflyGlow 2s ease-in-out infinite;
                }
            `}</style>

            {/* Fireflies */}
            <div className="fixed inset-0 z-20 pointer-events-none overflow-hidden">
                <div className="firefly" style={{ bottom: '30%', left: '15%', animationDelay: '0s' }} />
                <div className="firefly" style={{ bottom: '40%', left: '25%', animationDelay: '2s' }} />
                <div className="firefly" style={{ bottom: '35%', right: '20%', animationDelay: '4s' }} />
                <div className="firefly" style={{ bottom: '45%', right: '30%', animationDelay: '1s' }} />
                <div className="firefly" style={{ bottom: '25%', left: '40%', animationDelay: '3s' }} />
                <div className="firefly" style={{ bottom: '50%', right: '15%', animationDelay: '5s' }} />
                <div className="firefly" style={{ bottom: '38%', left: '60%', animationDelay: '1.5s' }} />
                <div className="firefly" style={{ bottom: '42%', right: '45%', animationDelay: '3.5s' }} />
            </div>

            {/* Starry Background */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                {[...Array(150)].map((_, i) => {
                    const isBright = i < 20
                    return (
                        <div
                            key={i}
                            className={`absolute rounded-full ${isBright ? 'bg-white' : 'bg-white/80'}`}
                            style={{
                                top: `${Math.random() * 80}%`,
                                left: `${Math.random() * 100}%`,
                                width: isBright ? `${Math.random() * 3 + 2}px` : `${Math.random() * 2 + 1}px`,
                                height: isBright ? `${Math.random() * 3 + 2}px` : `${Math.random() * 2 + 1}px`,
                                animation: isBright
                                    ? `twinkleBright ${Math.random() * 2 + 1.5}s ease-in-out infinite`
                                    : `twinkle ${Math.random() * 4 + 2}s ease-in-out infinite`,
                                animationDelay: `${Math.random() * 5}s`
                            }}
                        />
                    )
                })}

                {/* Shooting Stars */}
                {[...Array(3)].map((_, i) => (
                    <div
                        key={`shooting-${i}`}
                        className="shooting-star"
                        style={{
                            top: `${10 + i * 15}%`,
                            left: `${10 + i * 20}%`,
                            animationDelay: `${i * 4 + 2}s`,
                            animationDuration: `${2.5 + i * 0.5}s`
                        }}
                    />
                ))}

                {/* Moon */}
                <div className="absolute top-16 right-4 md:top-20 md:right-10 z-10">
                    <div className="relative">
                        <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-amber-50 via-yellow-100 to-amber-200 shadow-[0_0_100px_30px_rgba(255,250,205,0.35)]" />
                        <div className="absolute top-4 left-5 w-2.5 h-2.5 md:w-4 md:h-4 rounded-full bg-amber-200/50" />
                        <div className="absolute top-7 right-4 w-3.5 h-3.5 md:w-5 md:h-5 rounded-full bg-amber-200/40" />
                        <div className="absolute bottom-5 left-6 w-2 h-2 md:w-3 md:h-3 rounded-full bg-amber-200/30" />
                    </div>
                </div>
            </div>

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex justify-between items-center bg-black/60 backdrop-blur-xl border-b border-white/5">
                <Link href="/wishes" className="text-white/60 hover:text-white transition text-sm flex items-center gap-1">
                    <span>←</span> 返回
                </Link>
                <h1 className="text-base md:text-lg font-semibold text-emerald-200">🌳 秘密心愿树</h1>
                <button onClick={() => setShowCreateModal(true)} className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-green-500/30 hover:scale-110 transition">+</button>
            </header>
            {/* Hint Text - Below Header */}
            {treeWishes.length > 0 && (
                <div className="fixed top-14 md:top-20 left-0 right-0 z-40 flex justify-center py-1.5 md:py-2 pointer-events-none px-4">
                    <div className="px-3 py-1.5 md:px-5 md:py-2 bg-gradient-to-r from-amber-500/25 via-yellow-400/25 to-amber-500/25 backdrop-blur-sm rounded-full border border-amber-400/40 shadow-lg shadow-amber-500/10">
                        <p className="text-amber-100 text-xs md:text-base lg:text-lg font-semibold tracking-wide text-center">
                            ✨ 点击心愿球查看详情 ✨
                        </p>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-end pt-20 md:pt-28">
                {/* Tree with Grass */}
                <div className="tree-container relative">
                    {/* Grass - at the base of the tree */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] h-24 z-10" style={{ background: 'linear-gradient(to top, #0a1a10 0%, #0a1a10 40%, transparent 100%)' }}>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5 items-end">
                            {[...Array(120)].map((_, i) => (
                                <div
                                    key={i}
                                    className="grass-blade bg-gradient-to-t from-green-900 via-green-700 to-green-500 rounded-t-full"
                                    style={{
                                        width: `${Math.random() * 5 + 2}px`,
                                        height: `${Math.random() * 35 + 20}px`,
                                        animationDelay: `${Math.random() * 2}s`,
                                        opacity: 0.6 + Math.random() * 0.4
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    <svg className="drop-shadow-2xl w-[92vw] md:w-[560px] h-auto relative z-0" viewBox="0 0 480 620">
                        <defs>
                            <linearGradient id="trunk" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3E2723" />
                                <stop offset="25%" stopColor="#5D4037" />
                                <stop offset="50%" stopColor="#6D4C41" />
                                <stop offset="75%" stopColor="#5D4037" />
                                <stop offset="100%" stopColor="#3E2723" />
                            </linearGradient>
                            <linearGradient id="foliage1" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#0D3B0D" />
                                <stop offset="100%" stopColor="#061F06" />
                            </linearGradient>
                            <linearGradient id="foliage2" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#1B5E20" />
                                <stop offset="100%" stopColor="#0D3B0D" />
                            </linearGradient>
                            <linearGradient id="foliage3" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#2E7D32" />
                                <stop offset="100%" stopColor="#1B5E20" />
                            </linearGradient>
                            <linearGradient id="foliage4" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#43A047" />
                                <stop offset="100%" stopColor="#2E7D32" />
                            </linearGradient>
                            <linearGradient id="foliage5" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#66BB6A" />
                                <stop offset="100%" stopColor="#4CAF50" />
                            </linearGradient>
                            <radialGradient id="highlight" cx="30%" cy="30%" r="60%">
                                <stop offset="0%" stopColor="#A5D6A7" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="#66BB6A" stopOpacity="0" />
                            </radialGradient>
                            <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
                                <feDropShadow dx="0" dy="10" stdDeviation="15" floodColor="#000" floodOpacity="0.5" />
                            </filter>
                        </defs>

                        {/* Ground Shadow */}
                        <ellipse cx="240" cy="610" rx="90" ry="12" fill="#000" opacity="0.4" />

                        {/* Trunk */}
                        <path d="M210 440 Q195 510 180 610 L300 610 Q285 510 270 440 Z" fill="url(#trunk)" />
                        <path d="M220 450 Q215 520 210 600" stroke="#2D1F1A" strokeWidth="3" fill="none" opacity="0.4" />
                        <path d="M240 445 Q238 520 235 605" stroke="#2D1F1A" strokeWidth="2" fill="none" opacity="0.3" />
                        <path d="M260 450 Q262 515 265 600" stroke="#2D1F1A" strokeWidth="2.5" fill="none" opacity="0.35" />
                        <ellipse cx="240" cy="520" rx="10" ry="15" fill="#1A0F0A" />
                        <ellipse cx="240" cy="518" rx="6" ry="10" fill="#0F0805" />

                        {/* Tree Crown */}
                        <g filter="url(#shadow)">
                            <ellipse cx="240" cy="350" rx="190" ry="110" fill="url(#foliage1)" />
                            <ellipse cx="80" cy="320" rx="80" ry="70" fill="url(#foliage1)" />
                            <ellipse cx="400" cy="320" rx="80" ry="70" fill="url(#foliage1)" />

                            <ellipse cx="240" cy="275" rx="170" ry="100" fill="url(#foliage2)" />
                            <ellipse cx="100" cy="255" rx="70" ry="60" fill="url(#foliage2)" />
                            <ellipse cx="380" cy="255" rx="70" ry="60" fill="url(#foliage2)" />

                            <ellipse cx="240" cy="200" rx="145" ry="85" fill="url(#foliage3)" />
                            <ellipse cx="120" cy="190" rx="55" ry="50" fill="url(#foliage3)" />
                            <ellipse cx="360" cy="190" rx="55" ry="50" fill="url(#foliage3)" />

                            <ellipse cx="240" cy="130" rx="115" ry="70" fill="url(#foliage4)" />
                            <ellipse cx="150" cy="125" rx="45" ry="40" fill="url(#foliage4)" />
                            <ellipse cx="330" cy="125" rx="45" ry="40" fill="url(#foliage4)" />

                            <ellipse cx="240" cy="75" rx="85" ry="50" fill="url(#foliage5)" />
                            <ellipse cx="185" cy="65" rx="35" ry="30" fill="url(#foliage5)" />
                            <ellipse cx="295" cy="65" rx="35" ry="30" fill="url(#foliage5)" />

                            <ellipse cx="240" cy="35" rx="50" ry="35" fill="url(#foliage5)" />
                        </g>

                        {/* Light highlights */}
                        <circle cx="190" cy="70" r="22" fill="url(#highlight)" style={{ animation: 'leafShimmer 3s ease-in-out infinite' }} />
                        <circle cx="290" cy="90" r="26" fill="url(#highlight)" style={{ animation: 'leafShimmer 3s ease-in-out infinite', animationDelay: '1s' }} />
                        <circle cx="140" cy="165" r="30" fill="url(#highlight)" style={{ animation: 'leafShimmer 3s ease-in-out infinite', animationDelay: '2s' }} />
                        <circle cx="340" cy="180" r="26" fill="url(#highlight)" style={{ animation: 'leafShimmer 3s ease-in-out infinite', animationDelay: '0.5s' }} />
                        <circle cx="240" cy="55" r="18" fill="url(#highlight)" style={{ animation: 'leafShimmer 3s ease-in-out infinite', animationDelay: '1.5s' }} />
                    </svg>

                    {/* Wishes */}
                    <div className="absolute inset-0 w-full h-full">
                        {treeWishes.slice(0, 12).map((wish, index) => {
                            const positions = [
                                { top: '3%', left: '50%' },
                                { top: '9%', left: '35%' },
                                { top: '9%', left: '65%' },
                                { top: '17%', left: '25%' },
                                { top: '15%', left: '50%' },
                                { top: '17%', left: '75%' },
                                { top: '27%', left: '18%' },
                                { top: '25%', left: '42%' },
                                { top: '25%', left: '58%' },
                                { top: '27%', left: '82%' },
                                { top: '38%', left: '32%' },
                                { top: '38%', left: '68%' },
                            ]
                            const pos = positions[index]
                            const isOwn = wish.createdById === currentUserId

                            return (
                                <button
                                    key={wish.id}
                                    onClick={() => setSelectedWish(wish)}
                                    className="wish-orb absolute -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-125 hover:z-30 group"
                                    style={{ top: pos.top, left: pos.left, animationDelay: `${index * 0.25}s` }}
                                >
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-px h-5 bg-gradient-to-b from-transparent via-white/20 to-white/50" />
                                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl md:text-2xl border-2 shadow-xl transition-all
                                        ${wish.isHidden
                                            ? 'bg-gradient-to-br from-slate-600 to-slate-800 border-slate-400/50 shadow-slate-900/60'
                                            : 'bg-gradient-to-br from-rose-400 via-pink-500 to-fuchsia-600 border-pink-300/80 shadow-[0_0_25px_rgba(236,72,153,0.5)]'
                                        }`}
                                    >
                                        <span className="drop-shadow-lg">{wish.isHidden ? '🔒' : wish.emoji}</span>
                                    </div>
                                    <div className={`absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] px-1.5 py-0.5 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all shadow-lg ${isOwn ? 'bg-blue-500' : 'bg-fuchsia-500'}`}>
                                        {isOwn ? '我的' : '伴侣'}
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Empty State */}
                {wishes.length === 0 && (
                    <div className="text-center mt-4 p-8 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10">
                        <div className="text-6xl mb-4 animate-bounce">🌱</div>
                        <p className="text-emerald-200 font-medium text-lg mb-2">心愿树正在等待...</p>
                        <p className="text-white/40 text-sm mb-5">挂上第一个秘密心愿吧</p>
                        <button onClick={() => setShowCreateModal(true)} className="px-6 py-2.5 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full text-white font-medium shadow-lg hover:scale-105 transition">
                            ✨ 挂上心愿
                        </button>
                    </div>
                )}

            </div>

            {/* Fallen Stars */}
            {fallenStars.length > 0 && (
                <div className="fixed bottom-16 left-0 right-0 z-30">
                    <div className="bg-gradient-to-t from-indigo-950/90 to-transparent pt-8 pb-4 px-6">
                        <p className="text-center text-amber-200/60 text-xs mb-3 tracking-widest uppercase">⭐ 已揭示的心愿 ⭐</p>
                        <div className="flex justify-center gap-5 flex-wrap">
                            {fallenStars.map((wish, i) => (
                                <button key={wish.id} onClick={() => setSelectedWish(wish)} className="fallen-star text-3xl md:text-4xl hover:scale-125 transition-transform" style={{ animationDelay: `${i * 0.2}s` }} title="点击查看">⭐</button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ===== MODALS ===== */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-6 w-full max-w-sm border border-white/10 shadow-2xl">
                        <h3 className="text-lg font-bold text-emerald-200 mb-4 text-center">🌿 挂上秘密心愿</h3>
                        <textarea value={newWishContent} onChange={(e) => setNewWishContent(e.target.value)} placeholder="写下你的小秘密..." className="w-full h-28 p-4 bg-slate-700/60 rounded-xl border border-white/10 resize-none focus:outline-none focus:border-emerald-400/50 text-white placeholder-white/30" />
                        <div className="my-4">
                            <p className="text-xs text-white/40 mb-2">选择装饰：</p>
                            <div className="flex gap-2 justify-center flex-wrap">
                                {['🎁', '🎀', '⭐', '🎈', '💖', '🌸', '🍀', '🌙'].map(emoji => (
                                    <button key={emoji} onClick={() => setNewWishEmoji(emoji)} className={`w-10 h-10 rounded-full text-xl transition ${newWishEmoji === emoji ? 'bg-emerald-500/40 ring-2 ring-emerald-400 scale-110' : 'bg-slate-700/50 hover:bg-slate-600/50'}`}>{emoji}</button>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowCreateModal(false)} className="flex-1 py-3 bg-slate-700/60 rounded-xl text-white/60">取消</button>
                            <button onClick={handleCreateWish} disabled={!newWishContent.trim()} className="flex-1 py-3 bg-gradient-to-r from-emerald-400 to-green-500 rounded-xl text-white font-medium disabled:opacity-40">挂上去 ✨</button>
                        </div>
                    </div>
                </div>
            )}

            {selectedWish && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setSelectedWish(null)}>
                    <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-6 w-full max-w-sm border border-white/10 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedWish(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 text-white/50 hover:bg-white/20 flex items-center justify-center">✕</button>
                        <div className="text-center mb-5">
                            <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-4xl mb-3 border-2 ${selectedWish.isHidden ? 'bg-slate-700 border-slate-500' : selectedWish.isRevealed ? 'bg-gradient-to-br from-amber-300 to-orange-400 border-yellow-200 shadow-[0_0_30px_rgba(251,191,36,0.5)]' : 'bg-gradient-to-br from-rose-400 to-fuchsia-600 border-pink-300'}`}>
                                {selectedWish.isHidden ? '🔒' : selectedWish.isRevealed ? '⭐' : selectedWish.emoji}
                            </div>
                            <p className="text-white/50 text-sm">{selectedWish.createdById === currentUserId ? '💙 我的心愿' : `💚 ${selectedWish.createdBy?.displayName || selectedWish.createdBy?.nickname || '伴侣'}的心愿`}</p>
                        </div>
                        {selectedWish.isHidden ? (
                            <div className="space-y-4">
                                <p className="text-center text-white/60 text-sm">这是一个被封锁的秘密 🔐</p>
                                <p className="text-center text-amber-200/50 text-xs">每日仅限一次查看请求</p>
                                <button onClick={() => handleRequestReveal(selectedWish)} disabled={hasRequestedToday || isRequesting} className={`w-full py-3 rounded-xl font-medium ${hasRequestedToday ? 'bg-slate-700/50 text-white/30' : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'}`}>
                                    {hasRequestedToday ? '今日请求已用完' : isRequesting ? '发送中...' : '✨ 请求查看'}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-5 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/20">
                                    <p className="text-white text-lg text-center leading-relaxed">"{selectedWish.content}"</p>
                                </div>
                                {selectedWish.createdById === currentUserId && (
                                    <button onClick={() => handleDeleteWish(selectedWish.id)} className="w-full py-2.5 border border-red-500/30 text-red-400 rounded-xl text-sm hover:bg-red-500/10">🗑️ 删除心愿</button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {requestToRespond && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-6 w-full max-w-sm border border-white/10 shadow-2xl text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 mx-auto flex items-center justify-center text-3xl mb-4 animate-bounce shadow-lg">💌</div>
                        <h3 className="text-xl font-bold text-rose-200 mb-2">收到查看请求！</h3>
                        <p className="text-white/50 mb-5"><span className="text-rose-300">{requestToRespond.requester?.displayName || requestToRespond.requester?.nickname || '伴侣'}</span> 想看你的一个秘密心愿</p>
                        <div className="flex gap-3">
                            <button onClick={() => handleRespondToRequest('rejected')} className="flex-1 py-3 bg-slate-700/60 rounded-xl text-white/60">保持神秘</button>
                            <button onClick={() => handleRespondToRequest('approved')} className="flex-1 py-3 bg-gradient-to-r from-rose-400 to-pink-500 rounded-xl text-white font-medium">💝 同意揭示</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
