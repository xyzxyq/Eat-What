import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// PUT - 编辑日记内容
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const { content } = await request.json()

        if (!content || content.trim().length === 0) {
            return NextResponse.json({ error: '内容不能为空' }, { status: 400 })
        }

        // 验证日记存在且属于当前用户
        const moment = await prisma.moment.findUnique({ where: { id } })

        if (!moment) {
            return NextResponse.json({ error: '日记不存在' }, { status: 404 })
        }

        if (moment.userId !== session.userId) {
            return NextResponse.json({ error: '只能编辑自己的日记' }, { status: 403 })
        }

        // 检查是否是今天的日记
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const momentDate = new Date(moment.momentDate)
        momentDate.setHours(0, 0, 0, 0)

        if (today.getTime() !== momentDate.getTime()) {
            return NextResponse.json({ error: '只能编辑今天的日记' }, { status: 403 })
        }

        // 更新日记
        const updated = await prisma.moment.update({
            where: { id },
            data: { content: content.trim() },
            include: { user: true }
        })

        return NextResponse.json({ success: true, moment: updated })
    } catch (error) {
        console.error('Update moment error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// DELETE - 删除日记
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        // 验证日记存在且属于当前用户
        const moment = await prisma.moment.findUnique({ where: { id } })

        if (!moment) {
            return NextResponse.json({ error: '日记不存在' }, { status: 404 })
        }

        if (moment.userId !== session.userId) {
            return NextResponse.json({ error: '只能删除自己的日记' }, { status: 403 })
        }

        // 删除相关数据（评论、反应）
        await prisma.comment.deleteMany({ where: { momentId: id } })
        await prisma.reaction.deleteMany({ where: { momentId: id } })

        // 删除日记
        await prisma.moment.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete moment error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
