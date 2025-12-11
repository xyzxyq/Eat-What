import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 获取今日日期字符串
function getTodayString(): string {
    const now = new Date()
    return now.toISOString().split('T')[0]
}

// GET: 获取今日想你状态
// myCount: 我今天想伴侣多少次
// partnerMissYou: 伴侣今天想我多少次
export async function GET(request: NextRequest) {
    try {
        const session = await getSessionFromRequest(request)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const today = getTodayString()

        // 获取伴侣信息
        const partner = await prisma.user.findFirst({
            where: {
                coupleSpaceId: session.coupleSpaceId,
                id: { not: session.userId }
            },
            select: { id: true, displayName: true, nickname: true }
        })

        if (!partner) {
            return NextResponse.json({
                myCount: 0,
                partnerMissYou: null
            })
        }

        // myCount: 我今天点击伴侣头像的次数（targetUserId = 伴侣ID，fromUserId = 我的ID）
        const myMissYouRecord = await prisma.missYou.findUnique({
            where: {
                date_userId: {
                    date: today,
                    userId: partner.id  // 记录目标是伴侣
                }
            }
        })

        // partnerMissYou: 伴侣今天点击我头像的次数（targetUserId = 我的ID，fromUserId = 伴侣ID）
        const partnerMissYouRecord = await prisma.missYou.findUnique({
            where: {
                date_userId: {
                    date: today,
                    userId: session.userId  // 记录目标是我
                }
            }
        })

        return NextResponse.json({
            myCount: myMissYouRecord?.count || 0,
            partnerMissYou: partnerMissYouRecord ? {
                count: partnerMissYouRecord.count,
                fromName: partner.nickname  // 显示爱称
            } : null
        })

    } catch (error) {
        console.error('Get miss-you status error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

// POST: 点击伴侣头像，给伴侣的记录+1
// 意思是：我想你（伴侣）+1
export async function POST(request: NextRequest) {
    try {
        const session = await getSessionFromRequest(request)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const today = getTodayString()

        // 获取伴侣信息
        const partner = await prisma.user.findFirst({
            where: {
                coupleSpaceId: session.coupleSpaceId,
                id: { not: session.userId }
            },
            select: { id: true, displayName: true, nickname: true }
        })

        if (!partner) {
            return NextResponse.json({ error: 'No partner found' }, { status: 400 })
        }

        // 对伴侣的记录+1（表示我想伴侣）
        const missYou = await prisma.missYou.upsert({
            where: {
                date_userId: {
                    date: today,
                    userId: partner.id  // 目标是伴侣
                }
            },
            update: {
                count: { increment: 1 }
            },
            create: {
                date: today,
                count: 1,
                userId: partner.id,  // 目标是伴侣
                coupleSpaceId: session.coupleSpaceId
            }
        })

        const loveName = partner.nickname || 'TA'  // 显示爱称

        return NextResponse.json({
            success: true,
            count: missYou.count,
            message: `想${loveName} +1 💕`
        })

    } catch (error) {
        console.error('Miss-you error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
