'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<RoleType>('staff');
  const [credentials, setCredentials] = useState<Credentials>({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
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
        console.log('Checking session status...');
        
        if (!sessionStr) {
          console.log('No session found');
          return;
        }

        const session = JSON.parse(sessionStr);
        console.log('Session found:', { 
          ...session,
          id: session.id ? '[HIDDEN]' : null 
        });
        
        if (!session.id || !session.role) {
          console.log('Invalid session data');
          localStorage.removeItem('user_session');
          return;
        }

        const role = session.role as RoleType;
        const validRoles: RoleType[] = ['admin', 'staff', 'teknisi', 'supervisor'];
        
        if (!validRoles.includes(role)) {
          console.log('Invalid role in session:', role);
          localStorage.removeItem('user_session');
          return;
        }

        // Map role untuk path
        const rolePathMap: Record<RoleType, string> = {
          'admin': 'admin',
          'staff': 'staff',
          'teknisi': 'teknisi',
          'supervisor': 'supervisor'
        };

        const dashboardPath = `/${rolePathMap[role]}/dashboard`;
        console.log('Redirecting to dashboard:', dashboardPath);
        await router.replace(dashboardPath);

      } catch (error) {
        console.error('Session check error:', error);
        localStorage.removeItem('user_session');
      }
    };

    checkSession();
  }, [router]);

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

      console.log('Starting login process...');
      console.log('Form data:', {
        username: credentials.username,
        role: selectedRole,
        hasPassword: !!credentials.password
      });

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
      });

      console.log('Server response status:', response.status);

      // Read raw response text first (reading once) and attempt to parse JSON.
      // This avoids "body stream already read" when response.json() fails and
      // we try to read response.text() afterwards.
      const raw = await response.text();
      let data: any = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch (parseErr) {
        console.error('Failed to parse JSON response. Response text:', raw);
        setError(
          `Server returned unexpected response (status ${response.status}). See console for details.`
        );
        return;
      }
      console.log('Server response data:', {
        success: response.ok,
        statusCode: response.status,
        hasError: !!data.error,
        hasId: !!data.id,
        hasRole: !!data.role
      });

      if (!response.ok) {
        console.error('Login failed:', {
          status: response.status,
          error: data.error,
          details: data.details
        });
        
        // Handle validation errors
        if (response.status === 400 && data.details) {
          const errors = Object.values(data.details).filter(Boolean);
          setError(errors.join(', '));
          return;
        }
        
        // Handle authentication errors
        setError(data.error || 'Username atau password salah');
        return;
      }

      console.log('Login successful, saving session...');
      const sessionData = {
        id: data.id,
        username: data.username,
        role: data.role.toLowerCase()
      };
      
      localStorage.setItem('user_session', JSON.stringify(sessionData));
      
      const dashboardPath = `/${sessionData.role.toLowerCase()}/dashboard`;
      console.log('Navigating to:', dashboardPath);
      await router.replace(dashboardPath);
      
    } catch (err) {
      console.error('Login error:', err);
      // Check if it's a network error
      if (err instanceof Error) {
        if ('TypeError: Failed to fetch' === err.toString()) {
          setError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
        } else {
          setError('Terjadi kesalahan saat login. Silakan coba lagi.');
        }
      }
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
          </form>
        </div>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>© 2024 CMMS System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}