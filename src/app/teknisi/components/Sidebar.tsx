"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { href: "/teknisi/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/teknisi/repair", label: "Repair Tasks", icon: "🛠" },
    { href: "/teknisi/profile", label: "Profile", icon: "👤" },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.clear();
      router.push("/login");
    } catch (error) {
      alert("Gagal logout");
    }
  };

  return (
    <div className="h-full bg-gradient-to-b from-blue-600 to-blue-800 text-white shadow-lg flex flex-col">
      {/* HEADER */}
      <div className="p-5 text-xl font-bold border-b border-blue-500 flex justify-between items-center">
        🔧 Teknisi Panel
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto mt-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`flex items-center gap-3 px-6 py-3 hover:bg-blue-700 transition ${
              pathname === item.href ? "bg-blue-800 font-semibold" : ""
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        className="w-full px-6 py-3 text-left hover:bg-blue-700 border-t border-blue-500"
      >
        🚪 Logout
      </button>
      </nav>
    </div>
  );
}
