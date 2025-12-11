'use client'

import { useState, useEffect, useRef } from 'react'
import { type PresetFood } from '@/lib/food-categories'

interface FoodWheelProps {
    foods: PresetFood[]
    isSpinning: boolean
    result: PresetFood | null
    showResult: boolean
}

export default function FoodWheel({ foods, isSpinning, result, showResult }: FoodWheelProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [rotation, setRotation] = useState(0)
    const [displayFoods, setDisplayFoods] = useState<PresetFood[]>([])

    // 限制显示的食物数量 (转盘最多显示12个)
    useEffect(() => {
        if (foods.length <= 12) {
            setDisplayFoods(foods)
        } else {
            // 随机选择12个
            const shuffled = [...foods].sort(() => Math.random() - 0.5)
            setDisplayFoods(shuffled.slice(0, 12))
        }
    }, [foods])

    // 绘制转盘
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const radius = Math.min(centerX, centerY) - 10

        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // 绘制转盘背景
        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate((rotation * Math.PI) / 180)

        const sliceCount = displayFoods.length || 8
        const sliceAngle = (2 * Math.PI) / sliceCount

        // 颜色方案 (使用主题相关色彩)
        const colors = [
            '#FFD21E', '#FFE066', '#FFF3C7', // 黄色系
            '#F472B6', '#FBCFE8', '#FCE7F3', // 粉色系
            '#60A5FA', '#93C5FD', '#DBEAFE', // 蓝色系
            '#A78BFA', '#C4B5FD', '#EDE9FE', // 紫色系
        ]

        displayFoods.forEach((food, index) => {
            const startAngle = index * sliceAngle - Math.PI / 2
            const endAngle = startAngle + sliceAngle

            // 绘制扇形
            ctx.beginPath()
            ctx.moveTo(0, 0)
            ctx.arc(0, 0, radius, startAngle, endAngle)
            ctx.closePath()
            ctx.fillStyle = colors[index % colors.length]
            ctx.fill()
            ctx.strokeStyle = 'white'
            ctx.lineWidth = 2
            ctx.stroke()

            // 绘制食物名称和 emoji
            ctx.save()
            ctx.rotate(startAngle + sliceAngle / 2)
            ctx.textAlign = 'right'
            ctx.fillStyle = '#1F2937'

            // Emoji
            ctx.font = '20px sans-serif'
            ctx.fillText(food.emoji, radius - 20, 6)

            // 名称 (如果空间足够)
            if (sliceCount <= 8) {
                ctx.font = 'bold 12px Inter, sans-serif'
                ctx.fillText(food.name.slice(0, 4), radius - 45, 5)
            }

            ctx.restore()
        })

        // 绘制中心圆
        ctx.beginPath()
        ctx.arc(0, 0, 30, 0, 2 * Math.PI)
        ctx.fillStyle = 'white'
        ctx.fill()
        ctx.strokeStyle = '#E5E7EB'
        ctx.lineWidth = 3
        ctx.stroke()

        // 中心文字
        ctx.fillStyle = '#1F2937'
        ctx.font = 'bold 12px Inter, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('GO', 0, 0)

        ctx.restore()

        // 绘制指针
        ctx.beginPath()
        ctx.moveTo(centerX, 20)
        ctx.lineTo(centerX - 15, 0)
        ctx.lineTo(centerX + 15, 0)
        ctx.closePath()
        ctx.fillStyle = '#EF4444'
        ctx.fill()
    }, [displayFoods, rotation])

    // 旋转动画
    useEffect(() => {
        if (!isSpinning) return

        let animationId: number
        const startTime = Date.now()
        const duration = 3000 // 3秒
        const totalRotation = 1440 + Math.random() * 720 // 4-6圈

        const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)

            // 缓动函数: ease-out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3)

            setRotation(easeOut * totalRotation)

            if (progress < 1) {
                animationId = requestAnimationFrame(animate)
            }
        }

        animationId = requestAnimationFrame(animate)

        return () => {
            cancelAnimationFrame(animationId)
        }
    }, [isSpinning])

    return (
        <div className="relative inline-block">
            {/* 转盘 */}
            <canvas
                ref={canvasRef}
                width={280}
                height={280}
                className="transition-transform"
                style={{
                    filter: isSpinning ? 'blur(0.5px)' : 'none',
                }}
            />

            {/* 结果展示 */}
            {showResult && result && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div
                        className="bg-white rounded-2xl shadow-2xl p-6 text-center animate-bounce-in"
                        style={{
                            animation: 'bounceIn 0.5s ease-out',
                        }}
                    >
                        <div className="text-6xl mb-3">{result.emoji}</div>
                        <div className="text-xl font-bold text-[var(--hf-text)]">{result.name}</div>
                        <div className="text-sm text-[var(--hf-text-muted)] mt-1">
                            {result.tags.includes('spicy') && '🌶️ '}
                            {result.tags.includes('cheap') && '💰 '}
                            {result.tags.includes('healthy') && '💪 '}
                        </div>
                    </div>
                </div>
            )}

            {/* 空状态 */}
            {displayFoods.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-[var(--hf-text-muted)]">
                        <div className="text-4xl mb-2">🤔</div>
                        <p className="text-sm">没有匹配的美食</p>
                        <p className="text-xs">试试调整筛选条件</p>
                    </div>
                </div>
            )}

            <style jsx>{`
        @keyframes bounceIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
        </div>
    )
}
