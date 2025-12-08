import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - 获取所有纪念日
export async function GET() {
    try {
        const session = await getSession()
        if (!session?.coupleSpaceId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const anniversaries = await prisma.anniversary.findMany({
            where: { coupleSpaceId: session.coupleSpaceId },
            orderBy: { createdAt: 'asc' }
        })

        return NextResponse.json({ anniversaries })
    } catch (error) {
        console.error('Get anniversaries error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// POST - 创建新纪念日
export async function POST(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session?.coupleSpaceId || !session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { title, date, emoji, type, isRecurring } = await request.json()

        if (!title || !date) {
            return NextResponse.json({ error: '标题和日期不能为空' }, { status: 400 })
        }

        const anniversary = await prisma.anniversary.create({
            data: {
                title,
                date: new Date(date),
                emoji: emoji || '💕',
                type: type || 'countdown',
                isRecurring: isRecurring || false,
                coupleSpaceId: session.coupleSpaceId,
                createdById: session.userId
            }
        })

        return NextResponse.json({ success: true, anniversary }, { status: 201 })
    } catch (error) {
        console.error('Create anniversary error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// PUT - 更新纪念日
export async function PUT(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session?.coupleSpaceId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id, title, date, emoji, type, isRecurring } = await request.json()

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 })
        }

        // 验证纪念日属于当前空间
        const existing = await prisma.anniversary.findFirst({
            where: { id, coupleSpaceId: session.coupleSpaceId }
        })

        if (!existing) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        const anniversary = await prisma.anniversary.update({
            where: { id },
            data: {
                title: title ?? existing.title,
                date: date ? new Date(date) : existing.date,
                emoji: emoji ?? existing.emoji,
                type: type ?? existing.type,
                isRecurring: isRecurring ?? existing.isRecurring
            }
        })

        return NextResponse.json({ success: true, anniversary })
    } catch (error) {
        console.error('Update anniversary error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// DELETE - 删除纪念日
export async function DELETE(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session?.coupleSpaceId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 })
        }

        // 验证纪念日属于当前空间
        const existing = await prisma.anniversary.findFirst({
            where: { id, coupleSpaceId: session.coupleSpaceId }
        })

        if (!existing) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        await prisma.anniversary.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete anniversary error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
