'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UserInfo {
  name: string;
  role: string;
  department: string;
}

export default function StaffDashboard() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    role: '',
    department: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUserInfo = () => {
      const sessionStr = localStorage.getItem('user_session');
      if (!sessionStr) {
        router.push('/login');
        return;
      }

      try {
        const session = JSON.parse(sessionStr);
        setUserInfo({
          name: session.name || '',
          role: session.role || '',
          department: session.department || ''
        });
      } catch (error) {
        console.error('Error parsing session:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    getUserInfo();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="max-w-4xl mx-auto">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-2xl font-bold mb-2">Selamat Datang, {userInfo.name}</h1>
          <p className="text-sm">
            {userInfo.role} - Departemen {userInfo.department}
          </p>
        </div>

        {/* Main Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* New Ticket Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Buat Tiket Baru</h2>
              <p className="text-sm mb-4">
                Laporkan masalah atau kerusakan peralatan yang Anda temui
              </p>
              <Link 
                href="/staff/new-ticket"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Buat Tiket
              </Link>
            </div>
          </div>

          {/* Check Status Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Cek Status Tiket</h2>
              <p className="text-sm mb-4">
                Pantau status tiket dan perkembangan perbaikan
              </p>
              <Link 
                href="/staff/tickets"
                className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Lihat Tiket
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Aktivitas Terakhir</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm">Belum ada aktivitas terbaru</p>
                <p className="text-xs text-gray-500">-</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}