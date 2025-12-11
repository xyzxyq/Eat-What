import { NextResponse, NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: 获取用户的所有自定义库
export async function GET() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth-token')?.value

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const payload = await verifyToken(token)
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.userId as string },
            select: { coupleSpaceId: true },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // 获取所有自定义库，并包含食物数量
        const libraries = await prisma.foodLibrary.findMany({
            where: { coupleSpaceId: user.coupleSpaceId },
            include: {
                _count: {
                    select: { foodOptions: { where: { isActive: true } } }
                }
            },
            orderBy: [
                { isDefault: 'desc' },
                { createdAt: 'asc' }
            ],
        })

        // 如果没有库，创建默认库
        if (libraries.length === 0) {
            const defaultLibrary = await prisma.foodLibrary.create({
                data: {
                    name: '我的收藏',
                    emoji: '⭐',
                    description: '默认的美食收藏库',
                    isDefault: true,
                    coupleSpaceId: user.coupleSpaceId,
                    createdById: payload.userId as string,
                },
                include: {
                    _count: {
                        select: { foodOptions: { where: { isActive: true } } }
                    }
                }
            })
            return NextResponse.json({ libraries: [defaultLibrary] })
        }

        return NextResponse.json({ libraries })
    } catch (error) {
        console.error('Get food libraries error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST: 创建新的自定义库
export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth-token')?.value

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const payload = await verifyToken(token)
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        const body = await request.json()
        const { name, emoji, description } = body

        if (!name?.trim()) {
            return NextResponse.json(
                { error: 'Library name is required' },
                { status: 400 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.userId as string },
            select: { coupleSpaceId: true },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const library = await prisma.foodLibrary.create({
            data: {
                name: name.trim(),
                emoji: emoji || '📂',
                description: description?.trim() || null,
                coupleSpaceId: user.coupleSpaceId,
                createdById: payload.userId as string,
            },
            include: {
                _count: {
                    select: { foodOptions: { where: { isActive: true } } }
                }
            }
        })

        return NextResponse.json({ success: true, library })
    } catch (error) {
        console.error('Create food library error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PUT: 更新库信息
export async function PUT(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth-token')?.value

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const payload = await verifyToken(token)
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        const body = await request.json()
        const { id, name, emoji, description } = body

        if (!id) {
            return NextResponse.json({ error: 'Library ID is required' }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.userId as string },
            select: { coupleSpaceId: true },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const library = await prisma.foodLibrary.updateMany({
            where: {
                id,
                coupleSpaceId: user.coupleSpaceId,
            },
            data: {
                ...(name && { name: name.trim() }),
                ...(emoji && { emoji }),
                ...(description !== undefined && { description: description?.trim() || null }),
            },
        })

        if (library.count === 0) {
            return NextResponse.json({ error: 'Library not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Update food library error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE: 删除库
export async function DELETE(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth-token')?.value

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const payload = await verifyToken(token)
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const libraryId = searchParams.get('id')
        const moveToDefault = searchParams.get('moveToDefault') === 'true'

        if (!libraryId) {
            return NextResponse.json({ error: 'Library ID is required' }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.userId as string },
            select: { coupleSpaceId: true },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // 检查是否是默认库
        const library = await prisma.foodLibrary.findFirst({
            where: {
                id: libraryId,
                coupleSpaceId: user.coupleSpaceId,
            },
        })

        if (!library) {
            return NextResponse.json({ error: 'Library not found' }, { status: 404 })
        }

        if (library.isDefault) {
            return NextResponse.json(
                { error: 'Cannot delete default library' },
                { status: 400 }
            )
        }

        if (moveToDefault) {
            // 找到默认库
            const defaultLibrary = await prisma.foodLibrary.findFirst({
                where: {
                    coupleSpaceId: user.coupleSpaceId,
                    isDefault: true,
                },
            })

            if (defaultLibrary) {
                // 将食物移动到默认库
                await prisma.foodOption.updateMany({
                    where: { libraryId },
                    data: { libraryId: defaultLibrary.id },
                })
            }
        } else {
            // 删除库内的食物（软删除）
            await prisma.foodOption.updateMany({
                where: { libraryId },
                data: { isActive: false },
            })
        }

        // 删除库
        await prisma.foodLibrary.delete({
            where: { id: libraryId },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete food library error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
