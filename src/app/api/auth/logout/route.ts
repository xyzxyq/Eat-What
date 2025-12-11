'use strict'

import { NextResponse } from 'next/server'

// POST: 退出登录（清除 auth-token cookie）
export async function POST() {
    const response = NextResponse.json({ success: true, message: '已退出登录' })

    // 清除 auth-token cookie
    response.cookies.set({
        name: 'auth-token',
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0  // 立即过期
    })

    return response
}
