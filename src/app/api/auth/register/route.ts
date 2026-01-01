import { prisma } from '@/lib/prisma'
import { NextResponse, NextRequest } from 'next/server'
import { hash } from 'bcryptjs'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Ensure request has JSON content-type
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 400 });
    }

    // Parse JSON body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { username, email, password, confirmPassword, name, department } = body;

    // Validation
    const errors: Record<string, string> = {};

    if (!username || username.trim().length < 3) {
      errors.username = 'Username harus minimal 3 karakter';
    }

    if (!email || !email.includes('@')) {
      errors.email = 'Email tidak valid';
    }

    if (!password || password.length < 6) {
      errors.password = 'Password harus minimal 6 karakter';
    }

    if (password !== confirmPassword) {
      errors.password = 'Password tidak cocok';
    }

    if (!name || name.trim().length < 2) {
      errors.name = 'Nama harus diisi';
    }

    if (!department || department.trim().length < 2) {
      errors.department = 'Departemen harus diisi';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { 
          error: 'Validasi gagal',
          details: errors
        },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUsername = await prisma.systemUser.findUnique({
      where: { username: username.toLowerCase() }
    });

    if (existingUsername) {
      return NextResponse.json(
        { 
          error: 'Validasi gagal',
          details: { username: 'Username sudah digunakan' }
        },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await prisma.systemUser.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingEmail) {
      return NextResponse.json(
        { 
          error: 'Validasi gagal',
          details: { email: 'Email sudah terdaftar' }
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create new staff user
    const newUser = await prisma.systemUser.create({
      data: {
        id: `USR-${Date.now()}`,
        username: username.toLowerCase(),
        password: hashedPassword,
        email: email.toLowerCase(),
        name: name.trim(),
        department: department.trim(),
        role: 'STAFF',
        isActive: true,
        updatedAt: new Date()
      }
    });
    return NextResponse.json({
      success: true,
      message: 'Registrasi berhasil! Silakan login dengan akun Anda.',
      userId: newUser.id
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat registrasi. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
