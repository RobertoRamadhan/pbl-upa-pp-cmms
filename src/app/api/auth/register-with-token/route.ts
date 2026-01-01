import { prisma } from '@/lib/prisma'
import { NextResponse, NextRequest } from 'next/server'
import { hash } from 'bcryptjs'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface RegisterWithTokenRequest {
  username: string
  email: string
  password: string
  confirmPassword: string
  name: string
  department: string
  registrationToken: string
  role: 'SUPERVISOR' | 'TECHNICIAN'
}

interface ValidationErrors {
  [key: string]: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as RegisterWithTokenRequest
    const { 
      username, 
      email, 
      password, 
      confirmPassword, 
      name, 
      department, 
      registrationToken, 
      role 
    } = body

    // Validasi input
    const errors: ValidationErrors = {}

    if (!username || username.trim().length < 3) {
      errors.username = 'Username harus minimal 3 karakter'
    }

    if (!email || !email.includes('@')) {
      errors.email = 'Email tidak valid'
    }

    if (!password || password.length < 6) {
      errors.password = 'Password harus minimal 6 karakter'
    }

    if (password !== confirmPassword) {
      errors.password = 'Password tidak cocok'
    }

    if (!name || name.trim().length < 2) {
      errors.name = 'Nama harus diisi'
    }

    if (!department || department.trim().length < 2) {
      errors.department = 'Departemen harus diisi'
    }

    if (!registrationToken) {
      errors.registrationToken = 'Token registrasi harus diisi'
    }

    if (!role || !['SUPERVISOR', 'TECHNICIAN'].includes(role)) {
      errors.role = 'Role tidak valid'
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { 
          error: 'Validasi gagal',
          details: errors
        },
        { status: 400 }
      )
    }

    // Cari dan validasi token
    const token = await prisma.registrationToken.findUnique({
      where: { token: registrationToken }
    })

    if (!token) {
      return NextResponse.json(
        {
          error: 'Validasi gagal',
          details: { registrationToken: 'Token tidak valid' }
        },
        { status: 400 }
      )
    }

    // Cek apakah token sudah digunakan
    if (token.isUsed) {
      return NextResponse.json(
        {
          error: 'Validasi gagal',
          details: { registrationToken: 'Token sudah digunakan' }
        },
        { status: 400 }
      )
    }

    // Cek apakah token sudah expired
    if (new Date() > token.expiresAt) {
      return NextResponse.json(
        {
          error: 'Validasi gagal',
          details: { registrationToken: 'Token sudah kadaluarsa' }
        },
        { status: 400 }
      )
    }

    // Cek apakah role sesuai dengan yang di-authorize di token
    if (token.createdFor !== role) {
      return NextResponse.json(
        {
          error: 'Validasi gagal',
          details: { role: `Token ini hanya untuk ${token.createdFor}` }
        },
        { status: 400 }
      )
    }

    // Cek apakah email sesuai dengan yang di-authorize (jika ada)
    if (token.email && token.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        {
          error: 'Validasi gagal',
          details: { email: 'Email tidak sesuai dengan yang di-authorize untuk token ini' }
        },
        { status: 400 }
      )
    }

    // Cek apakah username sudah ada
    const existingUsername = await prisma.systemUser.findUnique({
      where: { username: username.toLowerCase() }
    })

    if (existingUsername) {
      return NextResponse.json(
        {
          error: 'Validasi gagal',
          details: { username: 'Username sudah digunakan' }
        },
        { status: 400 }
      )
    }

    // Cek apakah email sudah terdaftar
    const existingEmail = await prisma.systemUser.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingEmail) {
      return NextResponse.json(
        {
          error: 'Validasi gagal',
          details: { email: 'Email sudah terdaftar' }
        },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Buat user baru dengan role dari token
    const newUser = await prisma.systemUser.create({
      data: {
        id: `USR-${Date.now()}`,
        username: username.toLowerCase(),
        password: hashedPassword,
        email: email.toLowerCase(),
        name: name.trim(),
        department: department.trim(),
        role: role,
        isActive: true,
        updatedAt: new Date()
      }
    })

    // Mark token sebagai digunakan
    await prisma.registrationToken.update({
      where: { id: token.id },
      data: {
        isUsed: true,
        usedAt: new Date(),
        usedById: newUser.id
      }
    })

    return NextResponse.json({
      success: true,
      message: `Registrasi berhasil sebagai ${role}! Silakan login dengan akun Anda.`,
      userId: newUser.id
    }, { status: 201 })

  } catch (error) {
    console.error('Register with token error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat registrasi. Silakan coba lagi.' },
      { status: 500 }
    )
  }
}
