import { prisma } from '@/lib/prisma'
import { NextResponse, NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface ListTokensResponse {
  success: boolean
  tokens?: Array<{
    id: string
    token: string
    createdFor: string
    email: string | null
    isUsed: boolean
    usedAt: string | null
    expiresAt: string
    createdAt: string
  }>
  error?: string
}

interface DeleteTokenRequest {
  tokenId: string
  adminId: string
}

export async function GET(request: NextRequest): Promise<NextResponse<ListTokensResponse>> {
  try {
    const adminId = request.nextUrl.searchParams.get('adminId')

    if (!adminId) {
      return NextResponse.json(
        { success: false, error: 'adminId parameter diperlukan' },
        { status: 400 }
      )
    }

    // Cek apakah user adalah admin
    const admin = await prisma.systemUser.findUnique({
      where: { id: adminId },
      select: { role: true }
    })

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Hanya admin yang bisa melihat tokens' },
        { status: 403 }
      )
    }

    // Get tokens yang dibuat oleh admin ini
    const tokens = await prisma.registrationToken.findMany({
      where: {
        createdById: adminId
      },
      select: {
        id: true,
        token: true,
        createdFor: true,
        email: true,
        isUsed: true,
        usedAt: true,
        expiresAt: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      tokens: tokens.map(t => ({
        ...t,
        expiresAt: t.expiresAt.toISOString(),
        usedAt: t.usedAt ? t.usedAt.toISOString() : null,
        createdAt: t.createdAt.toISOString()
      }))
    })

  } catch (error) {
    console.error('Get tokens error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat mengambil tokens' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse<{ success: boolean; error?: string }>> {
  try {
    const body = await request.json() as DeleteTokenRequest
    const { tokenId, adminId } = body

    if (!tokenId || !adminId) {
      return NextResponse.json(
        { success: false, error: 'tokenId dan adminId diperlukan' },
        { status: 400 }
      )
    }

    // Cek apakah user adalah admin
    const admin = await prisma.systemUser.findUnique({
      where: { id: adminId },
      select: { role: true }
    })

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Hanya admin yang bisa delete tokens' },
        { status: 403 }
      )
    }

    // Cek apakah token dibuat oleh admin ini
    const token = await prisma.registrationToken.findUnique({
      where: { id: tokenId },
      select: { createdById: true }
    })

    if (!token || token.createdById !== adminId) {
      return NextResponse.json(
        { success: false, error: 'Token tidak ditemukan atau bukan milik Anda' },
        { status: 404 }
      )
    }

    // Delete token
    await prisma.registrationToken.delete({
      where: { id: tokenId }
    })

    return NextResponse.json({
      success: true
    })

  } catch (error) {
    console.error('Delete token error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat menghapus token' },
      { status: 500 }
    )
  }
}
