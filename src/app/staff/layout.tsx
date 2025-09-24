'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();

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

  const staffMenuItems = [
    { href: '/staff/dashboard', label: ' Dashboard', icon: '📊' },
    { href: '/staff/tickets', label: ' Tiket Saya', icon: '📝' },
  ];

  return (
    <>
      {/* Staff Navigation */}
      <nav className="bg-blue-600 text-white shadow-lg fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo dan Menu */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold">CMMS Staff</span>
              </div>
              
              {/* Desktop Menu */}
              <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
                {staffMenuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${pathname === item.href
                        ? 'bg-blue-700 text-white'
                        : 'text-white hover:bg-blue-500'
                      }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center">
              <div className="relative ml-3">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 rounded-md transition-colors"
                >
                  <span className="mr-2">👤</span>
                  Menu
                  <svg className="ml-1 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      href="/staff/profile"
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

      {/* Main Content */}
      <div className="pt-16">
        {children}
      </div>
    </>
  );
}