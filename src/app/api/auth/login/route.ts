import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createTempToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// 生成6位随机绑定码
function generateInviteCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

function getRandomEmoji(): string {
    const emojis = ['💕', '💖', '💗', '💝', '💘', '🦋', '🌸', '🌺', '🌷', '🌹', '✨', '🌙', '⭐', '🎀', '🍀']
    return emojis[Math.floor(Math.random() * emojis.length)]
}

export async function POST(request: NextRequest) {
    try {
        const { passphrase, nickname, inviteCode } = await request.json()

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

        // 查找是否有匹配的空间
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

        // 如果空间不存在，创建新空间（第一个用户）
        if (!coupleSpace) {
            const newInviteCode = generateInviteCode()

            coupleSpace = await prisma.coupleSpace.create({
                data: {
                    passphraseHash,
                    inviteCode: newInviteCode,
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

            // 创建临时令牌，引导用户设置密码
            const tempToken = await createTempToken({
                userId: user.id,
                coupleSpaceId: coupleSpace.id
            })

            return NextResponse.json({
                success: true,
                message: '🎉 新的情侣空间已创建！请设置登录密码...',
                requirePassword: true,
                tempToken,
                hasPassword: false,  // 新用户没有密码
                user: {
                    nickname: user.nickname,
                    avatarEmoji: user.avatarEmoji,
                    avatarUrl: user.avatarUrl
                },
                isNewSpace: true,
                inviteCode: newInviteCode
            })
        }

        // 空间存在，检查用户是否已在空间中
        const existingUser = coupleSpace.users.find((u: { nickname: string }) => u.nickname === nickname)

        if (existingUser) {
            // 用户已存在，返回临时令牌让用户验证/设置密码
            const tempToken = await createTempToken({
                userId: existingUser.id,
                coupleSpaceId: coupleSpace.id
            })

            return NextResponse.json({
                success: true,
                message: existingUser.passwordHash
                    ? `🔐 请输入密码，${existingUser.nickname}！`
                    : `🔐 请设置登录密码，${existingUser.nickname}！`,
                requirePassword: true,
                tempToken,
                hasPassword: !!existingUser.passwordHash,
                user: {
                    nickname: existingUser.nickname,
                    avatarEmoji: existingUser.avatarEmoji,
                    avatarUrl: existingUser.avatarUrl
                },
                isNewSpace: false
            })
        }

        // 检查空间是否已满
        if (coupleSpace.users.length >= 2) {
            return NextResponse.json(
                { error: '这个空间已经有两个人啦，不能再加入更多人了 🚫' },
                { status: 403 }
            )
        }

        // 新用户加入现有空间，需要验证绑定码
        if (!inviteCode) {
            return NextResponse.json(
                {
                    error: '需要输入绑定码才能加入此空间 🔐',
                    requireInviteCode: true
                },
                { status: 400 }
            )
        }

        // 验证绑定码
        if (coupleSpace.inviteCode !== inviteCode) {
            return NextResponse.json(
                { error: '绑定码不正确，请向你的另一半确认 💔' },
                { status: 400 }
            )
        }

        // 绑定码正确，创建新用户
        const newUser = await prisma.user.create({
            data: {
                nickname,
                avatarEmoji: getRandomEmoji(),
                coupleSpaceId: coupleSpace.id
            }
        })

        // 创建临时令牌，引导用户设置密码
        const tempToken = await createTempToken({
            userId: newUser.id,
            coupleSpaceId: coupleSpace.id
        })

        return NextResponse.json({
            success: true,
            message: `🎊 成功加入情侣空间！请设置登录密码...`,
            requirePassword: true,
            tempToken,
            hasPassword: false,  // 新用户没有密码
            user: {
                nickname: newUser.nickname,
                avatarEmoji: newUser.avatarEmoji,
                avatarUrl: newUser.avatarUrl
            },
            isNewSpace: false,
            partnerJoined: true
        })

    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: '服务器开小差了，请稍后再试 😢' },
            { status: 500 }
        )
    }
}
