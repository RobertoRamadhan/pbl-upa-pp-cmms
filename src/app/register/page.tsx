'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [registrationType, setRegistrationType] = useState<'staff' | 'token'>('staff');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    department: ''
  });
  const [tokenData, setTokenData] = useState({
    token: '',
    role: '' as 'SUPERVISOR' | 'TECHNICIAN' | ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setFieldErrors({});

    try {
      // Token-based registration untuk SUPERVISOR & TECHNICIAN
      if (registrationType === 'token') {
        if (!tokenData.token || !tokenData.role) {
          setError('Token dan role harus diisi');
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/auth/register-with-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            registrationToken: tokenData.token,
            role: tokenData.role
          })
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Registrasi gagal');
          if (data.details) {
            setFieldErrors(data.details);
          }
          setIsLoading(false);
          return;
        }

        setSuccess(true);
        alert('Registrasi berhasil! Silakan login dengan akun Anda.');
        
        setTimeout(() => {
          router.push('/login');
        }, 2000);
        return;
      }

      // Regular registration untuk STAFF
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registrasi gagal');
        if (data.details) {
          setFieldErrors(data.details);
        }
        return;
      }

      setSuccess(true);
      alert('Registrasi berhasil! Silakan login dengan akun Anda.');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err) {
      console.error('Registration error:', err);
      setError('Terjadi kesalahan saat registrasi. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const departments = [
    'Dosen',
    'Laboran',
    'Tenaga Kependidikan'
  ];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Registrasi</h1>
          <p className="text-gray-600 mt-2">Daftar akun staff baru</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-semibold">✓ Registrasi berhasil! Mengalihkan ke halaman login...</p>
          </div>
        )}

        {/* Registration Type Selector */}
        <div className="mb-6 border-b pb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tipe Registrasi
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                setRegistrationType('staff');
                setError('');
                setTokenData({ token: '', role: '' });
              }}
              className={`p-3 rounded-lg border-2 transition-all ${
                registrationType === 'staff'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-2xl mb-2">👤</div>
              <div className="font-medium text-gray-700">Staff</div>
              <div className="text-xs text-gray-500">Pendaftaran Umum</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setRegistrationType('token');
                setError('');
              }}
              className={`p-3 rounded-lg border-2 transition-all ${
                registrationType === 'token'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-2xl mb-2">🔑</div>
              <div className="font-medium text-gray-700">Token</div>
              <div className="text-xs text-gray-500">Supervisor/Technician</div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <p className="font-semibold">{error}</p>
            </div>
          )}

          {/* Token Registration Fields */}
          {registrationType === 'token' && (
            <>
              {/* Role Selection for Token */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={tokenData.role}
                  onChange={(e) => setTokenData(prev => ({ ...prev, role: e.target.value as 'SUPERVISOR' | 'TECHNICIAN' }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required={registrationType === 'token'}
                >
                  <option value="">Pilih Role</option>
                  <option value="SUPERVISOR">Supervisor</option>
                  <option value="TECHNICIAN">Technician</option>
                </select>
              </div>

              {/* Registration Token */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token Registrasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={tokenData.token}
                  onChange={(e) => setTokenData(prev => ({ ...prev, token: e.target.value }))}
                  placeholder="Masukkan token dari administrator"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required={registrationType === 'token'}
                />
                <p className="text-xs text-gray-500 mt-1">Hubungi administrator untuk mendapatkan token registrasi</p>
              </div>
            </>
          )}

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Minimal 3 karakter"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                fieldErrors.username ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {fieldErrors.username && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                fieldErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {fieldErrors.email && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nama lengkap Anda"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                fieldErrors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {fieldErrors.name && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.name}</p>
            )}
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Departemen <span className="text-red-500">*</span>
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                fieldErrors.department ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Pilih Departemen</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            {fieldErrors.department && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.department}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimal 6 karakter"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                fieldErrors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {fieldErrors.password && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Konfirmasi Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Ketik ulang password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || success}
            className={`w-full py-2 rounded-lg font-semibold text-white transition-colors ${
              isLoading || success
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Registrasi...' : success ? 'Berhasil!' : 'Registrasi'}
          </button>
        </form>

        {/* Link to Login */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-800 font-semibold">
              Login di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
