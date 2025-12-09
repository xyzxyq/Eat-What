import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - 获取用户设置
export async function GET() {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: {
                id: true,
                nickname: true,
                displayName: true,
                avatarEmoji: true,
                avatarUrl: true,
                email: true,
                isEmailVerified: true,
                status: true,
                notifyOnMoment: true,
                notifyOnComment: true,
                notifyOnWish: true,
                notifyOnSecretWishRequest: true,
                notifyOnSecretWishResponse: true,
            }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // 获取伴侣信息用于显示
        const partner = await prisma.user.findFirst({
            where: {
                coupleSpaceId: session.coupleSpaceId,
                id: { not: session.userId }
            },
            select: {
                displayName: true,
                nickname: true
            }
        })

        // 隐藏邮箱中间部分
        const maskedEmail = user.email
            ? user.email.replace(/(.{3})(.*)(@.*)/, '$1****$3')
            : null

        return NextResponse.json({
            ...user,
            email: maskedEmail,
            partnerName: partner?.displayName || partner?.nickname || '伴侣'
        })
    } catch (error) {
        console.error('Get settings error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// PUT - 更新用户设置
export async function PUT(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const {
            displayName,
            avatarEmoji,
            status,
            notifyOnMoment,
            notifyOnComment,
            notifyOnWish,
            notifyOnSecretWishRequest,
            notifyOnSecretWishResponse
        } = body

        // 构建更新数据
        const updateData: Record<string, unknown> = {}

        if (displayName !== undefined) updateData.displayName = displayName
        if (avatarEmoji !== undefined) updateData.avatarEmoji = avatarEmoji
        if (status !== undefined) updateData.status = status
        if (notifyOnMoment !== undefined) updateData.notifyOnMoment = notifyOnMoment
        if (notifyOnComment !== undefined) updateData.notifyOnComment = notifyOnComment
        if (notifyOnWish !== undefined) updateData.notifyOnWish = notifyOnWish
        if (notifyOnSecretWishRequest !== undefined) updateData.notifyOnSecretWishRequest = notifyOnSecretWishRequest
        if (notifyOnSecretWishResponse !== undefined) updateData.notifyOnSecretWishResponse = notifyOnSecretWishResponse

        const user = await prisma.user.update({
            where: { id: session.userId },
            data: updateData,
            select: {
                id: true,
                nickname: true,
                displayName: true,
                avatarEmoji: true,
                status: true,
                notifyOnMoment: true,
                notifyOnComment: true,
                notifyOnWish: true,
                notifyOnSecretWishRequest: true,
                notifyOnSecretWishResponse: true,
            }
        })

        return NextResponse.json({ success: true, user })
    } catch (error) {
        console.error('Update settings error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
