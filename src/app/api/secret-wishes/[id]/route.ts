import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession()
        if (!session || !session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await context.params
        const body = await request.json()
        const { content, emoji, isRevealed } = body

        const wish = await prisma.secretWish.findUnique({
            where: { id }
        })

        if (!wish) {
            return NextResponse.json({ error: 'Wish not found' }, { status: 404 })
        }

        if (wish.createdById !== session.userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const updatedWish = await prisma.secretWish.update({
            where: { id },
            data: {
                content: content !== undefined ? content : wish.content,
                emoji: emoji !== undefined ? emoji : wish.emoji,
                isRevealed: isRevealed !== undefined ? isRevealed : wish.isRevealed,
                revealedAt: isRevealed && !wish.isRevealed ? new Date() : wish.revealedAt
            }
        })

        return NextResponse.json(updatedWish)
    } catch (error) {
        console.error('Error updating secret wish:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession()
        if (!session || !session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await context.params

        const wish = await prisma.secretWish.findUnique({
            where: { id }
        })

        if (!wish) {
            return NextResponse.json({ error: 'Wish not found' }, { status: 404 })
        }

        if (wish.createdById !== session.userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        await prisma.secretWish.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting secret wish:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
