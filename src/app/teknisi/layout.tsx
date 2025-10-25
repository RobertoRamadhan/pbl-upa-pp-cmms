"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TeknisiLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.clear();
      window.location.href = "/login";
    } catch (error) {
      alert("Gagal logout");
    }
  };

  const menuItems = [
    { href: "/teknisi/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/teknisi/repair", label: "Repair Tasks", icon: "🛠" },
    { href: "/teknisi/profile", label: "Profile", icon: "👤" },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex flex-col bg-blue-600 text-white w-64 fixed inset-y-0 shadow-lg">
        <div className="p-5 text-xl font-bold border-b border-blue-500">
          🔧 Teknisi Panel
        </div>

        <nav className="mt-2 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 hover:bg-blue-700 transition ${
                pathname === item.href ? "bg-blue-800 font-semibold" : ""
              }`}
            >
              {item.icon} {item.label}
            </Link>
          ))} 
                  <button
          onClick={handleLogout}
          className="w-full px-6 py-3 text-left hover:bg-blue-700 border-t border-blue-500"
        >
          🚪 Logout
        </button>
        </nav>
      </aside>

      {/* HEADER MOBILE */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-blue-600 text-white h-14 flex items-center px-4 shadow-md z-40">
        <button onClick={() => setIsSidebarOpen(true)} className="text-2xl mr-3">
          ☰
        </button>
        <h1 className="text-lg font-semibold">Teknisi Panel</h1>
      </header>

      {/* OVERLAY MOBILE */}
      {isSidebarOpen && (
        <div
          className="bg-gray-700 bg-opacity-20 fixed inset-0 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR MOBILE */}
      <aside
        className={`fixed top-0 left-0 w-64 h-full bg-blue-600 text-white z-40 transform transition-transform duration-300 md:hidden flex flex-col ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 text-xl font-bold border-b border-blue-500 flex justify-between items-center">
          🔧 Teknisi
          <button onClick={() => setIsSidebarOpen(false)} className="text-2xl">
            ✕
          </button>
        </div>

        <nav className="mt-2 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-6 py-3 hover:bg-blue-700 transition ${
                pathname === item.href ? "bg-blue-800 font-semibold" : ""
              }`}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        <button
          onClick={handleLogout}
          className="w-full px-6 py-3 text-left hover:bg-blue-700 border-t border-blue-500"
        >
          🚪 Logout
        </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 pt-16 md:pt-4 md:ml-64 transition-all">
        {children}
      </main>
    </div>
  );
}
