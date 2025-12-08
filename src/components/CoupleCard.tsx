'use client'

import { useState, useEffect } from 'react'
import UserAvatar from '@/components/UserAvatar'

interface UserData {
    id: string
    nickname: string
    displayName?: string | null
    avatarEmoji: string
    avatarUrl?: string | null
    status?: string
}

interface CoupleCardProps {
    currentUser: UserData | undefined
    partner: UserData | undefined
    onAvatarClick: () => void
    theme?: string
}

// Theme-based emoji configurations
const themeEmojis: Record<string, { floating: string[], orbiting: string[], shimmerColor: string }> = {
    yellow: {
        floating: ['🌻', '🌼', '⭐', '✨', '🌟', '💛', '🎗️', '🍋'],
        orbiting: ['✨', '💫', '⭐'],
        shimmerColor: 'rgba(255,210,30,0.1)'
    },
    pink: {
        floating: ['🌸', '💗', '🌺', '💕', '🌷', '❤️', '🌹', '💖'],
        orbiting: ['💖', '💝', '💗'],
        shimmerColor: 'rgba(236,72,153,0.1)'
    },
    blue: {
        floating: ['🌊', '💙', '🐬', '🦋', '❄️', '💎', '🧊', '🌀'],
        orbiting: ['💎', '🔹', '💠'],
        shimmerColor: 'rgba(59,130,246,0.1)'
    },
    purple: {
        floating: ['💜', '🔮', '🍇', '👾', '🦄', '💟', '🪻', '🌌'],
        orbiting: ['🔮', '💜', '✨'],
        shimmerColor: 'rgba(147,51,234,0.1)'
    },
    green: {
        floating: ['🌿', '💚', '🍀', '🌱', '🌲', '🥒', '🥝', '🌴'],
        orbiting: ['🍀', '💚', '🌟'],
        shimmerColor: 'rgba(34,197,94,0.1)'
    },
    orange: {
        floating: ['🍊', '🧡', '🔥', '🌅', '🥕', '🎃', '🍁', '🌻'],
        orbiting: ['🔥', '🧡', '✨'],
        shimmerColor: 'rgba(249,115,22,0.1)'
    }
}

