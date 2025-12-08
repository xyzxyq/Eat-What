import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
    try {
        const { passphrase, nickname } = await request.json()

        // 验证输入
        if (!passphrase || !nickname) {
            return NextResponse.json(
                { error: '口令和爱称都是必填的哦 💔' },
                { status: 400 }
            )
        }

        if (passphrase.length < 4) {
            return NextResponse.json(
                { error: '口令至少需要4个字符 🔑' },
                { status: 400 }
            )
        }

        if (nickname.length < 1 || nickname.length > 20) {
            return NextResponse.json(
                { error: '爱称长度需要在1-20个字符之间 💕' },
                { status: 400 }
            )
        }

        // 对口令进行哈希处理（用于查找）
        const passphraseHash = await bcrypt.hash(passphrase, 10)

        // 查找是否有匹配的空间（需要遍历比对，因为bcrypt每次hash结果不同）
        const allSpaces = await prisma.coupleSpace.findMany({
            include: { users: true }
        })

        let coupleSpace = null
        for (const space of allSpaces) {
            const isMatch = await bcrypt.compare(passphrase, space.passphraseHash)
            if (isMatch) {
                coupleSpace = space
                break
            }
        }

        // 如果空间不存在，创建新空间
        if (!coupleSpace) {
            coupleSpace = await prisma.coupleSpace.create({
                data: {
                    passphraseHash,
                    users: {
                        create: {
                            nickname,
                            avatarEmoji: getRandomEmoji()
                        }
                    }
                },
                include: { users: true }
            })

            const user = coupleSpace.users[0]
            const token = await createToken({
                userId: user.id,
                nickname: user.nickname,
                coupleSpaceId: coupleSpace.id
            })

            const response = NextResponse.json({
                success: true,
                message: '🎉 新的情侣空间已创建！等待你的另一半加入...',
                user: {
                    id: user.id,
                    nickname: user.nickname,
                    avatarEmoji: user.avatarEmoji
                },
                isNewSpace: true,
                needEmailBinding: true  // 新用户需要绑定邮箱
            })

            response.cookies.set('auth-token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60 // 30 days
            })

            return response
        }

        // 空间存在，检查用户
        const existingUser = coupleSpace.users.find((u: { nickname: string }) => u.nickname === nickname)

        if (existingUser) {
            // 用户已存在，直接登录
            const token = await createToken({
                userId: existingUser.id,
                nickname: existingUser.nickname,
                coupleSpaceId: coupleSpace.id
            })

            const response = NextResponse.json({
                success: true,
                message: `💕 欢迎回来，${existingUser.nickname}！`,
                user: {
                    id: existingUser.id,
                    nickname: existingUser.nickname,
                    avatarEmoji: existingUser.avatarEmoji
                },
                isNewSpace: false,
                needEmailBinding: !existingUser.isEmailVerified  // 未验证邮箱需要绑定
            })

            response.cookies.set('auth-token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60
            })

            return response
        }

        // 检查空间是否已满
        if (coupleSpace.users.length >= 2) {
            return NextResponse.json(
                { error: '这个空间已经有两个人啦，不能再加入更多人了 🚫' },
                { status: 403 }
            )
        }

        // 创建新用户
        const newUser = await prisma.user.create({
            data: {
                nickname,
                avatarEmoji: getRandomEmoji(),
                coupleSpaceId: coupleSpace.id
            }
        })

        const token = await createToken({
            userId: newUser.id,
            nickname: newUser.nickname,
            coupleSpaceId: coupleSpace.id
        })

        const response = NextResponse.json({
            success: true,
            message: `🎊 成功加入情侣空间！现在你们可以一起记录美好时光了！`,
            user: {
                id: newUser.id,
                nickname: newUser.nickname,
                avatarEmoji: newUser.avatarEmoji
            },
            isNewSpace: false,
            partnerJoined: true,
            needEmailBinding: true  // 新用户需要绑定邮箱
        })

        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60
        })

        return response

    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: '服务器开小差了，请稍后再试 😢' },
            { status: 500 }
        )
    }
}

function getRandomEmoji(): string {
    const emojis = ['💕', '💖', '💗', '💝', '💘', '🦋', '🌸', '🌺', '🌷', '🌹', '✨', '🌙', '⭐', '🎀', '🍀']
    return emojis[Math.floor(Math.random() * emojis.length)]
}
