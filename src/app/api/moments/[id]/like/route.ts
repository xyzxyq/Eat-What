import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

// 特殊数字及其含义
const SPECIAL_NUMBERS: { [key: number]: { message: string; emoji: string } } = {
    21: { message: '爱你', emoji: '💕' },
    52: { message: '我爱你', emoji: '💘' },
    99: { message: '长长久久', emoji: '💝' },
    131: { message: '一生一世', emoji: '💗' },
    520: { message: '我爱你', emoji: '🎉' },
    1314: { message: '一生一世', emoji: '💖' },
}

// POST - 点赞（每次+1）
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSessionFromRequest(request)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        // 验证日记存在
        const moment = await prisma.moment.findUnique({ where: { id } })

        if (!moment) {
            return NextResponse.json({ error: '日记不存在' }, { status: 404 })
        }

        // 增加点赞数
        const updated = await prisma.moment.update({
            where: { id },
            data: { likeCount: { increment: 1 } }
        })

        const newCount = updated.likeCount

        // 检查是否达到特殊数字
        const special = SPECIAL_NUMBERS[newCount]

        return NextResponse.json({
            success: true,
            likeCount: newCount,
            special: special || null
        })
    } catch (error) {
        console.error('Like moment error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// GET - 获取点赞数
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSessionFromRequest(request)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        const moment = await prisma.moment.findUnique({
            where: { id },
            select: { likeCount: true }
        })

        if (!moment) {
            return NextResponse.json({ error: '日记不存在' }, { status: 404 })
        }

        return NextResponse.json({ likeCount: moment.likeCount })
    } catch (error) {
        console.error('Get like count error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
