"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";

export default function TeknisiLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 w-64">
        <Sidebar />
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
        <>
          <div
            className="bg-gray-700 bg-opacity-40 fixed inset-0 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
          <aside
            className={`fixed top-0 left-0 w-64 h-full bg-blue-600 text-white z-40 transform transition-transform duration-300 md:hidden flex flex-col ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <Sidebar onClose={() => setIsSidebarOpen(false)} />
          </aside>
        </>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 pt-16 md:pt-4 md:ml-64 transition-all">
        {children}
      </main>
    </div>
  );
}
