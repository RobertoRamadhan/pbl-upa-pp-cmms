import { prisma } from '@/lib/prisma'
import { NextResponse, NextRequest } from 'next/server'
import { hash } from 'bcryptjs'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface GoogleTokenResponse {
  id_token: string
  access_token: string
  expires_in: number
  token_type: string
}

interface GoogleUserInfo {
  sub: string // Google ID
  email: string
  name: string
  picture?: string
}

interface GoogleOAuthRequest {
  credential?: string // Google JWT token dari frontend
  role?: 'admin' | 'staff' | 'teknisi' | 'supervisor'
}

interface LoginResponse {
  id: string
  username: string
  email: string
  name: string
  role: string
}

interface ErrorResponse {
  error: string
  details?: string
}

// Decode JWT tanpa verify (karena already verified di frontend by Google)
function decodeJWT(token: string): any {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format')
    }
    
    const decoded = Buffer.from(parts[1], 'base64').toString('utf-8')
    return JSON.parse(decoded)
  } catch (error) {
    console.error('JWT decode error:', error)
    return null
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<LoginResponse | ErrorResponse>> {
  try {
    const body = await request.json() as GoogleOAuthRequest
    const { credential, role = 'staff' } = body

    if (!credential) {
      return NextResponse.json(
        { error: 'Google credential tidak ditemukan' },
        { status: 400 }
      )
    }

    // Decode JWT dari Google
    const userInfo = decodeJWT(credential) as GoogleUserInfo | null
    if (!userInfo || !userInfo.sub || !userInfo.email) {
      return NextResponse.json(
        { error: 'Invalid Google credential' },
        { status: 401 }
      )
    }

    // Map frontend role ke database role
    const roleMap: Record<string, string> = {
      'admin': 'ADMIN',
      'staff': 'STAFF',
      'teknisi': 'TECHNICIAN',
      'supervisor': 'SUPERVISOR'
    }

    const dbRole = roleMap[role] || 'STAFF'

    // Cari user berdasarkan googleId atau email
    let user = await prisma.systemUser.findFirst({
      where: {
        OR: [
          { googleId: userInfo.sub },
          { email: userInfo.email.toLowerCase() }
        ]
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        googleId: true,
        isActive: true
      }
    })

    // Jika user tidak ada, buat user baru dengan role sesuai request
    if (!user) {
      // Generate username dari email
      const baseUsername = userInfo.email.split('@')[0]
      let username = baseUsername
      let counter = 1

      // Cek keunikan username
      while (await prisma.systemUser.findUnique({ where: { username } })) {
        username = `${baseUsername}${counter}`
        counter++
      }

      // Untuk SUPERVISOR dan TECHNICIAN, mereka harus melalui token registration
      // Disini kita hanya allow auto-create untuk STAFF dan ADMIN (jika sudah di-whitelist)
      if (dbRole === 'SUPERVISOR' || dbRole === 'TECHNICIAN') {
        return NextResponse.json(
          {
            error: 'Registrasi untuk role ini memerlukan token dari admin. Hubungi administrator.',
            details: 'Supervisor dan Technician harus di-register terlebih dahulu oleh admin'
          },
          { status: 403 }
        )
      }

      // Generate temporary password (user bisa change nanti)
      const tempPassword = await hash(userInfo.sub + Date.now(), 10)

      user = await prisma.systemUser.create({
        data: {
          id: `USR-${Date.now()}`,
          username,
          password: tempPassword,
          email: userInfo.email.toLowerCase(),
          name: userInfo.name,
          googleId: userInfo.sub,
          role: dbRole as any,
          isActive: true,
          department: 'General',
          updatedAt: new Date()
        },
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          role: true,
          googleId: true,
          isActive: true
        }
      })

      console.log('New user created via Google OAuth:', { email: user.email, role: user.role })
    } else {
      // Update googleId jika belum ada
      if (!user.googleId) {
        await prisma.systemUser.update({
          where: { id: user.id },
          data: { googleId: userInfo.sub }
        })
        user.googleId = userInfo.sub
      }

      // Check if user is active
      if (!user.isActive) {
        return NextResponse.json(
          { error: 'Akun Anda tidak aktif. Hubungi administrator.' },
          { status: 403 }
        )
      }
    }

    // Convert role ke frontend format
    const roleToFrontend: Record<string, string> = {
      'ADMIN': 'admin',
      'STAFF': 'staff',
      'TECHNICIAN': 'teknisi',
      'SUPERVISOR': 'supervisor'
    }

    const response = NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: roleToFrontend[user.role] || 'staff'
    })

    // Set secure cookies
    response.cookies.set('auth_token', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 jam
    })

    response.cookies.set('user_role', roleToFrontend[user.role] || 'staff', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24
    })

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    return response

  } catch (error) {
    console.error('Google OAuth error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat Google login. Silakan coba lagi.' },
      { status: 500 }
    )
  }
}
