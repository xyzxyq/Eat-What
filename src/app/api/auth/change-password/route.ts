import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function PUT(request: NextRequest) {
    try {
        const session = await getSessionFromRequest(request)
        if (!session) {
            return NextResponse.json(
                { error: '请先登录 🔐' },
                { status: 401 }
            )
        }

        const { currentPassword, newPassword } = await request.json()

        // 验证新密码长度
        if (!newPassword || newPassword.length < 6) {
            return NextResponse.json(
                { error: '新密码长度至少6位 🔐' },
                { status: 400 }
            )
        }

        // 获取用户信息
        const user = await prisma.user.findUnique({
            where: { id: session.userId }
        })

        if (!user) {
            return NextResponse.json(
                { error: '用户不存在 😢' },
                { status: 404 }
            )
        }

        // 如果用户已有密码，需要验证当前密码
        if (user.passwordHash) {
            if (!currentPassword) {
                return NextResponse.json(
                    { error: '请输入当前密码 🔑' },
                    { status: 400 }
                )
            }

            const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
            if (!isValid) {
                return NextResponse.json(
                    { error: '当前密码不正确 💔' },
                    { status: 401 }
                )
            }
        }

        // 哈希新密码并保存
        const passwordHash = await bcrypt.hash(newPassword, 10)
        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash }
        })

        return NextResponse.json({
            success: true,
            message: '密码修改成功 🎉'
        })

    } catch (error) {
        console.error('Change password error:', error)
        return NextResponse.json(
            { error: '服务器开小差了，请稍后再试 😢' },
            { status: 500 }
        )
    }
}
