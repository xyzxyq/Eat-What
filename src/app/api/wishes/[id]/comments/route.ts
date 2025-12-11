import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

// GET - Fetch comments for a wish with nested structure
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSessionFromRequest(request)
        if (!session?.coupleSpaceId || !session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id: wishId } = await params

        // Verify the wish belongs to this couple space
        const wish = await prisma.wish.findFirst({
            where: {
                id: wishId,
                coupleSpaceId: session.coupleSpaceId
            }
        })

        if (!wish) {
            return NextResponse.json({ error: 'Wish not found' }, { status: 404 })
        }

        // Get top-level comments with their replies (one level deep, client handles deeper nesting)
        const comments = await prisma.wishComment.findMany({
            where: {
                wishId,
                parentId: null // Only top-level comments
            },
            include: {
                user: {
                    select: {
                        id: true,
                        nickname: true,
                        displayName: true,
                        avatarEmoji: true,
                        avatarUrl: true
                    }
                },
                replies: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                nickname: true,
                                displayName: true,
                                avatarEmoji: true,
                                avatarUrl: true
                            }
                        },
                        replies: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        nickname: true,
                                        displayName: true,
                                        avatarEmoji: true,
                                        avatarUrl: true
                                    }
                                },
                                replies: {
                                    include: {
                                        user: {
                                            select: {
                                                id: true,
                                                nickname: true,
                                                displayName: true,
                                                avatarEmoji: true,
                                                avatarUrl: true
                                            }
                                        }
                                    },
                                    orderBy: { createdAt: 'asc' }
                                }
                            },
                            orderBy: { createdAt: 'asc' }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            },
            orderBy: { createdAt: 'asc' }
        })

        return NextResponse.json(comments)
    } catch (error) {
        console.error('Error fetching comments:', error)
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
    }
}

// POST - Add a comment
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSessionFromRequest(request)
        if (!session?.coupleSpaceId || !session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id: wishId } = await params
        const { content, parentId } = await request.json()

        if (!content || content.trim() === '') {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 })
        }

        // Verify the wish belongs to this couple space
        const wish = await prisma.wish.findFirst({
            where: {
                id: wishId,
                coupleSpaceId: session.coupleSpaceId
            }
        })

        if (!wish) {
            return NextResponse.json({ error: 'Wish not found' }, { status: 404 })
        }

        // If parentId provided, verify it exists
        if (parentId) {
            const parentComment = await prisma.wishComment.findFirst({
                where: {
                    id: parentId,
                    wishId
                }
            })
            if (!parentComment) {
                return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 })
            }
        }

        const comment = await prisma.wishComment.create({
            data: {
                content: content.trim(),
                wishId,
                userId: session.userId,
                parentId: parentId || null
            },
            include: {
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
        })

        return NextResponse.json(comment, { status: 201 })
    } catch (error) {
        console.error('Error creating comment:', error)
        return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
    }
}
