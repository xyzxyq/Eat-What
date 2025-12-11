import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

// PUT - Update wish content or completion status
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSessionFromRequest(request)
        if (!session?.coupleSpaceId || !session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const { content, isCompleted } = await request.json()

        // Verify the wish belongs to this couple space
        const existingWish = await prisma.wish.findFirst({
            where: {
                id,
                coupleSpaceId: session.coupleSpaceId
            }
        })

        if (!existingWish) {
            return NextResponse.json({ error: 'Wish not found' }, { status: 404 })
        }

        const updateData: { content?: string; isCompleted?: boolean; lastEditedById?: string } = {}

        if (content !== undefined) {
            updateData.content = content.trim()
            updateData.lastEditedById = session.userId
        }

        if (isCompleted !== undefined) {
            updateData.isCompleted = isCompleted
        }

        const wish = await prisma.wish.update({
            where: { id },
            data: updateData,
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
                },
                _count: {
                    select: { comments: true }
                }
            }
        })

        return NextResponse.json(wish)
    } catch (error) {
        console.error('Error updating wish:', error)
        return NextResponse.json({ error: 'Failed to update wish' }, { status: 500 })
    }
}

// DELETE - Delete a wish
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSessionFromRequest(request)
        if (!session?.coupleSpaceId || !session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        // Verify the wish belongs to this couple space
        const existingWish = await prisma.wish.findFirst({
            where: {
                id,
                coupleSpaceId: session.coupleSpaceId
            }
        })

        if (!existingWish) {
            return NextResponse.json({ error: 'Wish not found' }, { status: 404 })
        }

        await prisma.wish.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting wish:', error)
        return NextResponse.json({ error: 'Failed to delete wish' }, { status: 500 })
    }
}
