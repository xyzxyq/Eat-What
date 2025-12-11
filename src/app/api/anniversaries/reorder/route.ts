import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

// PUT - 批量更新排序
export async function PUT(request: NextRequest) {
    try {
        const session = await getSessionFromRequest(request)
        if (!session?.coupleSpaceId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { orders } = await request.json()

        if (!orders || !Array.isArray(orders)) {
            return NextResponse.json({ error: 'Invalid orders' }, { status: 400 })
        }

        // 批量更新排序
        await Promise.all(
            orders.map(({ id, sortOrder }: { id: string; sortOrder: number }) =>
                prisma.anniversary.updateMany({
                    where: { id, coupleSpaceId: session.coupleSpaceId },
                    data: { sortOrder }
                })
            )
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Reorder anniversaries error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
