'use client';

import { useState } from 'react';
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
        method: 'POST'
      });
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <nav className="w-64 bg-blue-800 text-white fixed inset-y-0 left-0 z-50 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-blue-700">
          <Link href="/supervisor/dashboard" className="text-xl font-bold">
            CMMS Supervisor
          </Link>
        </div>

  {/* Menu Items */}
  <div className="py-4 flex-1 overflow-y-auto">
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

        {/* User Menu - Fixed at bottom */}
        <div className="w-full border-t border-blue-700">
          <div className="p-4 mt-auto">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center w-full px-2 py-2 text-sm font-medium text-blue-100 hover:bg-blue-700 hover:text-white rounded-lg"
            >
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                👤
              </div>
              <span>Profile</span>
            </button>
            
            {isDropdownOpen && (
              <div className="mt-2 py-1 bg-blue-700 rounded-lg">
                <Link
                  href="/supervisor/profile"
                  className="block px-4 py-2 text-sm text-blue-100 hover:bg-blue-600"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-blue-100 hover:bg-blue-600"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="ml-64 flex-1 bg-gray-100 min-h-screen">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}