import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// 获取所有日记
export async function GET() {
    try {
        const session = await getSession()
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
        const session = await getSession()
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
