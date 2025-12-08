import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session || !session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const secretWishes = await prisma.secretWish.findMany({
            where: {
                coupleSpaceId: session.coupleSpaceId
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        nickname: true,
                        displayName: true,
                        avatarUrl: true,
                        avatarEmoji: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Process wishes to hide content for partner unless revealed
        const processedWishes = secretWishes.map(wish => {
            if (wish.createdById === session.userId) {
                // Own wish: show everything
                return wish
            } else {
                // Partner's wish
                if (wish.isRevealed) {
                    return wish
                } else {
                    // Hide content
                    return {
                        ...wish,
                        content: '🔒 这是一个秘密心愿',
                        isHidden: true
                    }
                }
            }
        })

        return NextResponse.json(processedWishes)
    } catch (error) {
        console.error('Error fetching secret wishes:', error)
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
        const { content, emoji = '🎁' } = body

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 })
        }

        const secretWish = await prisma.secretWish.create({
            data: {
                content,
                emoji,
                coupleSpaceId: session.coupleSpaceId,
                createdById: session.userId
            }
        })

        return NextResponse.json(secretWish)
    } catch (error) {
        console.error('Error creating secret wish:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
