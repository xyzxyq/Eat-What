import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || 'eat-what-super-secret-key-change-in-production'
)

export interface TokenPayload {
    userId: string
    nickname: string
    coupleSpaceId: string
    [key: string]: unknown
}

export interface TempTokenPayload {
    userId: string
    coupleSpaceId: string
    type: 'temp'
    [key: string]: unknown
}

export async function createToken(payload: TokenPayload): Promise<string> {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('30d')
        .sign(secret)
}

// 创建临时令牌（5分钟过期）- 用于密码验证前的过渡
export async function createTempToken(payload: { userId: string; coupleSpaceId: string }): Promise<string> {
    return new SignJWT({ ...payload, type: 'temp' })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('5m')
        .sign(secret)
}

// 验证临时令牌
export async function verifyTempToken(token: string): Promise<TempTokenPayload | null> {
    try {
        const { payload } = await jwtVerify(token, secret)
        if (payload.type !== 'temp') {
            return null
        }
        return payload as unknown as TempTokenPayload
    } catch {
        return null
    }
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
    try {
        const { payload } = await jwtVerify(token, secret)
        return payload as unknown as TokenPayload
    } catch {
        return null
    }
}

export async function getSession(): Promise<TokenPayload | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    if (!token) return null
    return verifyToken(token)
}
