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
    
    // Set execution timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 5000)
    );

    // Ensure request has JSON content-type
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      console.warn('Login request with non-JSON content-type:', contentType);
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 400 });
    }

    // Parse JSON body with explicit error handling to avoid Next returning HTML error pages
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Failed to parse JSON body for login:', parseError);
      try {
        const text = await request.text();
        console.error('Raw request body (truncated):', (text || '').slice(0, 200));
      } catch (e) {
        console.error('Could not read request body')
      }
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

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

    // Map frontend role ke database role (use type-safe mapping)
    const roleMap: Record<string, UserRole> = {
      'admin': 'ADMIN',
      'staff': 'STAFF',
      'teknisi': 'TECHNICIAN', // pastikan ini sesuai dengan enum di schema
      'supervisor': 'SUPERVISOR'
    };
    console.log('Role mapping debug:', {
      allRoles: Object.entries(roleMap),
      receivedRole: role,
      mappedRole: roleMap[role],
      frontendRoles: Object.keys(roleMap),
      availableDbRoles: Object.values(roleMap)
    });

    // Tambah logging untuk debug
    console.log('Role validation:', {
      receivedRole: role,
      dbRole: roleMap[role],
      validRoles: Object.keys(roleMap)
    });

    console.log('Received role from frontend:', role);

    const dbRole = roleMap[role] as UserRole | undefined;
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
    type UserResult = {
      id: string;
      password: string;
      role: UserRole;
      username: string;
    } | null;

    // Test database connection first
    try {
      console.log('Attempting database connection...');
      await prisma.$connect();
      
      // Test connection with a simple query
      const testQuery = await prisma.systemUser.count();
      console.log('Connection successful, user count:', testQuery);
      
    } catch (connError) {
      console.error('Database connection failed:', {
        error: connError instanceof Error ? {
          name: connError.name,
          message: connError.message,
          stack: connError.stack
        } : connError,
        dbUrl: process.env.DATABASE_URL?.replace(/:.*@/, ':****@')
      });
      
      return NextResponse.json(
        { error: 'Database tidak dapat diakses. Pastikan MySQL server sudah berjalan.' },
        { status: 503 }
      );
    }

    // Race between timeout and database query
      console.log('Executing user query with:', {
        username,
        role: dbRole,
        query: 'findFirst on systemUser'
      });

      // Debug query
      const allUsers = await prisma.systemUser.findMany({
        select: {
          username: true,
          role: true
        }
      });
      console.log('All users in database:', allUsers);

      const userByUsername = await Promise.race([
      timeoutPromise,
      prisma.systemUser.findFirst({
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
      })
    ]) as UserResult;

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

    // Defensive: ensure password is present in DB before calling bcrypt
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

  } catch (error) {
    console.error('Login error:', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      context: {
        requestBody: {
          username: body?.username,
          role: body?.role,
          hasPassword: !!body?.password
        },
        prismaConnected: !!prisma?.$connect
      }
    });

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Database timeout. Silakan coba lagi.' },
          { status: 504 }
        );
      }
      
      if (error.message.includes('connect ECONNREFUSED') || 
          error.message.includes('Can\'t reach database server')) {
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