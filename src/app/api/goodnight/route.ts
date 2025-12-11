import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 获取今晚日期字符串
function getGoodnightDateString(): string {
    const now = new Date()
    const hour = now.getHours()
    if (hour < 6) {
        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)
        return yesterday.toISOString().split('T')[0]
    }
    return now.toISOString().split('T')[0]
}

// 获取本月第一天
function getMonthStart(): string {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

// 检查是否在晚安时段
function isGoodnightTime(): boolean {
    const hour = new Date().getHours()
    return hour >= 20 || hour < 6
}

// 计算连续打卡天数
async function calculateStreak(coupleSpaceId: string, type: string): Promise<number> {
    const allRecords = await prisma.dailyInteraction.findMany({
        where: { coupleSpaceId, type },
        select: { date: true },
        orderBy: { date: 'desc' },
        distinct: ['date']
    })

    if (allRecords.length === 0) return 0

    const dates = [...new Set(allRecords.map((r: { date: string }) => r.date))].sort().reverse()
    let streak = 0
    const today = getGoodnightDateString()

    for (let i = 0; i < dates.length; i++) {
        const expectedDate = new Date()
        expectedDate.setDate(expectedDate.getDate() - i)
        const expected = expectedDate.toISOString().split('T')[0]

        if (dates[i] === expected || (i === 0 && dates[0] === today)) {
            streak++
        } else if (i === 0 && dates[0] !== today) {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            if (dates[0] === yesterday.toISOString().split('T')[0]) {
                streak++
            } else {
                break
            }
        } else {
            break
        }
    }

    return streak
}

// GET: 获取今晚晚安状态和统计
export async function GET(request: NextRequest) {
    try {
        const session = await getSessionFromRequest(request)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const tonight = getGoodnightDateString()
        const monthStart = getMonthStart()

        const goodnights = await prisma.dailyInteraction.findMany({
            where: {
                coupleSpaceId: session.coupleSpaceId,
                type: 'goodnight',
                date: tonight
            },
            include: {
                user: {
                    select: { id: true, nickname: true, displayName: true, avatarEmoji: true }
                }
            }
        })

        const currentUserSaid = goodnights.some((g: { userId: string }) => g.userId === session.userId)
        const partnerGoodnight = goodnights.find((g: { userId: string }) => g.userId !== session.userId)
        const bothSaid = goodnights.length >= 2

        // 获取统计数据
        const allRecords = await prisma.dailyInteraction.findMany({
            where: {
                coupleSpaceId: session.coupleSpaceId,
                type: 'goodnight'
            },
            select: { date: true },
            distinct: ['date'],
            orderBy: { date: 'desc' }
        })

        const thisMonthRecords = allRecords
            .filter((r: { date: string }) => r.date >= monthStart)
            .map((r: { date: string }) => r.date)

        const streak = await calculateStreak(session.coupleSpaceId, 'goodnight')

        return NextResponse.json({
            currentUserSaid,
            partnerSaid: !!partnerGoodnight,
            partnerInfo: partnerGoodnight?.user || null,
            partnerTime: partnerGoodnight?.createdAt || null,
            bothSaid,
            isGoodnightTime: isGoodnightTime(),
            stats: {
                streak,
                total: allRecords.length,
                thisMonth: thisMonthRecords
            }
        })

    } catch (error) {
        console.error('Get goodnight status error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

// POST: 记录晚安
export async function POST(request: NextRequest) {
    try {
        const session = await getSessionFromRequest(request)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (!isGoodnightTime()) {
            return NextResponse.json({
                error: '晚安时段是 20:00-06:00 哦 🌙',
                notGoodnightTime: true
            }, { status: 400 })
        }

        const tonight = getGoodnightDateString()

        const existing = await prisma.dailyInteraction.findUnique({
            where: {
                type_date_userId: {
                    type: 'goodnight',
                    date: tonight,
                    userId: session.userId
                }
            }
        })

        if (existing) {
            return NextResponse.json({
                error: '今晚已经说过晚安啦 🌙',
                alreadySaid: true
            }, { status: 400 })
        }

        await prisma.dailyInteraction.create({
            data: {
                type: 'goodnight',
                date: tonight,
                userId: session.userId,
                coupleSpaceId: session.coupleSpaceId
            }
        })

        const allGoodnights = await prisma.dailyInteraction.findMany({
            where: {
                coupleSpaceId: session.coupleSpaceId,
                type: 'goodnight',
                date: tonight
            }
        })

        const bothSaid = allGoodnights.length >= 2

        // 获取更新后的统计
        const allRecords = await prisma.dailyInteraction.findMany({
            where: {
                coupleSpaceId: session.coupleSpaceId,
                type: 'goodnight'
            },
            select: { date: true },
            distinct: ['date']
        })

        const monthStart = getMonthStart()
        const thisMonthRecords = allRecords
            .filter((r: { date: string }) => r.date >= monthStart)
            .map((r: { date: string }) => r.date)

        const streak = await calculateStreak(session.coupleSpaceId, 'goodnight')

        return NextResponse.json({
            success: true,
            message: bothSaid ? '🌙 晚安，好梦 💫' : '🌙 晚安已送达，等待 TA 回应~',
            bothSaid,
            stats: {
                streak,
                total: allRecords.length,
                thisMonth: thisMonthRecords
            }
        })

    } catch (error) {
        console.error('Goodnight error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
