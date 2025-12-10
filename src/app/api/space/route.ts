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
            startDate: coupleSpace?.startDate || null,
            theme: coupleSpace?.theme || 'yellow',
            effectIntensity: coupleSpace?.effectIntensity || 'subtle',
            effectArea: coupleSpace?.effectArea || 'local'
        })
    } catch (error) {
        console.error('Get space error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// 更新空间设置
export async function PUT(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const updateData: Record<string, unknown> = {}

        if ('startDate' in body) {
            updateData.startDate = body.startDate ? new Date(body.startDate) : null
        }

        if ('theme' in body) {
            const validThemes = ['yellow', 'pink', 'blue', 'purple', 'green', 'orange']
            if (validThemes.includes(body.theme)) {
                updateData.theme = body.theme
            }
        }

        if ('effectIntensity' in body) {
            const validIntensities = ['subtle', 'obvious']
            if (validIntensities.includes(body.effectIntensity)) {
                updateData.effectIntensity = body.effectIntensity
            }
        }

        if ('effectArea' in body) {
            const validAreas = ['local', 'fullpage']
            if (validAreas.includes(body.effectArea)) {
                updateData.effectArea = body.effectArea
            }
        }

        const coupleSpace = await prisma.coupleSpace.update({
            where: { id: session.coupleSpaceId },
            data: updateData
        })

        return NextResponse.json({
            success: true,
            startDate: coupleSpace.startDate,
            theme: coupleSpace.theme,
            effectIntensity: coupleSpace.effectIntensity,
            effectArea: coupleSpace.effectArea
        })
    } catch (error) {
        console.error('Update space error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
