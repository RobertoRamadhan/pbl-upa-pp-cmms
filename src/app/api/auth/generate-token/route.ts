import { prisma } from '@/lib/prisma'
import { NextResponse, NextRequest } from 'next/server'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface GenerateTokenRequest {
  adminId: string
  role: 'SUPERVISOR' | 'TECHNICIAN'
  email?: string
}

interface GenerateTokenResponse {
  success: boolean
  token?: string
  expiresAt?: string
  message?: string
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<GenerateTokenResponse>> {
  try {
    const body = await request.json() as GenerateTokenRequest
    const { adminId, role, email } = body

    // Validasi input
    if (!adminId || !role) {
      return NextResponse.json(
        { success: false, error: 'adminId dan role harus diisi' },
        { status: 400 }
      )
    }

    if (!['SUPERVISOR', 'TECHNICIAN'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Role harus SUPERVISOR atau TECHNICIAN' },
        { status: 400 }
      )
    }

    // Cek apakah adminId adalah admin yang valid
    const admin = await prisma.systemUser.findUnique({
      where: { id: adminId },
      select: { id: true, role: true }
    })

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Hanya admin yang bisa generate token' },
        { status: 403 }
      )
    }

    // Generate token yang unik dan aman
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 hari

    // Simpan token ke database
    const registrationToken = await prisma.registrationToken.create({
      data: {
        token,
        createdById: adminId,
        createdFor: role,
        email: email || null,
        expiresAt
      }
    })

    return NextResponse.json({
      success: true,
      token: registrationToken.token,
      expiresAt: registrationToken.expiresAt.toISOString(),
      message: `Token berhasil dibuat untuk ${role}. Token berlaku selama 7 hari.`
    }, { status: 201 })

  } catch (error) {
    console.error('Generate token error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat membuat token' },
      { status: 500 }
    )
  }
}
