import { prisma } from '@/lib/prisma'
import { NextResponse, NextRequest } from 'next/server'
import { compare } from 'bcryptjs'
import { user_role as UserRole } from '@prisma/client'

type FrontendRole = 'admin' | 'staff' | 'teknisi' | 'supervisor';

interface LoginResponse {
  id: string;
  username: string;
  role: FrontendRole;
}

interface LoginErrorResponse {
  error: string;
  details?: {
    username: string | null;
    password: string | null;
    role: string | null;
  };
}

// Create reverse mapping for converting DB role to frontend role
const dbToFrontendRole: Record<UserRole, FrontendRole> = {
  'ADMIN': 'admin',
  'STAFF': 'staff',
  'TECHNICIAN': 'teknisi',
  'SUPERVISOR': 'supervisor'
};

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest): Promise<NextResponse<LoginResponse | LoginErrorResponse>> {
  let body: any = undefined;
  try {
    console.log('Received login request')

    // Ensure request has JSON content-type
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      console.warn('Login request with non-JSON content-type:', contentType);
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 400 });
    }

    // Parse JSON body with explicit error handling
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Failed to parse JSON body for login:', parseError);
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

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
    const roleMap: Record<string, UserRole> = {
      'admin': 'ADMIN',
      'staff': 'STAFF',
      'teknisi': 'TECHNICIAN',
      'supervisor': 'SUPERVISOR'
    };

    const dbRole = roleMap[role] as UserRole | undefined;

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

    // Cari user dengan username dan role
    type UserResult = {
      id: string;
      password: string;
      role: UserRole;
      username: string;
    } | null;

    try {
      console.log('Executing user query with:', {
        username,
        role: dbRole
      });

      // Direct query tanpa connection test - Prisma sudah handle connection pooling
      const userByUsername = await prisma.systemUser.findFirst({
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
      }) as UserResult;

      console.log('Database query result:', {
        searchedUsername: username,
        userFound: !!userByUsername
      });

      if (!userByUsername) {
        console.log('User not found:', { username });
        return NextResponse.json(
          { error: 'Username atau password salah' },
          { status: 401 }
        );
      }

      const user = userByUsername;

      // Ensure password is present in DB before calling bcrypt
      if (!user.password) {
        console.error('User has no password set in DB:', { id: user.id, username: user.username })
        return NextResponse.json(
          { error: 'Username atau password salah' },
          { status: 401 }
        )
      }

      console.log('Verifying password...')
      let passwordMatch = false
      try {
        passwordMatch = await compare(password, user.password)
      } catch (err) {
        // If bcrypt throws, log and return an auth error (avoid 500)
        console.error('Error while comparing password hashes:', err)
        return NextResponse.json(
          { error: 'Username atau password salah' },
          { status: 401 }
        )
      }

      console.log('Password verification result:', {
        isMatch: passwordMatch
      })

      if (!passwordMatch) {
        return NextResponse.json(
          { error: 'Username atau password salah' },
          { status: 401 }
        )
      }

      // Convert database role ke frontend role menggunakan mapping yang sudah didefinisikan
      const frontendRole = dbToFrontendRole[user.role];

      const response = NextResponse.json({
        id: user.id,
        username: user.username,
        role: frontendRole as FrontendRole,
      } satisfies LoginResponse)

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
    } catch (dbError) {
      console.error('Database query error:', dbError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Login error:', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
      } : error
    });

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('connect ECONNREFUSED') || 
          error.message.includes('Can\'t reach database server') ||
          error.message.includes('ECONNREFUSED')) {
        return NextResponse.json(
          { error: 'Database tidak dapat diakses. Silakan coba lagi nanti.' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}