import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { generateVerificationCode, sendVerificationEmail } from '@/lib/email'

// 验证码有效期（分钟）
const CODE_EXPIRY_MINUTES = 10
// 发送间隔（秒）
const SEND_INTERVAL_SECONDS = 60
// 每小时最大尝试次数
const MAX_ATTEMPTS_PER_HOUR = 5

/**
 * 发送验证码 POST /api/auth/email-verify
 */
export async function POST(request: NextRequest) {
    try {
        // 验证用户登录状态
        const token = request.cookies.get('auth-token')?.value
        if (!token) {
            return NextResponse.json(
                { error: '请先登录 🔐' },
                { status: 401 }
            )
        }

        const payload = await verifyToken(token)
        if (!payload) {
            return NextResponse.json(
                { error: '登录已过期，请重新登录 ⏰' },
                { status: 401 }
            )
        }

        const { email } = await request.json()

        // 验证邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!email || !emailRegex.test(email)) {
            return NextResponse.json(
                { error: '请输入有效的邮箱地址 📧' },
                { status: 400 }
            )
        }

        // 检查邮箱是否已被其他用户绑定
        const existingUser = await prisma.user.findFirst({
            where: {
                email: email,
                id: { not: payload.userId }
            }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: '该邮箱已被其他用户绑定 🚫' },
                { status: 400 }
            )
        }

        // 检查发送频率（60秒内不能重复发送）
        const recentVerification = await prisma.emailVerification.findFirst({
            where: {
                userId: payload.userId,
                createdAt: {
                    gte: new Date(Date.now() - SEND_INTERVAL_SECONDS * 1000)
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        if (recentVerification) {
            const waitSeconds = SEND_INTERVAL_SECONDS -
                Math.floor((Date.now() - recentVerification.createdAt.getTime()) / 1000)
            return NextResponse.json(
                { error: `请等待 ${waitSeconds} 秒后再试 ⏳` },
                { status: 429 }
            )
        }

        // 检查每小时尝试次数
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
        const recentAttempts = await prisma.emailVerification.count({
            where: {
                userId: payload.userId,
                createdAt: { gte: hourAgo }
            }
        })

        if (recentAttempts >= MAX_ATTEMPTS_PER_HOUR) {
            return NextResponse.json(
                { error: '尝试次数过多，请1小时后再试 😅' },
                { status: 429 }
            )
        }

        // 生成验证码
        const code = generateVerificationCode()
        const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000)

        // 保存验证码
        await prisma.emailVerification.create({
            data: {
                email,
                code,
                userId: payload.userId,
                expiresAt
            }
        })

        // 发送邮件
        const result = await sendVerificationEmail(email, code)

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || '邮件发送失败，请稍后重试 📭' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: '验证码已发送到你的邮箱 📧',
            expiresIn: CODE_EXPIRY_MINUTES * 60 // 秒
        })

    } catch (error) {
        console.error('Send verification error:', error)
        return NextResponse.json(
            { error: '服务器开小差了，请稍后再试 😢' },
            { status: 500 }
        )
    }
}
