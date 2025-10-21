'use client';

import { useState } from 'react';

export default function SupervisorProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    nama: 'John Doe',
    email: 'supervisor@upa-pp.ac.id',
    noHP: '081234567890',
    jabatan: 'Supervisor',
    bergabung: '2023-01-01',
  });

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className='min-h-screen bg-gray-50 p-4'>
      <div className='max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden'>
        <div className='bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 flex flex-col items-center'>
          <div className='w-32 h-32 bg-white rounded-full mb-4 flex items-center justify-center'>
            <svg className='w-20 h-20 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
            </svg>
          </div>
          <h1 className='text-2xl font-bold'>{profile.nama}</h1>
          <p className='text-blue-100'>{profile.jabatan}</p>
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
                    value={profile.nama}
                    onChange={(e) => setProfile({...profile, nama: e.target.value})}
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
                  <label className='block text-sm mb-1'>Nomor HP</label>
                  <input
                    type='tel'
                    value={profile.noHP}
                    onChange={(e) => setProfile({...profile, noHP: e.target.value})}
                    className='w-full p-2 border rounded'
                  />
                </div>
              </div>
            ) : (
              <div className='space-y-4'>
                <div className='flex justify-between'>
                  <span>Email:</span>
                  <span>{profile.email}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Nomor HP:</span>
                  <span>{profile.noHP}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Bergabung Sejak:</span>
                  <span>{profile.bergabung}</span>
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
