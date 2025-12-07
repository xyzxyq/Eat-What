import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// POST - Increment vote count (unlimited)
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession()
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

        // Upsert vote - create if not exists, increment if exists
        const vote = await prisma.wishVote.upsert({
            where: {
                wishId_userId: {
                    wishId,
                    userId: session.userId
                }
            },
            update: {
                count: { increment: 1 }
            },
            create: {
                wishId,
                userId: session.userId,
                count: 1
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

        return NextResponse.json({ vote, newCount: vote.count })
    } catch (error) {
        console.error('Error incrementing vote:', error)
        return NextResponse.json({ error: 'Failed to increment vote' }, { status: 500 })
    }
}
