import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST: 保存随机选择结果
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

        const body = await request.json()
        const { foodName, foodEmoji, category } = body

        if (!foodName || !category) {
            return NextResponse.json(
                { error: 'Food name and category are required' },
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

        // 创建选择记录
        const choice = await prisma.foodChoice.create({
            data: {
                foodName,
                foodEmoji: foodEmoji || '🍽️',
                category,
                mode: 'random',
                chooserId: payload.userId as string,
                coupleSpaceId: user.coupleSpaceId,
            },
        })

        return NextResponse.json({ success: true, choice })
    } catch (error) {
        console.error('Spin save error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
