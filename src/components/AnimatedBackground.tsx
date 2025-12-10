'use client'

import { useEffect, useState } from 'react'

interface FloatingElement {
    id: number
    x: number
    y: number
    size: number
    opacity: number
    duration: number
    delay: number
    emoji: string
}

const EMOJIS = ['💕', '✨', '💖', '🌸', '💗', '⭐', '🌟', '💝']

export default function AnimatedBackground() {
    const [elements, setElements] = useState<FloatingElement[]>([])

    useEffect(() => {
        // 生成浮动元素 - 减少数量以提高性能 (原来是15，现在是8)
        const newElements: FloatingElement[] = []
        for (let i = 0; i < 8; i++) {
            newElements.push({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: 12 + Math.random() * 16,
                opacity: 0.08 + Math.random() * 0.12, // 降低透明度减少渲染负担
                duration: 20 + Math.random() * 15, // 延长动画周期
                delay: Math.random() * 8,
                emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
            })
        }
        setElements(newElements)
    }, [])

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {/* 渐变背景层 - 静态，无动画 */}
            <div
                className="absolute inset-0 opacity-25"
                style={{
                    background: 'radial-gradient(ellipse at top right, var(--hf-yellow-light) 0%, transparent 50%), radial-gradient(ellipse at bottom left, rgba(255, 182, 193, 0.2) 0%, transparent 50%)',
                }}
            />

            {/* 动态光斑 - 减少模糊程度和尺寸 */}
            <div
                className="absolute w-72 h-72 rounded-full blur-2xl opacity-15"
                style={{
                    background: 'linear-gradient(135deg, var(--hf-yellow) 0%, #ff69b4 100%)',
                    top: '5%',
                    right: '0%',
                    animation: 'float-slow 25s ease-in-out infinite',
                    willChange: 'transform',
                }}
            />
            <div
                className="absolute w-64 h-64 rounded-full blur-2xl opacity-10"
                style={{
                    background: 'linear-gradient(135deg, #ff69b4 0%, #9370db 100%)',
                    bottom: '5%',
                    left: '0%',
                    animation: 'float-slow 30s ease-in-out infinite reverse',
                    willChange: 'transform',
                }}
            />

            {/* 浮动emoji - 添加GPU加速 */}
            {elements.map(el => (
                <div
                    key={el.id}
                    className="absolute select-none"
                    style={{
                        left: `${el.x}%`,
                        top: `${el.y}%`,
                        fontSize: `${el.size}px`,
                        opacity: el.opacity,
                        animation: `float-up ${el.duration}s ease-in-out infinite`,
                        animationDelay: `${el.delay}s`,
                        willChange: 'transform',
                        transform: 'translateZ(0)',
                    }}
                >
                    {el.emoji}
                </div>
            ))}

            {/* CSS动画 - 简化动画 */}
            <style jsx global>{`
                @keyframes float-slow {
                    0%, 100% { transform: translate(0, 0) translateZ(0); }
                    50% { transform: translate(20px, -20px) translateZ(0); }
                }
                @keyframes float-up {
                    0%, 100% { 
                        transform: translateY(0) translateZ(0); 
                        opacity: inherit;
                    }
                    50% { 
                        transform: translateY(-30px) translateZ(0);
                    }
                }
            `}</style>
        </div>
    )
}
