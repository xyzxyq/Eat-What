import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

// 获取当前用户和伴侣信息
export async function GET(request: NextRequest) {
    try {
        const session = await getSessionFromRequest(request)
        if (!session || !session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 获取当前用户
        const currentUser = await prisma.user.findUnique({
            where: { id: session.userId },
            select: {
                id: true,
                nickname: true,
                displayName: true,
                avatarEmoji: true,
                avatarUrl: true
            }
        })

        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // 获取伴侣 - 通过 CoupleSpace 关联
        let partner = null
        if (session.coupleSpaceId) {
            const coupleSpace = await prisma.coupleSpace.findUnique({
                where: { id: session.coupleSpaceId },
                include: {
                    users: {
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

            if (coupleSpace) {
                partner = coupleSpace.users.find(u => u.id !== session.userId) || null
            }
        }

        return NextResponse.json({
            currentUser,
            partner
        })
    } catch (error) {
        console.error('Get couple info error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
