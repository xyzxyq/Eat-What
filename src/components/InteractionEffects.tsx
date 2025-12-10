'use client'

import { useEffect, useState } from 'react'

interface InteractionStatus {
    currentUserDone: boolean
    partnerDone: boolean
    bothDone: boolean
}

// 主题颜色配置
const themeColors: Record<string, { primary: string; secondary: string; emojis: string[] }> = {
    yellow: {
        primary: 'rgba(255,210,30,',
        secondary: 'rgba(250,200,50,',
        emojis: ['🌻', '🌼', '⭐', '✨', '🌟', '💛', '🎋', '🍋']
    },
    pink: {
        primary: 'rgba(236,72,153,',
        secondary: 'rgba(255,182,193,',
        emojis: ['🌸', '💗', '🌺', '💕', '🌷', '❤️', '🌹', '💖']
    },
    blue: {
        primary: 'rgba(59,130,246,',
        secondary: 'rgba(147,197,253,',
        emojis: ['🌊', '💙', '🐬', '🦋', '❄️', '💎', '🧊', '🌀']
    },
    purple: {
        primary: 'rgba(147,51,234,',
        secondary: 'rgba(196,181,253,',
        emojis: ['💜', '🔮', '🍇', '👾', '🦄', '💟', '🪻', '🌌']
    },
    green: {
        primary: 'rgba(34,197,94,',
        secondary: 'rgba(134,239,172,',
        emojis: ['🌿', '💚', '🍀', '🌱', '🌲', '🥒', '🥝', '🌴']
    },
    orange: {
        primary: 'rgba(249,115,22,',
        secondary: 'rgba(253,186,116,',
        emojis: ['🍊', '🧡', '🔥', '🌅', '🥕', '🎃', '🍁', '🌻']
    }
}

interface InteractionEffectsProps {
    kissStatus: InteractionStatus
    hugStatus: InteractionStatus
    goodnightStatus: InteractionStatus
    intensity: 'subtle' | 'obvious'
    area: 'local' | 'fullpage'
    theme?: string
}

// 粒子类型定义
interface Particle {
    id: number
    emoji: string
    x: number
    y: number
    size: number
    duration: number
    delay: number
}

