import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 生成6位随机绑定码
function generateInviteCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

// GET: 获取当前空间的绑定码
export async function GET() {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        let coupleSpace = await prisma.coupleSpace.findUnique({
            where: { id: session.coupleSpaceId },
            include: { users: true }
        })

        if (!coupleSpace) {
            return NextResponse.json({ error: 'Space not found' }, { status: 404 })
        }

        // 只有当空间只有一个人时才返回绑定码
        if (coupleSpace.users.length >= 2) {
            return NextResponse.json({
                inviteCode: null,
                message: '伴侣已加入'
            })
        }

        // 如果旧空间没有绑定码，自动生成一个
        if (!coupleSpace.inviteCode) {
            const newInviteCode = generateInviteCode()
            coupleSpace = await prisma.coupleSpace.update({
                where: { id: session.coupleSpaceId },
                data: { inviteCode: newInviteCode },
                include: { users: true }
            })
        }

        return NextResponse.json({
            inviteCode: coupleSpace.inviteCode,
            hasPartner: coupleSpace.users.length >= 2
        })

    } catch (error) {
        console.error('Get invite code error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
