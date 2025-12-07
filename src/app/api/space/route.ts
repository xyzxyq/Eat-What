import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// 获取情侣空间信息
export async function GET() {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const coupleSpace = await prisma.coupleSpace.findUnique({
            where: { id: session.coupleSpaceId }
        })

        return NextResponse.json({
            startDate: coupleSpace?.startDate || null
        })
    } catch (error) {
        console.error('Get space error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// 更新开始日期
export async function PUT(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { startDate } = await request.json()

        const coupleSpace = await prisma.coupleSpace.update({
            where: { id: session.coupleSpaceId },
            data: { startDate: startDate ? new Date(startDate) : null }
        })

        return NextResponse.json({
            success: true,
            startDate: coupleSpace.startDate
        })
    } catch (error) {
        console.error('Update start date error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