export default function InteractionEffects({
    kissStatus,
    hugStatus,
    goodnightStatus,
    intensity,
    area,
    theme = 'yellow'
}: InteractionEffectsProps) {
    const [particles, setParticles] = useState<Particle[]>([])
    const [isMobile, setIsMobile] = useState(false)

    const themeConfig = themeColors[theme] || themeColors.yellow

    // 检测是否移动端
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // 生成粒子
    useEffect(() => {
        const newParticles: Particle[] = []
        let particleId = 0

        // 大幅增加粒子数量
        const particleCount = isMobile ? 12 : 24
        const baseSize = intensity === 'obvious' ? 2.0 : 1.2

        // 使用主题emoji
        const emojis = themeConfig.emojis

        // 亲亲效果粒子 - 使用主题颜色emoji
        if (kissStatus.partnerDone || kissStatus.bothDone) {
            const count = kissStatus.bothDone ? particleCount : Math.floor(particleCount / 2)
            for (let i = 0; i < count; i++) {
                newParticles.push({
                    id: particleId++,
                    emoji: emojis[i % emojis.length],
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    size: (1.0 + Math.random() * 1.0) * baseSize,
                    duration: 4 + Math.random() * 4,
                    delay: Math.random() * 3
                })
            }
        }

        // 抱抱效果粒子 - 使用主题颜色emoji
        if (hugStatus.partnerDone || hugStatus.bothDone) {
            const count = hugStatus.bothDone ? particleCount : Math.floor(particleCount / 2)
            for (let i = 0; i < count; i++) {
                newParticles.push({
                    id: particleId++,
                    emoji: emojis[(i + 2) % emojis.length],
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    size: (1.0 + Math.random() * 1.0) * baseSize,
                    duration: 5 + Math.random() * 4,
                    delay: Math.random() * 3
                })
            }
        }

        // 晚安效果粒子 - 使用主题颜色emoji
        if (goodnightStatus.partnerDone || goodnightStatus.bothDone) {
            const count = goodnightStatus.bothDone ? particleCount : Math.floor(particleCount / 2)
            for (let i = 0; i < count; i++) {
                newParticles.push({
                    id: particleId++,
                    emoji: emojis[(i + 4) % emojis.length],
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    size: (0.9 + Math.random() * 0.8) * baseSize,
                    duration: 3 + Math.random() * 4,
                    delay: Math.random() * 3
                })
            }
        }

        setParticles(newParticles)
    }, [kissStatus, hugStatus, goodnightStatus, intensity, isMobile, themeConfig])

    // 计算效果类名
    const hasKissEffect = kissStatus.partnerDone || kissStatus.bothDone
    const hasHugEffect = hugStatus.partnerDone || hugStatus.bothDone
    const hasGoodnightEffect = goodnightStatus.partnerDone || goodnightStatus.bothDone

    const hasAnyEffect = hasKissEffect || hasHugEffect || hasGoodnightEffect

    if (!hasAnyEffect) return null

    // 大幅提高透明度让效果更明显
    const baseOpacity = intensity === 'obvious' ? 1.0 : 0.7
    const glowOpacity = intensity === 'obvious' ? 0.7 : 0.4

    // 根据区域决定定位
    const containerClass = area === 'fullpage'
        ? 'fixed inset-0 z-0 pointer-events-none overflow-hidden'
        : 'absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-2xl'

    return (
        <>
            <style jsx>{`
                @keyframes float-up {
                    0% {
                        transform: translateY(100vh) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: ${baseOpacity};
                    }
                    90% {
                        opacity: ${baseOpacity};
                    }
                    100% {
                        transform: translateY(-100px) rotate(360deg);
                        opacity: 0;
                    }
                }

                @keyframes twinkle {
                    0%, 100% {
                        opacity: ${glowOpacity};
                        transform: scale(1);
                    }
                    50% {
                        opacity: ${baseOpacity};
                        transform: scale(1.2);
                    }
                }

                @keyframes pulse-glow {
                    0%, 100% {
                        opacity: ${glowOpacity * 0.5};
                    }
                    50% {
                        opacity: ${glowOpacity};
                    }
                }

                @keyframes mobile-float {
                    0%, 100% {
                        transform: translateY(0) scale(1);
                    }
                    50% {
                        transform: translateY(-10px) scale(1.1);
                    }
                }

                .particle {
                    position: absolute;
                    pointer-events: none;
                    animation: ${isMobile ? 'mobile-float' : 'float-up'} var(--duration) ease-in-out infinite;
                    animation-delay: var(--delay);
                }

                .glow-overlay {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    animation: pulse-glow 3s ease-in-out infinite;
                }

                /* 统一使用主题颜色 */
                .kiss-glow,
                .hug-glow,
                .goodnight-glow {
                    background: ${isMobile
                    ? `linear-gradient(135deg, ${themeConfig.primary}${glowOpacity}) 0%, ${themeConfig.secondary}${glowOpacity * 0.5}) 30%, transparent 60%)`
                    : `radial-gradient(ellipse at 50% 50%, ${themeConfig.primary}${glowOpacity}) 0%, ${themeConfig.secondary}${glowOpacity * 0.5}) 30%, transparent 60%)`
                };
                }

                /* 移动端边框发光效果 - 使用主题颜色 */
                @media (max-width: 768px) {
                    .mobile-border-glow {
                        position: absolute;
                        inset: -4px;
                        border-radius: inherit;
                        pointer-events: none;
                        animation: pulse-glow 2s ease-in-out infinite;
                    }

                    .kiss-border,
                    .hug-border,
                    .goodnight-border {
                        box-shadow: inset 0 0 30px ${themeConfig.primary}${glowOpacity}),
                                    0 0 25px ${themeConfig.primary}${glowOpacity * 0.7}),
                                    0 0 50px ${themeConfig.secondary}${glowOpacity * 0.3});
                    }
                }
            `}</style>

            <div className={containerClass}>
                {/* 光晕效果层 */}
                {hasKissEffect && (
                    <div className={`glow-overlay kiss-glow ${isMobile ? 'mobile-border-glow kiss-border' : ''}`} />
                )}
                {hasHugEffect && (
                    <div className={`glow-overlay hug-glow ${isMobile ? 'mobile-border-glow hug-border' : ''}`}
                        style={{ animationDelay: '1s' }} />
                )}
                {hasGoodnightEffect && (
                    <div className={`glow-overlay goodnight-glow ${isMobile ? 'mobile-border-glow goodnight-border' : ''}`}
                        style={{ animationDelay: '2s' }} />
                )}

                {/* 粒子效果 */}
                {particles.map(p => (
                    <span
                        key={p.id}
                        className="particle"
                        style={{
                            left: `${p.x}%`,
                            top: isMobile ? `${p.y}%` : 'auto',
                            bottom: isMobile ? 'auto' : '0',
                            fontSize: `${p.size}rem`,
                            '--duration': `${p.duration}s`,
                            '--delay': `${p.delay}s`
                        } as React.CSSProperties}
                    >
                        {p.emoji}
                    </span>
                ))}
            </div>
        </>
    )
}
