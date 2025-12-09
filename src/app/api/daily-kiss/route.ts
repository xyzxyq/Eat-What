import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 获取今日日期字符串
function getTodayString(): string {
    const now = new Date()
    return now.toISOString().split('T')[0]
}

// 获取本月第一天
function getMonthStart(): string {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
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
    const today = getTodayString()

    for (let i = 0; i < dates.length; i++) {
        const expectedDate = new Date()
        expectedDate.setDate(expectedDate.getDate() - i)
        const expected = expectedDate.toISOString().split('T')[0]

        if (dates[i] === expected || (i === 0 && dates[0] === today)) {
            streak++
        } else if (i === 0 && dates[0] !== today) {
            // 今天还没打卡，从昨天开始算
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

// GET: 获取今日亲亲状态和统计
export async function GET() {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const today = getTodayString()
        const monthStart = getMonthStart()

        // 获取今日所有亲亲记录
        const kisses = await prisma.dailyInteraction.findMany({
            where: {
                coupleSpaceId: session.coupleSpaceId,
                type: 'kiss',
                date: today
            },
            include: {
                user: {
                    select: { id: true, nickname: true, displayName: true, avatarEmoji: true }
                }
            }
        })

        const currentUserKissed = kisses.some((k: { userId: string }) => k.userId === session.userId)
        const partnerKiss = kisses.find((k: { userId: string }) => k.userId !== session.userId)
        const bothKissed = kisses.length >= 2

        // 获取统计数据
        const allKissRecords = await prisma.dailyInteraction.findMany({
            where: {
                coupleSpaceId: session.coupleSpaceId,
                type: 'kiss'
            },
            select: { date: true },
            distinct: ['date'],
            orderBy: { date: 'desc' }
        })

        const thisMonthRecords = allKissRecords
            .filter((r: { date: string }) => r.date >= monthStart)
            .map((r: { date: string }) => r.date)

        const streak = await calculateStreak(session.coupleSpaceId, 'kiss')

        return NextResponse.json({
            currentUserKissed,
            partnerKissed: !!partnerKiss,
            partnerInfo: partnerKiss?.user || null,
            bothKissed,
            stats: {
                streak,
                total: allKissRecords.length,
                thisMonth: thisMonthRecords
            }
        })

    } catch (error) {
        console.error('Get kiss status error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

// POST: 记录亲亲
export async function POST() {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const today = getTodayString()

        // 检查是否已经亲过
        const existing = await prisma.dailyInteraction.findUnique({
            where: {
                type_date_userId: {
                    type: 'kiss',
                    date: today,
                    userId: session.userId
                }
            }
        })

        if (existing) {
            return NextResponse.json({
                error: '今天已经亲过啦 💋',
                alreadyKissed: true
            }, { status: 400 })
        }

        // 记录亲亲
        await prisma.dailyInteraction.create({
            data: {
                type: 'kiss',
                date: today,
                userId: session.userId,
                coupleSpaceId: session.coupleSpaceId
            }
        })

        // 检查双方是否都亲了
        const allKisses = await prisma.dailyInteraction.findMany({
            where: {
                coupleSpaceId: session.coupleSpaceId,
                type: 'kiss',
                date: today
            }
        })

        const bothKissed = allKisses.length >= 2

        // 获取更新后的统计
        const allKissRecords = await prisma.dailyInteraction.findMany({
            where: {
                coupleSpaceId: session.coupleSpaceId,
                type: 'kiss'
            },
            select: { date: true },
            distinct: ['date']
        })

        const monthStart = getMonthStart()
        const thisMonthRecords = allKissRecords
            .filter((r: { date: string }) => r.date >= monthStart)
            .map((r: { date: string }) => r.date)

        const streak = await calculateStreak(session.coupleSpaceId, 'kiss')

        return NextResponse.json({
            success: true,
            message: bothKissed ? '💕 双方都亲亲啦！' : '💋 已送出亲亲，等待 TA 回应~',
            bothKissed,
            stats: {
                streak,
                total: allKissRecords.length,
                thisMonth: thisMonthRecords
            }
        })

    } catch (error) {
        console.error('Kiss error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
