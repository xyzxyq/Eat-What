import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

/**
 * 验证邮箱验证码并绑定 POST /api/auth/email-verify/verify
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

        const { email, code } = await request.json()

        // 验证输入
        if (!email || !code) {
            return NextResponse.json(
                { error: '邮箱和验证码都是必填的哦 📝' },
                { status: 400 }
            )
        }

        // 查找有效的验证码
        const verification = await prisma.emailVerification.findFirst({
            where: {
                userId: payload.userId,
                email: email,
                code: code,
                expiresAt: { gte: new Date() }
            },
            orderBy: { createdAt: 'desc' }
        })

        if (!verification) {
            return NextResponse.json(
                { error: '验证码无效或已过期，请重新获取 ❌' },
                { status: 400 }
            )
        }

        // 再次检查邮箱是否已被其他用户绑定（防止并发）
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

        // 更新用户邮箱
        await prisma.user.update({
            where: { id: payload.userId },
            data: {
                email: email,
                isEmailVerified: true
            }
        })

        // 清理该用户的所有验证码记录
        await prisma.emailVerification.deleteMany({
            where: { userId: payload.userId }
        })

        return NextResponse.json({
            success: true,
            message: '邮箱绑定成功！欢迎使用 Eat_What 💕'
        })

    } catch (error) {
        console.error('Verify email error:', error)
        return NextResponse.json(
            { error: '服务器开小差了，请稍后再试 😢' },
            { status: 500 }
        )
    }
}
