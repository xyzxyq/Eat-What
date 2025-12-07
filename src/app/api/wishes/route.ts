import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

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

        return NextResponse.json(wish, { status: 201 })
    } catch (error) {
        console.error('Error creating wish:', error)
        return NextResponse.json({ error: 'Failed to create wish' }, { status: 500 })
    }
}
