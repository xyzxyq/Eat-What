import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { generateVerificationCode, sendVerificationEmail } from '@/lib/email'

// POST - 发起更换邮箱请求（发送验证码到新邮箱）
export async function POST(request: NextRequest) {
    try {
        const session = await getSessionFromRequest(request)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { newEmail } = await request.json()

        if (!newEmail || !newEmail.includes('@')) {
            return NextResponse.json(
                { error: '请输入有效的邮箱地址' },
                { status: 400 }
            )
        }

        // 检查新邮箱是否已被使用
        const existingUser = await prisma.user.findFirst({
            where: {
                email: newEmail,
                id: { not: session.userId }
            }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: '该邮箱已被其他用户绑定' },
                { status: 400 }
            )
        }

        // 检查发送频率（60秒内只能发送一次）
        const recentVerification = await prisma.emailVerification.findFirst({
            where: {
                userId: session.userId,
                email: newEmail,
                createdAt: { gte: new Date(Date.now() - 60 * 1000) }
            }
        })

        if (recentVerification) {
            return NextResponse.json(
                { error: '请等待60秒后再试' },
                { status: 429 }
            )
        }

        // 生成验证码
        const code = generateVerificationCode()

        // 保存验证码
        await prisma.emailVerification.create({
            data: {
                email: newEmail,
                code,
                userId: session.userId,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10分钟有效
            }
        })

        // 发送验证邮件
        const result = await sendVerificationEmail(newEmail, code)

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || '邮件发送失败' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: '验证码已发送到新邮箱'
        })
    } catch (error) {
        console.error('Change email error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// PUT - 验证并更换邮箱
export async function PUT(request: NextRequest) {
    try {
        const session = await getSessionFromRequest(request)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { newEmail, code } = await request.json()

        if (!newEmail || !code) {
            return NextResponse.json(
                { error: '请提供邮箱和验证码' },
                { status: 400 }
            )
        }

        // 查找有效的验证码
        const verification = await prisma.emailVerification.findFirst({
            where: {
                userId: session.userId,
                email: newEmail,
                code,
                expiresAt: { gte: new Date() }
            }
        })

        if (!verification) {
            return NextResponse.json(
                { error: '验证码无效或已过期' },
                { status: 400 }
            )
        }

        // 更新用户邮箱
        await prisma.user.update({
            where: { id: session.userId },
            data: {
                email: newEmail,
                isEmailVerified: true
            }
        })

        // 清理验证码
        await prisma.emailVerification.deleteMany({
            where: { userId: session.userId }
        })

        return NextResponse.json({
            success: true,
            message: '邮箱更换成功'
        })
    } catch (error) {
        console.error('Verify new email error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
