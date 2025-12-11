import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: 获取食物选择历史
export async function GET(request: Request) {
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

        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '10')
        const offset = parseInt(searchParams.get('offset') || '0')

        // 获取用户的空间ID
        const user = await prisma.user.findUnique({
            where: { id: payload.userId as string },
            select: { coupleSpaceId: true },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // 获取历史记录
        const choices = await prisma.foodChoice.findMany({
            where: {
                coupleSpaceId: user.coupleSpaceId,
            },
            orderBy: { chosenDate: 'desc' },
            take: limit,
            skip: offset,
        })

        // 获取统计数据
        const totalChoices = await prisma.foodChoice.count({
            where: { coupleSpaceId: user.coupleSpaceId },
        })

        // 获取最常选择的分类
        const categoryStats = await prisma.foodChoice.groupBy({
            by: ['category'],
            where: { coupleSpaceId: user.coupleSpaceId },
            _count: { category: true },
            orderBy: { _count: { category: 'desc' } },
            take: 5,
        })

        // 获取最高评分的食物
        const topRated = await prisma.foodChoice.findMany({
            where: {
                coupleSpaceId: user.coupleSpaceId,
                OR: [
                    { userARating: { not: null } },
                    { userBRating: { not: null } },
                ],
            },
            orderBy: [
                { userARating: 'desc' },
                { userBRating: 'desc' },
            ],
            take: 5,
        })

        return NextResponse.json({
            choices,
            stats: {
                totalChoices,
                categoryStats,
                topRated,
                favoriteCategory: categoryStats[0]?.category || null,
            },
        })
    } catch (error) {
        console.error('Get food history error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
