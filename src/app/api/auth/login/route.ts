import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { compare } from 'bcrypt'
import { user_role } from '@prisma/client'

export async function POST(request: Request) {
  try {
    console.log('Received login request')
    
    const body = await request.json()
    console.log('Request body:', { 
      username: body.username,
      role: body.role,
      hasPassword: !!body.password
    })
    
    const { username, password, role } = body
    
    if (!username || !password || !role) {
      console.log('Missing required fields:', { 
        hasUsername: !!username,
        hasPassword: !!password,
        hasRole: !!role 
      })
      return NextResponse.json(
        { 
          error: 'Validasi gagal',
          details: {
            username: !username ? 'Username harus diisi' : null,
            password: !password ? 'Password harus diisi' : null,
            role: !role ? 'Role harus diisi' : null
          }
        },
        { status: 400 }
      )
    }
    
    // Map frontend role ke database role
    const roleMap: Record<string, user_role> = {
      'admin': 'ADMIN' as user_role,
      'staff': 'STAFF' as user_role,
      'teknisi': 'TECHNICIAN' as user_role,
      'supervisor': 'SUPERVISOR' as user_role
    };

    console.log('Received role from frontend:', role);

    const dbRole = roleMap[role];
    console.log('Mapped role:', { 
      received: role,
      mapped: dbRole,
      availableRoles: Object.keys(roleMap)
    });

    if (!dbRole) {
      console.log('Invalid role received:', {
        received: role,
        validRoles: Object.keys(roleMap)
      });
      return NextResponse.json(
        { error: 'Role tidak valid' },
        { status: 400 }
      )
    }

    console.log('Searching for user with:', {
      username,
      role: dbRole
    })

    // Cari user dengan username dan role
    const userByUsername = await prisma.user.findFirst({
      where: { 
        username,
        role: dbRole
      },
      select: {
        id: true,
        password: true,
        role: true,
        username: true,
      },
    });

    console.log('Database query result:', {
      searchedUsername: username,
      userFound: !!userByUsername,
      userRole: userByUsername?.role,
      expectedRole: dbRole,
      roleMatched: userByUsername ? userByUsername.role === dbRole : false
    });

    // Jika user ditemukan tapi role tidak sesuai, berikan pesan yang lebih spesifik
    if (userByUsername && userByUsername.role !== dbRole) {
      console.log('User found but role mismatch:', {
        username,
        foundRole: userByUsername.role,
        expectedRole: dbRole
      });
      return NextResponse.json(
        { error: 'Role tidak sesuai' },
        { status: 401 }
      );
    }

    // Jika username tidak ditemukan
    if (!userByUsername) {
      console.log('User not found:', { username });
      return NextResponse.json(
        { error: 'Username tidak ditemukan' },
        { status: 401 }
      );
    }

    const user = userByUsername;

    if (!user) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      )
    }

    console.log('Verifying password...')
    const passwordMatch = await compare(password, user.password)
    
    console.log('Password verification result:', {
      isMatch: passwordMatch
    })

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      )
    }

    // Map database role ke frontend role
    const frontendRoleMap: { [key: string]: string } = {
      'ADMIN': 'admin',
      'STAFF': 'staff',
      'TECHNICIAN': 'teknisi',
      'SUPERVISOR': 'supervisor'
    };

    const frontendRole = frontendRoleMap[user.role];

    const response = NextResponse.json({
      id: user.id,
      username: user.username,
      role: frontendRole,
    })

    // Set secure cookies untuk autentikasi
    response.cookies.set('auth_token', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 jam
    })

    // Set role cookie (non-httpOnly agar bisa diakses client)
    response.cookies.set('user_role', frontendRole, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 jam
    })

    // Set cache control headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}