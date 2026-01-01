'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { FormEvent } from 'react';

type RoleType = 'staff' | 'admin' | 'teknisi' | 'supervisor';

interface Role {
  id: RoleType;
  name: string;
  icon: string;
  color: string;
  description: string;
}

interface Credentials {
  username: string;
  password: string;
}

interface GoogleTokenPayload {
  clientId?: string;
  credential?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          prompt: (callback: (notification: any) => void) => void;
        };
      };
    };
  }
}

export default function LoginPage() {
  const router = useRouter();
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [selectedRole, setSelectedRole] = useState<RoleType>('staff');
  const [credentials, setCredentials] = useState<Credentials>({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const roles: Role[] = [
    {
      id: 'staff',
      name: 'Staff',
      icon: '👤',
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Staff Member'
    },
    {
      id: 'admin',
      name: 'Admin',
      icon: '⚙️',
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Administrator'
    },
    {
      id: 'supervisor',
      name: 'Supervisor',
      icon: '👨‍💼',
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'kepala uppa'
    },
    {
      id: 'teknisi',
      name: 'Teknisi',
      icon: '🔧',
      color: 'bg-orange-500 hover:bg-orange-600',
      description: 'Technical Support'
    }
  ];

  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionStr = localStorage.getItem('user_session');
        
        if (!sessionStr) {
          return;
        }

        const session = JSON.parse(sessionStr);
        
        if (!session.id || !session.role) {
          localStorage.removeItem('user_session');
          return;
        }

        const role = session.role as RoleType;
        const validRoles: RoleType[] = ['admin', 'staff', 'teknisi', 'supervisor'];
        
        if (!validRoles.includes(role)) {
          localStorage.removeItem('user_session');
          return;
        }

        const rolePathMap: Record<RoleType, string> = {
          'admin': 'admin',
          'staff': 'staff',
          'teknisi': 'teknisi',
          'supervisor': 'supervisor'
        };

        // Direct redirect tanpa await router.replace untuk kecepatan
        router.replace(`/${rolePathMap[role]}/dashboard`);

      } catch (error) {
        console.error('Session check error:', error);
        localStorage.removeItem('user_session');
      }
    };

    checkSession();
  }, [router]);

  // Initialize Google Sign-In
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (typeof window === 'undefined' || !window.google) {
        console.warn('Google SDK not yet loaded');
        return;
      }

      // Skip if client_id not set
      if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        console.warn('Google Client ID not configured');
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleGoogleLogin,
          auto_select: false
        });

        // Render button jika ref ada
        if (googleButtonRef.current && !googleButtonRef.current.innerHTML) {
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin'
          });
        }
      } catch (error) {
        console.error('Google Sign-In initialization error:', error);
      }
    };

    // Tunggu Google SDK loaded
    const checkGoogleSDK = setInterval(() => {
      if (window.google) {
        clearInterval(checkGoogleSDK);
        initializeGoogleSignIn();
      }
    }, 100);

    return () => clearInterval(checkGoogleSDK);
  }, []);

  const handleGoogleLogin = async (response: GoogleTokenPayload) => {
    if (!response.credential) {
      setError('Google credential tidak ditemukan');
      return;
    }

    setGoogleLoading(true);
    setError('');

    try {
      const result = await fetch('/api/auth/google-callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: response.credential,
          role: selectedRole
        })
      });

      const data = await result.json();

      if (!result.ok) {
        setError(data.error || 'Google login gagal');
        return;
      }

      // Save session
      const sessionData = {
        id: data.id,
        username: data.username,
        name: data.name,
        email: data.email,
        role: data.role
      };

      localStorage.setItem('user_session', JSON.stringify(sessionData));

      // Redirect sesuai role
      const redirectPath = data.role === 'staff' 
        ? '/staff/new-ticket' 
        : `/${data.role}/dashboard`;
      
      router.replace(redirectPath);

    } catch (error) {
      console.error('Google login error:', error);
      setError('Terjadi kesalahan saat login dengan Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Original useEffect dipindahkan ke bawah

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!credentials.username || !credentials.password) {
        setError('Username dan password harus diisi');
        setIsLoading(false);
        return;
      }

      // Set timeout untuk request - 8 detik sudah cukup
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
          role: selectedRole
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Get response details first
      const raw = await response.text();
      
      // Attempt to parse JSON with better error handling
      let data: any = null;
      if (!raw) {
        throw new Error('Server returned empty response');
      }

      try {
        data = JSON.parse(raw);
      } catch (parseErr) {
        console.error('JSON parse error:', parseErr);
        throw new Error(`Invalid JSON response from server`);
      }

      if (!response.ok) {
        // Prepare detailed error information
        const errorInfo = {
          request: {
            url: '/api/auth/login',
            method: 'POST',
            role: selectedRole,
            username: credentials.username,
          },
          response: {
            status: response.status,
            statusText: response.statusText,
            error: data?.error,
          }
        };
        
        console.error('Login failed:', errorInfo);
        
        // Handle validation errors (400)
        if (response.status === 400) {
          if (data?.details) {
            const errors = Object.values(data.details).filter(Boolean);
            setError(errors.join(', '));
          } else {
            setError(data?.error || 'Data tidak valid');
          }
          return;
        }
        
        // Handle specific status codes
        switch (response.status) {
          case 401:
            setError('Username atau password salah');
            break;
          case 403:
            setError('Akses ditolak. Periksa kembali role yang dipilih.');
            break;
          case 404:
            setError('API endpoint tidak ditemukan');
            break;
          case 500:
            setError('Terjadi kesalahan pada server');
            break;
          case 503:
            setError('Server sedang tidak tersedia. Silakan coba lagi.');
            break;
          default:
            setError(data?.error || `Gagal login (${response.status}). Silakan coba lagi.`);
        }
        return;
      }

      console.log('Login successful, saving session...');
      const sessionData = {
        id: data.id,
        username: data.username,
        role: data.role.toLowerCase()
      };
      
      localStorage.setItem('user_session', JSON.stringify(sessionData));
      
      // Direct redirect tanpa await untuk kecepatan
      // Staff langsung ke new-ticket, role lain ke dashboard
      const redirectPath = sessionData.role === 'staff' 
        ? '/staff/new-ticket' 
        : `/${sessionData.role.toLowerCase()}/dashboard`;
      router.replace(redirectPath);
      
    } catch (err) {
      // Log detailed error information
      console.error('Login error:', {
        error: err instanceof Error ? {
          name: err.name,
          message: err.message,
          stack: err.stack,
          type: err.constructor.name
        } : String(err),
        context: {
          url: '/api/auth/login',
          role: selectedRole,
          username: credentials.username
        }
      });

      // Handle specific error types with user-friendly messages
      if (err instanceof Error) {
        switch (err.name) {
          case 'AbortError':
            setError('Request timeout. Server tidak merespons dalam waktu yang ditentukan.');
            break;
          case 'TypeError':
            if (err.message.includes('Failed to fetch')) {
              setError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
            } else {
              setError(`Error: ${err.message}`);
            }
            break;
          default:
            setError(`Terjadi kesalahan: ${err.message}`);
        }
      } else {
        setError('Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.');
      }
      
      // Log additional debug information
      console.debug('Login attempt failed', {
        timestamp: new Date().toISOString(),
        errorType: err?.constructor?.name,
        hasErrorMessage: err instanceof Error
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof Credentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && credentials.username && credentials.password) {
      handleSubmit();
    }
  };

  const selectedRoleData = roles.find(r => r.id === selectedRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🏢</span>
            </div>
            <h1 className="text-3xl font-bold text-black">CMMS Login</h1>
            <p className="text-black">Sistem Manajemen Pemeliharaan Kampus</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-black">
              Select Role
            </label>
            <div className="relative">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as RoleType)}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none bg-white appearance-none text-black"
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.icon} {role.name} - {role.description}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }} 
            className="space-y-6"
          >
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-black">
                Username
              </label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none text-black"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black">
                Password
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none text-black"
                placeholder="Enter password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !credentials.username || !credentials.password}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 ${
                selectedRoleData?.color
              } disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span className="mr-2">{selectedRoleData?.icon}</span>
                  Sign in as {selectedRoleData?.name}
                </div>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Atau</span>
              </div>
            </div>

            {/* Google Sign-In Button */}
            {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
              <div 
                ref={googleButtonRef} 
                className="w-full flex justify-center"
                style={{ minHeight: '50px', display: 'flex', alignItems: 'center' }}
              >
                {googleLoading && (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-2 text-sm text-gray-600">Loading Google...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center text-sm text-yellow-800">
                Google login tidak tersedia. Silakan gunakan username/password.
              </div>
            )}
          </form>
        </div>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p className="mb-4">© 2024 CMMS System. All rights reserved.</p>
          <p>
            Belum punya akun staff?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-800 font-semibold">
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}