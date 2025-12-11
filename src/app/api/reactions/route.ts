import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

const ALLOWED_EMOJIS = ['👍', '❤️', '😂', '😢', '😮', '🔥']

// 获取日记的表情反应
export async function GET(request: NextRequest) {
    try {
        const session = await getSessionFromRequest(request)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const momentId = searchParams.get('momentId')

        if (!momentId) {
            return NextResponse.json({ error: 'momentId is required' }, { status: 400 })
        }

        const reactions = await prisma.reaction.findMany({
            where: { momentId },
            include: { user: true }
        })

        // 按 emoji 分组统计
        const grouped: Record<string, { count: number; users: string[]; hasReacted: boolean }> = {}
        for (const reaction of reactions) {
            if (!grouped[reaction.emoji]) {
                grouped[reaction.emoji] = { count: 0, users: [], hasReacted: false }
            }
            grouped[reaction.emoji].count++
            grouped[reaction.emoji].users.push(reaction.user.nickname)
            if (reaction.userId === session.userId) {
                grouped[reaction.emoji].hasReacted = true
            }
        }

        return NextResponse.json({ reactions: grouped })
    } catch (error) {
        console.error('Get reactions error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// 添加/取消表情反应
export async function POST(request: NextRequest) {
    try {
        const session = await getSessionFromRequest(request)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { momentId, emoji } = await request.json()

        if (!momentId || !emoji) {
            return NextResponse.json({ error: 'momentId and emoji required' }, { status: 400 })
        }

        if (!ALLOWED_EMOJIS.includes(emoji)) {
            return NextResponse.json({ error: '不支持的表情' }, { status: 400 })
        }

        // 检查是否已存在
        const existing = await prisma.reaction.findUnique({
            where: {
                momentId_userId_emoji: {
                    momentId,
                    userId: session.userId,
                    emoji
                }
            }
        })

        if (existing) {
            // 取消反应
            await prisma.reaction.delete({ where: { id: existing.id } })
            return NextResponse.json({ success: true, action: 'removed' })
        } else {
            // 添加反应
            await prisma.reaction.create({
                data: {
                    emoji,
                    momentId,
                    userId: session.userId
                }
            })
            return NextResponse.json({ success: true, action: 'added' })
        }
    } catch (error) {
        console.error('Toggle reaction error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
