"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setIsLoaded(true)
    
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const features = [
    {
      title: "Manajemen Tugas",
      description:
        "Pengelolaan dan pelacakan tugas pemeliharaan dengan mudah dan terorganisir.",
      icon: "📋",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Laporan Real-time",
      description:
        "Pemantauan status pekerjaan dan laporan pemeliharaan secara real-time.",
      icon: "📊",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Efisiensi Kerja",
      description:
        "Optimalkan alur kerja dan tingkatkan efisiensi pemeliharaan fasilitas.",
      icon: "⚡",
      gradient: "from-orange-500 to-red-500",
    },
  ];

   return (
      <main className="relative min-h-screen w-full overflow-x-hidden overflow-y-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        {/* Primary Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transform transition-transform duration-1000 ease-out"
          style={{
            backgroundImage: 'url("/bg.js.jpeg")',
            transform: `translate(${mousePosition.x * -0.02}px, ${
              mousePosition.y * -0.02
            }px) scale(1.1)`,
          }}
        />
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-blue-900/40 to-purple-900/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {/* Animated Particles - Only render on client */}
        {isLoaded && (
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full opacity-20 animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Navbar */}
        <nav
          className={`absolute top-0 left-0 w-full z-50 transition-all duration-700 ease-in-out ${
            isScrolled
              ? "bg-black/40 border-b border-white/10 shadow-lg"
              : "bg-transparent border-transparent"
          }`}
        >

        <div className="container mx-auto flex justify-between items-center px-6 py-4">
          {/* Logo */}
          <div className="text-white font-bold text-xl">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              UPA Perbaikan & Pemeliharaan
            </span>
          </div>

          {/* Menu desktop */}
          <div className="hidden md:flex space-x-6 text-sm text-gray-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>

          {/* Hamburger menu (mobile) */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-200 hover:text-white focus:outline-none transition"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Dropdown mobile */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/70 backdrop-blur-lg border-t border-white/10">
            <div className="flex flex-col items-center py-4 space-y-3 text-gray-300">
              <a href="#features" onClick={() => setIsMenuOpen(false)} className="hover:text-white transition-colors">Features</a>
              <a href="#about" onClick={() => setIsMenuOpen(false)} className="hover:text-white transition-colors">About</a>
              <a href="#contact" onClick={() => setIsMenuOpen(false)} className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 pt-12 pb-24">
        <div className={`text-center transition-all duration-1000 ${isLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
          {/* Main Title with Enhanced Styling */}
          <div className="mb-6">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
                UPA
              </span>
              <br />
              <span className="text-3xl md:text-4xl font-light text-gray-200">
                Perbaikan & Pemeliharaan
              </span>
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-8" />
          </div>

          {/* Enhanced Description */}
          <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
            Sistem Manajemen Pemeliharaan Komputerisasi untuk pengelolaan dan
            pemeliharaan
            <span className="text-blue-300 font-medium">
              {" "}
              fasilitas kampus
            </span>{" "}
            yang lebih
            <span className="text-purple-300 font-medium"> efisien</span> dan
            <span className="text-cyan-300 font-medium"> terorganisir</span>.
          </p>

          {/* Enhanced CTA Button */}
          <div className="mb-16">
            <Link
              href="/login"
              className="group relative inline-flex items-center justify-center px-12 py-4 text-lg font-semibold text-white transition-all duration-300 ease-out hover:scale-105 hover:shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-2xl transition-all duration-300 group-hover:from-blue-500 group-hover:via-purple-500 group-hover:to-cyan-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
              <span className="relative flex items-center space-x-3">
                <span>Masuk</span>
                <svg
                  className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
            </Link>
          </div>
        </div>

        {/* Enhanced Feature Cards */}
        <div
          id="features"
          className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-1000 delay-500 ${
            isLoaded
              ? "opacity-100 transform translate-y-0"
              : "opacity-0 transform translate-y-10"
          }`}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Card Glow Effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`}
              />

              {/* Icon */}
              <div className="text-6xl mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-300 group-hover:to-purple-300 group-hover:bg-clip-text transition-all duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                {feature.description}
              </p>

              {/* Hover Arrow */}
              <div className="absolute bottom-6 right-6 transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                <svg
                  className="w-6 h-6 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div
          className={`mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-1000 delay-1000 ${
            isLoaded
              ? "opacity-100 transform translate-y-0"
              : "opacity-0 transform translate-y-10"
          }`}
        >
          {[
            { number: "99%", label: "Uptime" },
            { number: "500+", label: "Tasks Completed" },
            { number: "24/7", label: "Support" },
            { number: "100+", label: "Facilities" },
          ].map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="text-3xl md:text-4xl font-black text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                {stat.number}
              </div>
              <div className="text-gray-400 text-sm uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent z-5" />

      {/* Footer Section */}
      <footer className="relative z-10 bg-black/40 backdrop-blur-lg border-t border-white/10 mt-24">
        <div className="container mx-auto px-6 py-12">
          {/* Logo & Deskripsi */}
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
            <div className="text-center md:text-left max-w-md">
              <h2 className="text-2xl font-bold text-white mb-2">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  UPA Perbaikan & Pemeliharaan
                </span>
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Sistem Manajemen Pemeliharaan Komputerisasi (CMMS) yang membantu mengelola,
                memonitor, dan meningkatkan efisiensi perawatan fasilitas kampus.
              </p>
            </div>

            {/* Navigasi Footer */}
            <div className="flex flex-col md:flex-row gap-8 text-center md:text-left">
              <div>
                <h3 className="text-white font-semibold mb-3">Navigasi</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                  <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3">Kontak</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>📍 Politeknik Negeri Batam</li>
                  <li>✉️ upa@polibatam.ac.id</li>
                  <li>📞 (0778) 1234567</li>
                </ul>
              </div>
            </div>

            {/* Sosial Media */}
            <div className="flex flex-col items-center md:items-end space-y-3">
              <h3 className="text-white font-semibold">Ikuti Kami</h3>
              <div className="flex space-x-4 text-gray-400">
                <a href="#" className="hover:text-blue-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.25 4.25 0 0 0 1.88-2.35 8.48 8.48 0 0 1-2.69 1.03 4.22 4.22 0 0 0-7.2 3.85A12 12 0 0 1 3.16 4.9a4.22 4.22 0 0 0 1.31 5.63 4.15 4.15 0 0 1-1.91-.53v.05a4.23 4.23 0 0 0 3.39 4.13c-.47.13-.98.2-1.5.2-.36 0-.72-.03-1.07-.1a4.22 4.22 0 0 0 3.94 2.93A8.47 8.47 0 0 1 2 19.54a11.93 11.93 0 0 0 6.29 1.84c7.55 0 11.68-6.26 11.68-11.68 0-.18 0-.35-.01-.53A8.3 8.3 0 0 0 22.46 6z" />
                  </svg>
                </a>
                <a href="#" className="hover:text-purple-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.04c-5.5 0-9.96 4.46-9.96 9.96 0 4.41 3.58 8.09 8 8.9v-6.3H7.9v-2.6h2.14V9.47c0-2.1 1.25-3.27 3.16-3.27.92 0 1.88.17 1.88.17v2.07h-1.06c-1.04 0-1.37.65-1.37 1.32v1.58h2.34l-.37 2.6h-1.97v6.3c4.42-.81 8-4.49 8-8.9 0-5.5-4.46-9.96-9.96-9.96z" />
                  </svg>
                </a>
                <a href="#" className="hover:text-cyan-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 6.5a8.38 8.38 0 0 1-2.4.66A4.2 4.2 0 0 0 20.4 4a8.27 8.27 0 0 1-2.65 1A4.15 4.15 0 0 0 12 8.15a11.8 11.8 0 0 1-8.6-4.36A4.15 4.15 0 0 0 5.1 9.5a4.1 4.1 0 0 1-1.87-.52v.05a4.15 4.15 0 0 0 3.33 4.07 4.16 4.16 0 0 1-1.86.07 4.16 4.16 0 0 0 3.89 2.9A8.35 8.35 0 0 1 2 18.57a11.77 11.77 0 0 0 6.29 1.84c7.55 0 11.68-6.26 11.68-11.68 0-.18 0-.35-.01-.53A8.18 8.18 0 0 0 21 6.5z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Garis bawah */}
          <div className="border-t border-white/10 mt-8 pt-6 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} UPA Perbaikan & Pemeliharaan. All rights reserved.
          </div>
        </div>
      </footer>

    </main>
  );
}
