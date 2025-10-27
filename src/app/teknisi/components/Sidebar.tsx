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

  const teknisiMenuItems: MenuItem[] = [
    { href: '/teknisi/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/teknisi/repair', label: 'Perbaikan', icon: '🔧' },
    { href: '/teknisi/profile', label: 'Profile', icon: '👤' },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST'
      });
      localStorage.removeItem('user_session');
      localStorage.removeItem('cmms_reports');
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="h-full bg-gradient-to-b from-blue-600 to-blue-800 text-white shadow-xl flex flex-col">
      {/* Header/Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-blue-500/30">
        <Link href="/teknisi/dashboard" className="text-2xl font-bold tracking-tight">
          🔧 SIPTIK
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {teknisiMenuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
              pathname === item.href
                ? 'bg-blue-700 text-white'
                : 'text-white/90 hover:bg-blue-700/50'
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer/Logout */}
      <div className="px-4 py-4 border-t border-blue-500/30">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 rounded-lg text-white/90 hover:bg-blue-700/50 transition-colors"
        >
          <span className="mr-3">🚪</span>
          <span className="font-medium">Keluar</span>
        </button>
      </div>
    </div>
  );
}