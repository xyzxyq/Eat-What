import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { sendPartnerNotification } from '@/lib/email'

// 获取日记的评论
export async function GET(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const momentId = searchParams.get('momentId')

        if (!momentId) {
            return NextResponse.json({ error: 'momentId is required' }, { status: 400 })
        }

        const comments = await prisma.comment.findMany({
            where: { momentId, parentId: null },
            include: {
                user: true,
                replies: {
                    include: { user: true },
                    orderBy: { createdAt: 'asc' }
                }
            },
            orderBy: { createdAt: 'asc' }
        })

        return NextResponse.json({ comments })
    } catch (error) {
        console.error('Get comments error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// 添加评论
export async function POST(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { momentId, content, parentId } = await request.json()

        if (!momentId || !content?.trim()) {
            return NextResponse.json({ error: '内容不能为空' }, { status: 400 })
        }

        const comment = await prisma.comment.create({
            data: {
                content: content.trim(),
                momentId,
                userId: session.userId,
                parentId: parentId || null
            },
            include: { user: true }
        })

        // 异步发送通知给日记作者
        sendCommentNotification(momentId, session.userId, comment.user, content.trim())

        return NextResponse.json({ success: true, comment })
    } catch (error) {
        console.error('Create comment error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// 删除评论
export async function DELETE(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const commentId = searchParams.get('id')

        if (!commentId) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 })
        }

        // 只能删除自己的评论
        const comment = await prisma.comment.findUnique({ where: { id: commentId } })
        if (!comment || comment.userId !== session.userId) {
            return NextResponse.json({ error: '无权删除' }, { status: 403 })
        }

        await prisma.comment.delete({ where: { id: commentId } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete comment error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// 异步发送评论通知
async function sendCommentNotification(
    momentId: string,
    commenterId: string,
    commenter: { displayName: string | null; nickname: string },
    content: string
) {
    try {
        // 查找日记和作者
        const moment = await prisma.moment.findUnique({
            where: { id: momentId },
            include: { user: true }
        })

        // 只有评论伴侣的日记时才发送通知（需要开启评论通知）
        if (moment && moment.userId !== commenterId &&
            moment.user.isEmailVerified && moment.user.email &&
            moment.user.notifyOnComment) {
            await sendPartnerNotification(moment.user.email, {
                type: 'new_comment',
                partnerName: commenter.displayName || commenter.nickname,
                recipientName: moment.user.displayName || moment.user.nickname,
                content
            })
        }
    } catch (e) {
        console.error('Failed to send comment notification:', e)
    }
}

