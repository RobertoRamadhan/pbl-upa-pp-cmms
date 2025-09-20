'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState('staff');
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    {
      id: 'staff',
      name: 'Staff',
      icon: '👤',
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Staff Member'
    },
    {
      id: 'admin',
      name: 'Admin',
      icon: '⚙️',
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Administrator'
    },
    {
      id: 'teknisi',
      name: 'Teknisi',
      icon: '🔧',
      color: 'bg-orange-500 hover:bg-orange-600',
      description: 'Technical Support'
    }
  ];

  // Demo credentials for testing
  const demoCredentials = {
    staff: { username: 'staff', password: 'staff123' },
    admin: { username: 'admin', password: 'admin123' },
    teknisi: { username: 'teknisi', password: 'teknisi123' }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      const roleCredentials = demoCredentials[selectedRole];
      
      if (credentials.username === roleCredentials.username && 
          credentials.password === roleCredentials.password) {
        
        // Store user session (in a real app, use secure storage)
        const userSession = {
          username: credentials.username,
          role: selectedRole,
          loginTime: new Date().toISOString()
        };

        // Redirect based on role
        const redirectPaths = {
          staff: '/staff/dashboard',
          admin: '/admin/dashboard',
          teknisi: '/teknisi/dashboard'
        };
        
        alert(`✅ Login successful!\nRole: ${selectedRole}\nRedirecting to: ${redirectPaths[selectedRole]}`);
        
      } else {
        setError('❌ Invalid username or password');
      }
      
      setIsLoading(false);
    }, 1000);
  };

  const handleInputChange = (field, value) => {
    setCredentials({
      ...credentials,
      [field]: value
    });
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl"></span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Login</h1>
            <p className="text-gray-600">Selamat bekerja</p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-black mb-2">
              Select Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none bg-white text-black"
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
              <option value="teknisi">Teknisi</option>
            </select>
          </div>

          {/* Login Form */}
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Username
              </label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none text-black"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Password
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none text-black"
                placeholder="Enter your password"
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !credentials.username || !credentials.password}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 ${
                roles.find(r => r.id === selectedRole)?.color
              } disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Sign in as {roles.find(r => r.id === selectedRole)?.name}
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>© 2024 CMMS System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}