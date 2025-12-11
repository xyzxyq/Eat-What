import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: 获取食物选项列表
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

        // 获取该空间的自定义食物选项
        const options = await prisma.foodOption.findMany({
            where: {
                coupleSpaceId: user.coupleSpaceId,
                isActive: true,
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json({ options })
    } catch (error) {
        console.error('Get food options error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST: 添加自定义食物选项
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
        const { name, emoji, category, subCategory, tags } = body

        if (!name || !category) {
            return NextResponse.json(
                { error: 'Name and category are required' },
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

        // 创建食物选项
        const option = await prisma.foodOption.create({
            data: {
                name,
                emoji: emoji || '🍽️',
                category,
                subCategory,
                tags: tags || [],
                isPreset: false,
                createdById: payload.userId as string,
                coupleSpaceId: user.coupleSpaceId,
            },
        })

        return NextResponse.json({ success: true, option })
    } catch (error) {
        console.error('Create food option error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE: 删除食物选项 (软删除)
export async function DELETE(request: Request) {
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
        const optionId = searchParams.get('id')

        if (!optionId) {
            return NextResponse.json({ error: 'Option ID is required' }, { status: 400 })
        }

        // 获取用户的空间ID
        const user = await prisma.user.findUnique({
            where: { id: payload.userId as string },
            select: { coupleSpaceId: true },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // 软删除 (设置为不活跃)
        await prisma.foodOption.updateMany({
            where: {
                id: optionId,
                coupleSpaceId: user.coupleSpaceId,
            },
            data: { isActive: false },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete food option error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
