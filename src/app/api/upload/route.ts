import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        // 验证文件类型
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: '只支持 JPG, PNG, GIF, WebP 图片和 MP4, WebM 视频哦 📷' },
                { status: 400 }
            )
        }

        // 验证文件大小（最大 50MB）
        const maxSize = 50 * 1024 * 1024
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: '文件太大啦，最大支持 50MB 📦' },
                { status: 400 }
            )
        }

        // 创建上传目录
        const today = new Date().toISOString().split('T')[0]
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', today)

        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true })
        }

        // 生成唯一文件名
        const ext = path.extname(file.name)
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`
        const filePath = path.join(uploadDir, uniqueName)

        // 保存文件
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)

        // 返回可访问的URL
        const fileUrl = `/uploads/${today}/${uniqueName}`
        const mediaType = file.type.startsWith('video/') ? 'video' : 'image'

        return NextResponse.json({
            success: true,
            url: fileUrl,
            mediaType
        })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}
