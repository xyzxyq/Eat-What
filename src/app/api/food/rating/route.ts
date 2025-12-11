import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PUT: 更新评分和备注
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
        const { choiceId, rating, note } = body

        if (!choiceId) {
            return NextResponse.json({ error: 'Choice ID is required' }, { status: 400 })
        }

        // 获取用户信息
        const user = await prisma.user.findUnique({
            where: { id: payload.userId as string },
            include: { coupleSpace: { include: { users: true } } },
        })

        if (!user?.coupleSpace) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // 获取选择记录
        const choice = await prisma.foodChoice.findUnique({
            where: { id: choiceId },
        })

        if (!choice || choice.coupleSpaceId !== user.coupleSpaceId) {
            return NextResponse.json({ error: 'Choice not found' }, { status: 404 })
        }

        // 判断是用户A还是用户B
        const users = user.coupleSpace.users
        const isUserA = users[0]?.id === payload.userId

        // 更新评分和备注
        const updateData: Record<string, unknown> = {}
        if (rating !== undefined) {
            updateData[isUserA ? 'userARating' : 'userBRating'] = rating
        }
        if (note !== undefined) {
            updateData.note = note
        }

        const updatedChoice = await prisma.foodChoice.update({
            where: { id: choiceId },
            data: updateData,
        })

        return NextResponse.json({ success: true, choice: updatedChoice })
    } catch (error) {
        console.error('Update rating error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
