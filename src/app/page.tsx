"use client"
import Link from 'next/link'
import { useState, useEffect } from 'react'

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
      description: "Pengelolaan dan pelacakan tugas pemeliharaan dengan mudah dan terorganisir.",
      icon: "📋",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "Laporan Real-time",
      description: "Pemantauan status pekerjaan dan laporan pemeliharaan secara real-time.",
      icon: "📊",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Efisiensi Kerja",
      description: "Optimalkan alur kerja dan tingkatkan efisiensi pemeliharaan fasilitas.",
      icon: "⚡",
      gradient: "from-orange-500 to-red-500"
    }
  ]

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        {/* Primary Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transform transition-transform duration-1000 ease-out"
          style={{
            backgroundImage: 'url("/bg.js.jpeg")',
            transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px) scale(1.1)`
          }}
        />
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-blue-900/40 to-white-900/60" />
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

      {/* Navigation */}
      <nav className="relative z-50 p-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-white font-bold text-xl">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              UPA Perbaikan & Pemeliharaan
            </span>
          </div>
        </div>
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
            Sistem Manajemen Pemeliharaan Komputerisasi untuk pengelolaan dan pemeliharaan 
            <span className="text-blue-300 font-medium"> fasilitas kampus</span> yang lebih 
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
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
          </div>
        </div>

        {/* Enhanced Feature Cards */}
        <div id="features" className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Card Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`} />
              
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
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className={`mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-1000 delay-1000 ${isLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
          {[
            { number: '99%', label: 'Uptime' },
            { number: '500+', label: 'Tasks Completed' },
            { number: '24/7', label: 'Support' },
            { number: '100+', label: 'Facilities' }
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
    </main>
  )
}