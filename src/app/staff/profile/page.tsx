'use client';

import { useState, useEffect } from 'react';

interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  department: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function StaffProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const sessionStr = localStorage.getItem('user_session');
        if (!sessionStr) {
          setError('Session tidak ditemukan');
          return;
        }

        const session = JSON.parse(sessionStr);
        
        const response = await fetch(`/api/staff/profile?userId=${session.id}`);
        if (!response.ok) {
          throw new Error('Gagal mengambil data profil');
        }
        
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Gagal mengambil data profil');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    try {
      const response = await fetch('/api/staff/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (response.ok) {
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Error saving profile:', err);
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-white p-4 flex items-center justify-center'>
        <p className='text-gray-600'>Loading...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className='min-h-screen bg-white p-4'>
        <div className='max-w-4xl mx-auto bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg'>
          {error || 'Data profil tidak ditemukan'}
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white p-4'>
      <div className='max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden'>
        <div className='bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 flex flex-col items-center'>
          <div className='w-32 h-32 bg-white rounded-full mb-4 flex items-center justify-center'>
            <svg className='w-20 h-20 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
            </svg>
          </div>
          <h1 className='text-2xl font-bold'>{profile.name}</h1>
          <p className='text-blue-100'>{profile.department}</p>
        </div>

        <div className='p-6'>
          <div className='mb-8'>
            <h2 className='text-xl font-semibold mb-4'>Informasi Personal</h2>
            {isEditing ? (
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm mb-1'>Nama Lengkap</label>
                  <input
                    type='text'
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className='w-full p-2 border rounded'
                  />
                </div>
                <div>
                  <label className='block text-sm mb-1'>Email</label>
                  <input
                    type='email'
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className='w-full p-2 border rounded'
                  />
                </div>
                <div>
                  <label className='block text-sm mb-1'>Departemen</label>
                  <input
                    type='text'
                    value={profile.department}
                    onChange={(e) => setProfile({...profile, department: e.target.value})}
                    className='w-full p-2 border rounded'
                  />
                </div>
              </div>
            ) : (
              <div className='space-y-4'>
                <div className='flex justify-between'>
                  <span>Username:</span>
                  <span>{profile.username}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Email:</span>
                  <span>{profile.email}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Departemen:</span>
                  <span>{profile.department}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Bergabung Sejak:</span>
                  <span>{new Date(profile.createdAt).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
            )}
          </div>

          <div className='flex justify-end'>
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className='mr-4 px-4 py-2 text-gray-600 hover:text-gray-800'
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
                >
                  Simpan
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
              >
                Edit Profil
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
