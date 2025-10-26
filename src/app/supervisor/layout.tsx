'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface MenuItem {
  href: string;
  label: string;
  icon: string;
}

export default function SupervisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const supervisorMenuItems: MenuItem[] = [
    { href: '/supervisor/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/supervisor/technicians', label: 'Teknisi', icon: '👨‍🔧' },
    { href: '/supervisor/assignments', label: 'Penugasan', icon: '📋' },
    { href: '/supervisor/reports', label: 'Laporan', icon: '📈' },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <nav className="w-64 bg-blue-800 text-white fixed top-0 bottom-0 left-0 z-50 flex flex-col shadow-lg">
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-blue-700 bg-blue-900">
          <Link href="/supervisor/dashboard" className="text-xl font-bold">
            CMMS Supervisor
          </Link>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto">
          <div className="py-4">
            {supervisorMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-6 py-3 text-sm font-medium ${
                  pathname === item.href
                    ? 'bg-blue-900 text-white'
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-blue-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            🚪 Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
