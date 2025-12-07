import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { wishes } = await request.json()

        if (!wishes || !Array.isArray(wishes) || wishes.length === 0) {
            return NextResponse.json({ error: 'No wishes provided' }, { status: 400 })
        }

        // 限制单次导入数量
        if (wishes.length > 50) {
            return NextResponse.json(
                { error: '单次最多导入 50 条心愿哦 ✨' },
                { status: 400 }
            )
        }

        // 过滤空白行并去重
        const validWishes = [...new Set(
            wishes
                .map((w: string) => w.trim())
                .filter((w: string) => w.length > 0 && w.length <= 200)
        )]

        if (validWishes.length === 0) {
            return NextResponse.json({ error: 'No valid wishes' }, { status: 400 })
        }

        // 批量创建心愿
        const createdWishes = await prisma.wish.createMany({
            data: validWishes.map((content: string) => ({
                content,
                coupleSpaceId: session.coupleSpaceId,
                createdById: session.userId
            }))
        })

        return NextResponse.json({
            success: true,
            count: createdWishes.count,
            message: `成功导入 ${createdWishes.count} 条心愿 🎉`
        })
    } catch (error) {
        console.error('Batch import error:', error)
        return NextResponse.json({ error: 'Import failed' }, { status: 500 })
    }
}
