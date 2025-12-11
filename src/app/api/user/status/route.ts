import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

// 更新当前用户状态
export async function PUT(request: NextRequest) {
    try {
        const session = await getSessionFromRequest(request)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { status } = await request.json()

        if (typeof status !== 'string' || status.length > 50) {
            return NextResponse.json({ error: '状态不能超过50个字符' }, { status: 400 })
        }

        const user = await prisma.user.update({
            where: { id: session.userId },
            data: { status: status.trim() }
        })

        return NextResponse.json({ success: true, status: user.status })
    } catch (error) {
        console.error('Update status error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
