import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { sendPartnerNotification } from '@/lib/email'

// 获取所有日记
export async function GET(request: NextRequest) {
    try {
        const session = await getSessionFromRequest(request)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const moments = await prisma.moment.findMany({
            where: { coupleSpaceId: session.coupleSpaceId },
            include: { user: true },
            orderBy: { momentDate: 'desc' }
        })

        // 获取空间内的所有用户
        const users = await prisma.user.findMany({
            where: { coupleSpaceId: session.coupleSpaceId }
        })

        return NextResponse.json({ moments, users, currentUserId: session.userId })
    } catch (error) {
        console.error('Get moments error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// 创建新日记
export async function POST(request: NextRequest) {
    try {
        const session = await getSessionFromRequest(request)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { content, mediaUrl, mediaType } = await request.json()

        if (!content || content.trim().length === 0) {
            return NextResponse.json(
                { error: '内容不能为空哦 ✍️' },
                { status: 400 }
            )
        }

        // 获取今天的日期（只保留年月日）
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // 检查今天是否已经发布过
        const existingMoment = await prisma.moment.findUnique({
            where: {
                userId_momentDate: {
                    userId: session.userId,
                    momentDate: today
                }
            }
        })

        if (existingMoment) {
            return NextResponse.json(
                { error: '今天已经记录过啦，明天再来吧！每天一条，更显珍贵 💎' },
                { status: 400 }
            )
        }

        // 创建新日记
        const moment = await prisma.moment.create({
            data: {
                content: content.trim(),
                mediaUrl: mediaUrl || null,
                mediaType: mediaType || 'none',
                userId: session.userId,
                coupleSpaceId: session.coupleSpaceId,
                momentDate: today
            },
            include: { user: true }
        })

        // 异步发送通知给伴侣（不阻塞响应）
        sendNotificationToPartner(session.coupleSpaceId, session.userId, moment.user, content.trim())

        return NextResponse.json({
            success: true,
            message: '📝 今日心情已记录！',
            moment
        })
    } catch (error) {
        console.error('Create moment error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// 异步发送通知（不阻塞主流程）
async function sendNotificationToPartner(
    coupleSpaceId: string,
    userId: string,
    currentUser: { displayName: string | null; nickname: string },
    content: string
) {
    try {
        // 查找伴侣（需要已验证邮箱且开启了日记通知）
        const partner = await prisma.user.findFirst({
            where: {
                coupleSpaceId,
                id: { not: userId },
                isEmailVerified: true,
                email: { not: null },
                notifyOnMoment: true  // 检查是否开启日记通知
            }
        })

        if (partner?.email) {
            await sendPartnerNotification(partner.email, {
                type: 'new_moment',
                partnerName: currentUser.displayName || currentUser.nickname,
                recipientName: partner.displayName || partner.nickname,
                content
            })
        }
    } catch (e) {
        console.error('Failed to send moment notification:', e)
    }
}
