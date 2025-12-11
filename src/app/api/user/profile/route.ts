import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

// 获取当前用户信息
export async function GET(request: NextRequest) {
    try {
        const session = await getSessionFromRequest(request)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.userId }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({
            id: user.id,
            nickname: user.nickname,
            displayName: user.displayName,
            gender: user.gender,
            avatarEmoji: user.avatarEmoji,
            avatarUrl: user.avatarUrl,
            status: user.status,
            isProfileComplete: user.isProfileComplete
        })
    } catch (error) {
        console.error('Get user error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// 更新用户信息
export async function PUT(request: NextRequest) {
    try {
        const session = await getSessionFromRequest(request)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const updateData: Record<string, unknown> = {}

        if ('displayName' in body && typeof body.displayName === 'string') {
            updateData.displayName = body.displayName.trim() || null
        }

        if ('gender' in body) {
            const validGenders = ['male', 'female', 'other']
            if (validGenders.includes(body.gender)) {
                updateData.gender = body.gender
            }
        }

        if ('avatarEmoji' in body && typeof body.avatarEmoji === 'string') {
            updateData.avatarEmoji = body.avatarEmoji
        }

        if ('avatarUrl' in body) {
            updateData.avatarUrl = body.avatarUrl || null
        }

        if ('isProfileComplete' in body) {
            updateData.isProfileComplete = !!body.isProfileComplete
        }

        const user = await prisma.user.update({
            where: { id: session.userId },
            data: updateData
        })

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                displayName: user.displayName,
                gender: user.gender,
                avatarEmoji: user.avatarEmoji,
                avatarUrl: user.avatarUrl,
                isProfileComplete: user.isProfileComplete
            }
        })
    } catch (error) {
        console.error('Update user error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