export default function CoupleCard({ currentUser, partner, onAvatarClick, theme = 'yellow' }: CoupleCardProps) {
    const [heartBeat, setHeartBeat] = useState(false)
    const [currentTheme, setCurrentTheme] = useState(theme)

    // Listen for theme changes from document
    useEffect(() => {
        const checkTheme = () => {
            const docTheme = document.documentElement.getAttribute('data-theme') || 'yellow'
            setCurrentTheme(docTheme)
        }
        checkTheme()

        // Create observer to watch for theme changes
        const observer = new MutationObserver(checkTheme)
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

        return () => observer.disconnect()
    }, [])

    const themeConfig = themeEmojis[currentTheme] || themeEmojis.yellow

    const handleHeartClick = () => {
        setHeartBeat(true)
        setTimeout(() => setHeartBeat(false), 600)
    }

    return (
        <div className="couple-card">
            <style jsx>{`
                .couple-card {
                    background: linear-gradient(135deg, var(--hf-yellow-light) 0%, white 50%, var(--hf-yellow-light) 100%);
                    border-radius: 20px;
                    padding: 20px;
                    border: 2px solid var(--hf-yellow);
                    box-shadow: 0 8px 32px ${themeConfig.shimmerColor.replace('0.1', '0.15')};
                    position: relative;
                    overflow: hidden;
                }

                .couple-card::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, ${themeConfig.shimmerColor} 0%, transparent 70%);
                    animation: shimmer 8s ease-in-out infinite;
                }

                @keyframes shimmer {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(180deg); }
                }

                .avatar-wrapper {
                    position: relative;
                    z-index: 1;
                    transition: transform 0.3s ease;
                }

                .avatar-wrapper:hover {
                    transform: scale(1.1);
                }

                .avatar-wrapper:active {
                    transform: scale(0.95);
                }

                .avatar-container {
                    position: relative;
                    animation: float 3s ease-in-out infinite;
                    width: 100px;
                    min-width: 100px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .avatar-container:nth-child(2) {
                    animation-delay: -1.5s;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-5px); }
                }

                .heart-connector {
                    position: relative;
                    z-index: 2;
                    cursor: pointer;
                    transition: transform 0.3s ease;
                }

                .heart-connector:hover {
                    transform: scale(1.2);
                }

                .heart-beat {
                    animation: heartPulse 0.6s ease-out;
                }

                @keyframes heartPulse {
                    0% { transform: scale(1); }
                    25% { transform: scale(1.4); }
                    50% { transform: scale(1.2); }
                    75% { transform: scale(1.3); }
                    100% { transform: scale(1); }
                }

                .status-bubble {
                    background: white;
                    padding: 6px 16px;
                    border-radius: 16px;
                    font-size: 14px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    animation: fadeInUp 0.5s ease-out;
                    max-width: 140px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    border: 1px solid var(--hf-yellow-light);
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .sparkle {
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: var(--hf-yellow);
                    border-radius: 50%;
                    animation: sparkle 2s ease-in-out infinite;
                }

                .sparkle:nth-child(1) { top: 10%; left: 10%; animation-delay: 0s; }
                .sparkle:nth-child(2) { top: 20%; right: 15%; animation-delay: 0.5s; }
                .sparkle:nth-child(3) { bottom: 15%; left: 20%; animation-delay: 1s; }
                .sparkle:nth-child(4) { bottom: 25%; right: 10%; animation-delay: 1.5s; }

                @keyframes sparkle {
                    0%, 100% { opacity: 0; transform: scale(0); }
                    50% { opacity: 1; transform: scale(1); }
                }

                .name-text {
                    font-weight: 600;
                    color: var(--hf-text);
                    font-size: 16px;
                    margin-top: 10px;
                }

                .connection-line {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 80px;
                    height: 2px;
                    background: linear-gradient(90deg, var(--hf-yellow), var(--hf-yellow-light), var(--hf-yellow));
                    z-index: 0;
                }

                .love-meter {
                    position: absolute;
                    bottom: 8px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 4px;
                    z-index: 5;
                }

                .love-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: var(--hf-yellow);
                    animation: lovePulse 1.5s ease-in-out infinite;
                }

                .love-dot:nth-child(2) { animation-delay: 0.2s; }
                .love-dot:nth-child(3) { animation-delay: 0.4s; }
                .love-dot:nth-child(4) { animation-delay: 0.6s; }
                .love-dot:nth-child(5) { animation-delay: 0.8s; }

                @keyframes lovePulse {
                    0%, 100% { opacity: 0.3; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1.2); }
                }

                .waiting-text {
                    color: var(--hf-text-muted);
                    font-size: 12px;
                    animation: pulse 2s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }

                .floating-emoji {
                    position: absolute;
                    font-size: 16px;
                    opacity: 0;
                    animation: floatUp 4s ease-in-out infinite;
                    pointer-events: none;
                }

                .floating-emoji:nth-child(5) { left: 5%; animation-delay: 0s; }
                .floating-emoji:nth-child(6) { left: 15%; animation-delay: 0.8s; }
                .floating-emoji:nth-child(7) { left: 25%; animation-delay: 1.6s; }
                .floating-emoji:nth-child(8) { right: 25%; animation-delay: 0.4s; }
                .floating-emoji:nth-child(9) { right: 15%; animation-delay: 1.2s; }
                .floating-emoji:nth-child(10) { right: 5%; animation-delay: 2s; }
                .floating-emoji:nth-child(11) { left: 35%; animation-delay: 2.4s; }
                .floating-emoji:nth-child(12) { right: 35%; animation-delay: 2.8s; }

                @keyframes floatUp {
                    0% {
                        opacity: 0;
                        bottom: 0;
                        transform: translateX(0) rotate(0deg);
                    }
                    10% {
                        opacity: 0.8;
                    }
                    90% {
                        opacity: 0.8;
                    }
                    100% {
                        opacity: 0;
                        bottom: 100%;
                        transform: translateX(10px) rotate(20deg);
                    }
                }

                .orbit-emoji {
                    position: absolute;
                    font-size: 14px;
                    animation: orbit 6s linear infinite;
                    pointer-events: none;
                }

                .orbit-emoji:nth-child(13) { animation-delay: 0s; }
                .orbit-emoji:nth-child(14) { animation-delay: -2s; }
                .orbit-emoji:nth-child(15) { animation-delay: -4s; }

                @keyframes orbit {
                    0% {
                        top: 50%;
                        left: 0;
                        transform: translateY(-50%);
                    }
                    25% {
                        top: 0;
                        left: 50%;
                        transform: translateX(-50%);
                    }
                    50% {
                        top: 50%;
                        left: 100%;
                        transform: translateX(-100%) translateY(-50%);
                    }
                    75% {
                        top: 100%;
                        left: 50%;
                        transform: translateX(-50%) translateY(-100%);
                    }
                    100% {
                        top: 50%;
                        left: 0;
                        transform: translateY(-50%);
                    }
                }

                /* Mobile responsive styles */
                @media (max-width: 480px) {
                    .couple-card {
                        padding: 12px;
                        border-radius: 16px;
                    }

                    .avatar-container {
                        width: 80px;
                        min-width: 80px;
                    }

                    .heart-connector {
                        font-size: 1.5rem;
                    }

                    .name-text {
                        font-size: 0.75rem;
                    }

                    .status-bubble {
                        padding: 4px 10px;
                        font-size: 11px;
                        max-width: 75px;
                    }

                    .sparkle {
                        width: 3px;
                        height: 3px;
                    }

                    .floating-emoji {
                        font-size: 12px;
                    }

                    .orbit-emoji {
                        font-size: 10px;
                    }

                    .love-dot {
                        width: 6px;
                        height: 6px;
                    }
                }

                @media (max-width: 375px) {
                    .couple-card {
                        padding: 10px;
                    }

                    .avatar-container {
                        width: 70px;
                        min-width: 70px;
                    }

                    .heart-connector {
                        font-size: 1.25rem;
                    }

                    .status-bubble {
                        max-width: 65px;
                        font-size: 10px;
                    }

                    .floating-emoji,
                    .orbit-emoji {
                        display: none;
                    }
                }
            `}</style>

            {/* Sparkles */}
            <div className="sparkle"></div>
            <div className="sparkle"></div>
            <div className="sparkle"></div>
            <div className="sparkle"></div>

            {/* Floating Emojis */}
            {themeConfig.floating.map((emoji, i) => (
                <div key={`float-${i}`} className="floating-emoji">{emoji}</div>
            ))}

            {/* Orbiting Emojis */}
            {themeConfig.orbiting.map((emoji, i) => (
                <div key={`orbit-${i}`} className="orbit-emoji">{emoji}</div>
            ))}

            <div className="flex items-center justify-center gap-2 sm:gap-4 relative z-10">
                {/* Current User */}
                {currentUser ? (
                    <div className="avatar-container">
                        <button
                            onClick={onAvatarClick}
                            className="avatar-wrapper flex flex-col items-center"
                            title="点击编辑个人资料"
                        >
                            <div className="relative">
                                <UserAvatar
                                    avatarUrl={currentUser.avatarUrl}
                                    avatarEmoji={currentUser.avatarEmoji}
                                    size="2xl"
                                />
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white flex items-center justify-center text-xs">
                                    ✓
                                </div>
                            </div>
                            <span className="name-text">{currentUser.nickname}</span>
                        </button>
                        {currentUser.status && (
                            <div className="status-bubble mt-2 text-center">
                                {currentUser.status}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="waiting-text">加载中...</div>
                )}

                {/* Heart Connector */}
                <div
                    className={`heart-connector text-3xl ${heartBeat ? 'heart-beat' : ''}`}
                    onClick={handleHeartClick}
                >
                    💕
                </div>

                {/* Partner */}
                {partner ? (
                    <div className="avatar-container">
                        <div className="avatar-wrapper flex flex-col items-center">
                            <div className="relative">
                                <UserAvatar
                                    avatarUrl={partner.avatarUrl}
                                    avatarEmoji={partner.avatarEmoji}
                                    size="2xl"
                                />
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white flex items-center justify-center text-xs">
                                    ✓
                                </div>
                            </div>
                            <span className="name-text">{partner.nickname}</span>
                        </div>
                        {partner.status && (
                            <div className="status-bubble mt-2 text-center">
                                {partner.status}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="avatar-container">
                        <div className="avatar-wrapper flex flex-col items-center opacity-50">
                            <div className="w-12 h-12 rounded-full bg-[var(--hf-border)] flex items-center justify-center text-2xl">
                                ?
                            </div>
                            <span className="waiting-text mt-2">等待加入...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Love Meter */}
            <div className="love-meter">
                <div className="love-dot"></div>
                <div className="love-dot"></div>
                <div className="love-dot"></div>
                <div className="love-dot"></div>
                <div className="love-dot"></div>
            </div>

            {/* Bottom decoration */}
            <div className="text-center mt-6 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 rounded-full border border-[var(--hf-yellow-light)]">
                    <span className="text-lg">💝</span>
                    <span className="text-sm font-medium text-[var(--hf-text)]">你们的专属空间</span>
                    <span className="text-lg">💝</span>
                </div>
            </div>
        </div>
    )
}
