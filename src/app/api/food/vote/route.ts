import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST: 创建投票会话
export async function POST(request: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth-token')?.value

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const payload = await verifyToken(token)
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        // 获取用户的空间ID
        const user = await prisma.user.findUnique({
            where: { id: payload.userId as string },
            select: { coupleSpaceId: true },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // 检查是否有未过期的投票会话
        const existingSession = await prisma.foodVoteSession.findFirst({
            where: {
                coupleSpaceId: user.coupleSpaceId,
                status: 'waiting',
                expiresAt: { gt: new Date() },
            },
        })

        if (existingSession) {
            return NextResponse.json({
                session: existingSession,
                message: 'Existing session found',
            })
        }

        // 创建新投票会话 (30分钟过期)
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000)
        const session = await prisma.foodVoteSession.create({
            data: {
                status: 'waiting',
                userAId: payload.userId as string,
                userAChoice: [],
                userBChoice: [],
                matchedResult: [],
                coupleSpaceId: user.coupleSpaceId,
                expiresAt,
            },
        })

        return NextResponse.json({ success: true, session })
    } catch (error) {
        console.error('Create vote session error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// GET: 获取当前投票会话
export async function GET() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth-token')?.value

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const payload = await verifyToken(token)
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        // 获取用户的空间ID
        const user = await prisma.user.findUnique({
            where: { id: payload.userId as string },
            select: { coupleSpaceId: true },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // 获取最新的投票会话
        const session = await prisma.foodVoteSession.findFirst({
            where: {
                coupleSpaceId: user.coupleSpaceId,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json({
            session,
            isUserA: session?.userAId === payload.userId,
        })
    } catch (error) {
        console.error('Get vote session error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PUT: 提交投票选择
export async function PUT(request: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth-token')?.value

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const payload = await verifyToken(token)
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        const body = await request.json()
        const { sessionId, choices } = body

        if (!sessionId || !choices || !Array.isArray(choices)) {
            return NextResponse.json(
                { error: 'Session ID and choices are required' },
                { status: 400 }
            )
        }

        // 获取用户的空间ID
        const user = await prisma.user.findUnique({
            where: { id: payload.userId as string },
            select: { coupleSpaceId: true },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // 获取当前会话
        const session = await prisma.foodVoteSession.findUnique({
            where: { id: sessionId },
        })

        if (!session || session.coupleSpaceId !== user.coupleSpaceId) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 })
        }

        if (session.status !== 'waiting' || new Date() > session.expiresAt) {
            return NextResponse.json({ error: 'Session expired or completed' }, { status: 400 })
        }

        // 判断是用户A还是用户B
        const isUserA = session.userAId === payload.userId
        const updateData: Record<string, unknown> = {}

        if (isUserA) {
            updateData.userAChoice = choices
        } else {
            updateData.userBId = payload.userId
            updateData.userBChoice = choices
        }

        // 更新会话
        let updatedSession = await prisma.foodVoteSession.update({
            where: { id: sessionId },
            data: updateData,
        })

        // 检查是否双方都已投票，计算匹配结果
        if (
            updatedSession.userAChoice.length > 0 &&
            updatedSession.userBChoice.length > 0
        ) {
            // 计算匹配结果 (找交集)
            const matched = updatedSession.userAChoice.filter(choice =>
                updatedSession.userBChoice.includes(choice)
            )

            // 如果有匹配，随机选一个
            const finalChoice = matched.length > 0
                ? matched[Math.floor(Math.random() * matched.length)]
                : null

            // 更新会话状态
            updatedSession = await prisma.foodVoteSession.update({
                where: { id: sessionId },
                data: {
                    status: 'complete',
                    matchedResult: matched,
                    finalChoice,
                },
            })

            // 如果有最终选择，保存到选择记录
            if (finalChoice) {
                await prisma.foodChoice.create({
                    data: {
                        foodName: finalChoice,
                        foodEmoji: '🎲',
                        category: 'vote',
                        mode: 'vote',
                        coupleSpaceId: user.coupleSpaceId,
                        chooserId: payload.userId as string,
                    },
                })
            }
        }

        return NextResponse.json({
            success: true,
            session: updatedSession,
            isComplete: updatedSession.status === 'complete',
        })
    } catch (error) {
        console.error('Submit vote error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
