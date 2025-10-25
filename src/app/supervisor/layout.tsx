'use client';

import { useState, useEffect, useRef } from 'react';
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
  const profileRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when route changes
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [pathname]);

  // Click outside & Escape to close
  useEffect(() => {
    function onPointerDown(e: PointerEvent | MouseEvent | TouchEvent) {
      const target = e.target as Node | null;
      if (profileRef.current && target && !profileRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsDropdownOpen(false);
    }

    document.addEventListener('pointerdown', onPointerDown as any);
    document.addEventListener('touchstart', onPointerDown as any);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown as any);
      document.removeEventListener('touchstart', onPointerDown as any);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

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

            {/* Profile button placed directly under Laporan */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-expanded={isDropdownOpen}
                aria-controls="supervisor-profile-dropdown"
                className={`flex items-center w-full px-6 py-3 text-sm font-medium ${
                  isDropdownOpen ? 'bg-blue-900 text-white' : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                } rounded-lg transition-colors duration-200`}
              >
                <span className="mr-3">👤</span>
                Profil
              </button>

              {isDropdownOpen && (
                <div id="supervisor-profile-dropdown" className="absolute left-6 top-full mt-2 py-1 bg-blue-700 rounded-lg shadow-lg w-44 z-50">
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
        </div>
      </nav>

      {/* Main Content */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}