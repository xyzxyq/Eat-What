import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session || !session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get start and end of today
        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date()
        endOfDay.setHours(23, 59, 59, 999)

        // Check recent requests made by me
        const todaysRequest = await prisma.wishRevealRequest.findFirst({
            where: {
                requesterId: session.userId,
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Check requests received by me (pending only)
        const receivedRequests = await prisma.wishRevealRequest.findMany({
            where: {
                targetUserId: session.userId,
                status: 'pending'
            },
            include: {
                requester: {
                    select: {
                        id: true,
                        nickname: true,
                        displayName: true,
                        avatarEmoji: true
                    }
                },
                secretWish: {
                    select: {
                        id: true,
                        emoji: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json({
            hasRequestedToday: !!todaysRequest,
            request: todaysRequest,
            receivedRequests
        })
    } catch (error) {
        console.error('Error checking reveal requests:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session || !session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { targetUserId, secretWishId } = body

        if (!targetUserId) {
            return NextResponse.json({ error: 'Target user required' }, { status: 400 })
        }

        // 1. Check daily limit
        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)

        const existingCount = await prisma.wishRevealRequest.count({
            where: {
                requesterId: session.userId,
                createdAt: {
                    gte: startOfDay
                }
            }
        })

        if (existingCount >= 1) {
            return NextResponse.json({ error: 'Daily limit reached' }, { status: 429 })
        }

        // 2. If random request (secretWishId is null/undefined), find a random unrevealed wish
        let finalSecretWishId = secretWishId

        if (!finalSecretWishId) {
            const availableWishes = await prisma.secretWish.findMany({
                where: {
                    createdById: targetUserId,
                    isRevealed: false
                },
                select: { id: true }
            })

            if (availableWishes.length === 0) {
                return NextResponse.json({ error: 'No secret wishes available to reveal' }, { status: 404 })
            }

            const randomIndex = Math.floor(Math.random() * availableWishes.length)
            finalSecretWishId = availableWishes[randomIndex].id
        }

        // 3. Create request
        const newRequest = await prisma.wishRevealRequest.create({
            data: {
                requesterId: session.userId,
                targetUserId: targetUserId,
                secretWishId: finalSecretWishId,
                coupleSpaceId: session.coupleSpaceId,
                status: 'pending'
            }
        })

        return NextResponse.json(newRequest)
    } catch (error) {
        console.error('Error creating reveal request:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
