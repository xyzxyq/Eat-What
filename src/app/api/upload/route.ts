import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import cloudinary from '@/lib/cloudinary'

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

        // 检查 Cloudinary 配置
        console.log('Cloudinary config:', {
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret_exists: !!process.env.CLOUDINARY_API_SECRET
        })

        // 将文件转换为 base64
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64 = buffer.toString('base64')
        const dataUri = `data:${file.type};base64,${base64}`

        console.log('Starting Cloudinary upload...')

        // 上传到 Cloudinary
        const isVideo = file.type.startsWith('video/')
        const result = await cloudinary.uploader.upload(dataUri, {
            folder: 'eat_what',
            resource_type: isVideo ? 'video' : 'image',
            transformation: isVideo ? undefined : [
                { quality: 'auto:good' },
                { fetch_format: 'auto' }
            ]
        })

        console.log('Upload successful:', result.secure_url)

        return NextResponse.json({
            success: true,
            url: result.secure_url,
            mediaType: isVideo ? 'video' : 'image'
        })
    } catch (error) {
        console.error('Upload error details:', error)
        return NextResponse.json({
            error: 'Upload failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
