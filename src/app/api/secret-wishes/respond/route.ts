import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PUT(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session || !session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { requestId, status } = body

        if (!requestId || !['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
        }

        // Find request
        const revealRequest = await prisma.wishRevealRequest.findUnique({
            where: { id: requestId },
            include: { secretWish: true }
        })

        if (!revealRequest) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 })
        }

        // Verify ownership (only target user can respond)
        if (revealRequest.targetUserId !== session.userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Update request status
        const updatedRequest = await prisma.wishRevealRequest.update({
            where: { id: requestId },
            data: { status }
        })

        // If approved, reveal the wish
        if (status === 'approved' && revealRequest.secretWishId) {
            await prisma.secretWish.update({
                where: { id: revealRequest.secretWishId },
                data: {
                    isRevealed: true,
                    revealedAt: new Date()
                }
            })
        }

        return NextResponse.json(updatedRequest)
    } catch (error) {
        console.error('Error responding to request:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
