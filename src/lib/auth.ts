import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || 'eat-what-super-secret-key-change-in-production'
)

export interface TokenPayload {
    userId: string
    nickname: string
    coupleSpaceId: string
}

export async function createToken(payload: TokenPayload): Promise<string> {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('30d')
        .sign(secret)
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
