import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createToken, verifyTempToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
    try {
        const { tempToken, password, isSetup } = await request.json()

        // 验证临时令牌
        if (!tempToken) {
            return NextResponse.json(
                { error: '缺少认证信息 🔐', expired: true },
                { status: 400 }
            )
        }

        const tokenPayload = await verifyTempToken(tempToken)
        if (!tokenPayload) {
            return NextResponse.json(
                { error: '会话已过期，请重新登录 ⏰', expired: true },
                { status: 401 }
            )
        }

        // 验证密码
        if (!password) {
            return NextResponse.json(
                { error: '请输入密码 🔑' },
                { status: 400 }
            )
        }

        // 获取用户信息
        const user = await prisma.user.findUnique({
            where: { id: tokenPayload.userId }
        })

        if (!user) {
            return NextResponse.json(
                { error: '用户不存在 😢', expired: true },
                { status: 404 }
            )
        }

        // 设置密码模式
        if (isSetup) {
            if (password.length < 6) {
                return NextResponse.json(
                    { error: '密码长度至少6位 🔐' },
                    { status: 400 }
                )
            }

            // 哈希密码并保存
            const passwordHash = await bcrypt.hash(password, 10)
            await prisma.user.update({
                where: { id: user.id },
                data: { passwordHash }
            })
        } else {
            // 验证密码模式
            if (!user.passwordHash) {
                return NextResponse.json(
                    { error: '账户尚未设置密码，请先设置 🔐' },
                    { status: 400 }
                )
            }

            const isValid = await bcrypt.compare(password, user.passwordHash)
            if (!isValid) {
                return NextResponse.json(
                    { error: '密码不正确 💔' },
                    { status: 401 }
                )
            }
        }

        // 创建正式的认证令牌
        const token = await createToken({
            userId: user.id,
            nickname: user.nickname,
            coupleSpaceId: tokenPayload.coupleSpaceId
        })

        const response = NextResponse.json({
            success: true,
            message: isSetup ? '🎉 密码设置成功！' : '💕 欢迎回来！'
        })

        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60
        })

        return response

    } catch (error) {
        console.error('Password auth error:', error)
        return NextResponse.json(
            { error: '服务器开小差了，请稍后再试 😢' },
            { status: 500 }
        )
    }
}
