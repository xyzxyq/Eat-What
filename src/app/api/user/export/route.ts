import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

// GET - 导出用户数据
export async function GET(request: NextRequest) {
    try {
        const session = await getSessionFromRequest(request)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 获取用户信息
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: {
                nickname: true,
                displayName: true,
                email: true,
                createdAt: true,
            }
        })

        // 获取所有日记
        const moments = await prisma.moment.findMany({
            where: { userId: session.userId },
            orderBy: { momentDate: 'desc' },
            select: {
                content: true,
                mediaUrl: true,
                mediaType: true,
                momentDate: true,
                createdAt: true,
            }
        })

        // 获取所有评论
        const comments = await prisma.comment.findMany({
            where: { userId: session.userId },
            orderBy: { createdAt: 'desc' },
            select: {
                content: true,
                createdAt: true,
            }
        })

        // 获取创建的心愿
        const wishes = await prisma.wish.findMany({
            where: { createdById: session.userId },
            orderBy: { createdAt: 'desc' },
            select: {
                content: true,
                isCompleted: true,
                createdAt: true,
            }
        })

        // 构建导出数据
        const exportData = {
            exportedAt: new Date().toISOString(),
            user: {
                nickname: user?.nickname,
                displayName: user?.displayName,
                email: user?.email,
                joinedAt: user?.createdAt,
            },
            statistics: {
                totalMoments: moments.length,
                totalComments: comments.length,
                totalWishes: wishes.length,
            },
            moments: moments.map(m => ({
                date: m.momentDate,
                content: m.content,
                hasMedia: !!m.mediaUrl,
                mediaType: m.mediaType,
            })),
            comments: comments.map(c => ({
                content: c.content,
                createdAt: c.createdAt,
            })),
            wishes: wishes.map(w => ({
                content: w.content,
                isCompleted: w.isCompleted,
                createdAt: w.createdAt,
            })),
        }

        // 返回 JSON 文件
        return new NextResponse(JSON.stringify(exportData, null, 2), {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="eat_what_export_${new Date().toISOString().split('T')[0]}.json"`,
            },
        })
    } catch (error) {
        console.error('Export data error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
