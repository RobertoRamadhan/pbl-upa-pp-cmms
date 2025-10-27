"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TeknisiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      // Panggil API logout
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      // Hapus data dari localStorage
      localStorage.removeItem('user_session');
      localStorage.removeItem('cmms_reports');

      // Redirect ke halaman login
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during logout:', error);
      alert('Gagal melakukan logout. Silakan coba lagi.');
    }
  };

  const teknisiMenuItems = [
    { href: '/teknisi/dashboard', label: '📊 Dashboard', icon: '📊' },
    { href: '/teknisi/repair', label: '🔧 Repair Tasks', icon: '🔧' },
  ];

  return (
    <>
      {/* Teknisi Navigation */}
      <nav className="bg-blue-600 text-white shadow-lg fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden mr-2 p-2 rounded-md hover:bg-blue-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Link href="/teknisi/dashboard" className="text-2xl font-bold">
                🔧 TEKNISI PANEL
              </Link>
            </div>

            <div className="flex items-center justify-end flex-1">
              <div className="hidden md:flex items-center space-x-4 mr-4">
                {teknisiMenuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md transition-colors ${
                      pathname === item.href 
                        ? 'bg-blue-800 text-white' 
                        : 'hover:bg-blue-700'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="flex items-center relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 bg-blue-700 px-4 py-2 rounded-full hover:bg-blue-800 transition-colors"
                >
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Teknisi</span>
                  <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      href="/teknisi/profile"
                      className="block px-4 py-2 text-sm text-black hover:bg-gray-100 transition-colors"
                    >
                      👤 Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100 transition-colors"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* HEADER MOBILE */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-blue-600 text-white h-14 flex items-center px-4 shadow-md z-40">
        <button onClick={() => setIsSidebarOpen(true)} className="text-2xl mr-3">
          ☰
        </button>
        <h1 className="text-lg font-semibold">Teknisi Panel</h1>
      </header>

      {/* OVERLAY MOBILE */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)}></div>
          <div className="fixed left-0 top-16 h-full w-64 bg-blue-600 shadow-lg">
            <div className="p-4 space-y-2">
              {teknisiMenuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md transition-colors ${
                    pathname === item.href 
                      ? 'bg-blue-800 text-white' 
                      : 'text-white hover:bg-blue-700'
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <main className="min-h-screen pt-16">
        {children}
      </main>
    </>
  );
}
