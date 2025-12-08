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
        // 生成浮动元素
        const newElements: FloatingElement[] = []
        for (let i = 0; i < 15; i++) {
            newElements.push({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: 10 + Math.random() * 20,
                opacity: 0.1 + Math.random() * 0.2,
                duration: 15 + Math.random() * 20,
                delay: Math.random() * 10,
                emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
            })
        }
        setElements(newElements)
    }, [])

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {/* 渐变背景层 */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    background: 'radial-gradient(ellipse at top right, var(--hf-yellow-light) 0%, transparent 50%), radial-gradient(ellipse at bottom left, rgba(255, 182, 193, 0.3) 0%, transparent 50%)',
                }}
            />

            {/* 动态光斑 */}
            <div
                className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
                style={{
                    background: 'linear-gradient(135deg, var(--hf-yellow) 0%, #ff69b4 100%)',
                    top: '10%',
                    right: '-10%',
                    animation: 'float-slow 20s ease-in-out infinite',
                }}
            />
            <div
                className="absolute w-80 h-80 rounded-full blur-3xl opacity-15"
                style={{
                    background: 'linear-gradient(135deg, #ff69b4 0%, #9370db 100%)',
                    bottom: '5%',
                    left: '-5%',
                    animation: 'float-slow 25s ease-in-out infinite reverse',
                }}
            />

            {/* 浮动emoji */}
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
                    }}
                >
                    {el.emoji}
                </div>
            ))}

            {/* CSS动画 */}
            <style jsx global>{`
                @keyframes float-slow {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    25% { transform: translate(30px, -30px) rotate(5deg); }
                    50% { transform: translate(-20px, 20px) rotate(-5deg); }
                    75% { transform: translate(20px, 30px) rotate(3deg); }
                }
                @keyframes float-up {
                    0%, 100% { 
                        transform: translateY(0) translateX(0) rotate(0deg); 
                        opacity: inherit;
                    }
                    25% { 
                        transform: translateY(-50px) translateX(20px) rotate(10deg); 
                    }
                    50% { 
                        transform: translateY(-30px) translateX(-15px) rotate(-5deg);
                        opacity: calc(inherit * 1.5);
                    }
                    75% { 
                        transform: translateY(-60px) translateX(10px) rotate(8deg); 
                    }
                }
            `}</style>
        </div>
    )
}
