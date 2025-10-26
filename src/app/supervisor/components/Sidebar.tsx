'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface MenuItem {
  href: string;
  label: string;
  icon: string;
}

export default function Sidebar() {
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
    <nav className="w-64 bg-blue-800 text-white fixed inset-y-0 left-0 z-50 flex flex-col shadow-lg">
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
              } transition-colors duration-200`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* User Menu */}
      <div className="border-t border-blue-700 bg-blue-800">
        <div className="p-4">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-blue-100 hover:bg-blue-700 hover:text-white rounded-lg transition-colors duration-200"
          >
            <div className="h-8 w-8 rounded-full bg-blue-700 flex items-center justify-center mr-3 shadow-inner">
              👤
            </div>
            <span>Profile</span>
          </button>
          
          {isDropdownOpen && (
            <div className="mt-2 py-1 bg-blue-700 rounded-lg shadow-lg">
              <Link
                href="/supervisor/profile"
                className="block px-4 py-2 text-sm text-blue-100 hover:bg-blue-600 transition-colors duration-200"
              >
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-blue-100 hover:bg-blue-600 transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}