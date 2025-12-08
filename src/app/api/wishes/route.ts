import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { sendPartnerNotification } from '@/lib/email'

// GET - Fetch all wishes with vote counts and comments
export async function GET() {
    try {
        const session = await getSession()
        if (!session?.coupleSpaceId || !session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const wishes = await prisma.wish.findMany({
            where: { coupleSpaceId: session.coupleSpaceId },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        nickname: true,
                        displayName: true,
                        avatarEmoji: true,
                        avatarUrl: true
                    }
                },
                lastEditedBy: {
                    select: {
                        id: true,
                        nickname: true,
                        displayName: true,
                        avatarEmoji: true,
                        avatarUrl: true
                    }
                },
                votes: {
                    select: {
                        id: true,
                        userId: true,
                        count: true,
                        user: {
                            select: {
                                id: true,
                                nickname: true,
                                displayName: true,
                                avatarEmoji: true,
                                avatarUrl: true
                            }
                        }
                    }
                },
                _count: {
                    select: { comments: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        // Get users for reference
        const users = await prisma.user.findMany({
            where: { coupleSpaceId: session.coupleSpaceId },
            select: {
                id: true,
                nickname: true,
                displayName: true,
                avatarEmoji: true,
                avatarUrl: true
            }
        })

        return NextResponse.json({
            wishes,
            users,
            currentUserId: session.userId
        })
    } catch (error) {
        console.error('Error fetching wishes:', error)
        return NextResponse.json({ error: 'Failed to fetch wishes' }, { status: 500 })
    }
}

// POST - Create a new wish
export async function POST(request: Request) {
    try {
        const session = await getSession()
        if (!session?.coupleSpaceId || !session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { content } = await request.json()

        if (!content || content.trim() === '') {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 })
        }

        const wish = await prisma.wish.create({
            data: {
                content: content.trim(),
                coupleSpaceId: session.coupleSpaceId,
                createdById: session.userId
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        nickname: true,
                        displayName: true,
                        avatarEmoji: true,
                        avatarUrl: true
                    }
                },
                votes: true,
                _count: {
                    select: { comments: true }
                }
            }
        })

        // 异步发送通知给伴侣
        sendWishNotification(session.coupleSpaceId, session.userId, content.trim())

        return NextResponse.json(wish, { status: 201 })
    } catch (error) {
        console.error('Error creating wish:', error)
        return NextResponse.json({ error: 'Failed to create wish' }, { status: 500 })
    }
}

// 异步发送心愿通知
async function sendWishNotification(
    coupleSpaceId: string,
    userId: string,
    wishContent: string
) {
    try {
        // 查找伴侣（需要已验证邮箱且开启了心愿通知）
        const partner = await prisma.user.findFirst({
            where: {
                coupleSpaceId,
                id: { not: userId },
                isEmailVerified: true,
                email: { not: null },
                notifyOnWish: true  // 检查是否开启心愿通知
            }
        })

        // 获取当前用户信息
        const currentUser = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (partner?.email && currentUser) {
            await sendPartnerNotification(partner.email, {
                type: 'wish_update',
                partnerName: currentUser.displayName || currentUser.nickname,
                recipientName: partner.displayName || partner.nickname,
                wishTitle: wishContent
            })
        }
    } catch (e) {
        console.error('Failed to send wish notification:', e)
    }
}
