import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

// PUT - 置顶/取消置顶某个纪念日
export async function PUT(request: NextRequest) {
    try {
        const session = await getSessionFromRequest(request)
        if (!session?.coupleSpaceId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await request.json()

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 })
        }

        // 验证纪念日属于当前空间
        const anniversary = await prisma.anniversary.findFirst({
            where: { id, coupleSpaceId: session.coupleSpaceId }
        })

        if (!anniversary) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        // 如果当前已置顶，则取消置顶
        if (anniversary.isPinned) {
            await prisma.anniversary.update({
                where: { id },
                data: { isPinned: false }
            })
            return NextResponse.json({ success: true, isPinned: false })
        }

        // 否则，先取消其他所有置顶，再置顶当前项
        await prisma.anniversary.updateMany({
            where: { coupleSpaceId: session.coupleSpaceId, isPinned: true },
            data: { isPinned: false }
        })

        await prisma.anniversary.update({
            where: { id },
            data: { isPinned: true }
        })

        return NextResponse.json({ success: true, isPinned: true })
    } catch (error) {
        console.error('Pin anniversary error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
