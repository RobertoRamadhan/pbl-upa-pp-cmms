'use client';

import { useState } from 'react';

export default function TeknisiProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    nama: 'John Doe',
    email: 'teknisi@upa-pp.ac.id',
    noHP: '081234567890',
    jabatan: 'Teknisi Lapangan',
    bergabung: '2023-01-01',
    keahlian: ['Jaringan', 'Hardware', 'Printer'],
    area: 'Gedung A & B',
    shift: 'Pagi (08.00 - 16.00)',
  });

  const handleSave = () => {
    // Implementasi penyimpanan perubahan
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 text-black">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header Profile dengan Background */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <svg className="w-20 h-20 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold">{profile.nama}</h1>
                <p className="text-blue-100">{profile.jabatan}</p>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">24</p>
              <p className="text-sm text-black">Tugas Selesai</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">98%</p>
              <p className="text-sm text-black">Rating</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">45m</p>
              <p className="text-sm text-black">Resp. Time</p>
            </div>
          </div>

          {/* Informasi Profile */}
          <div className="p-6">
            <div className="grid gap-6">
              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold mb-4">Informasi Personal</h2>
                <div className="space-y-4">
                  {isEditing ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Nama Lengkap</label>
                        <input
                          type="text"
                          value={profile.nama}
                          onChange={(e) => setProfile({...profile, nama: e.target.value})}
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Email</label>
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({...profile, email: e.target.value})}
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Nomor HP</label>
                        <input
                          type="tel"
                          value={profile.noHP}
                          onChange={(e) => setProfile({...profile, noHP: e.target.value})}
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-black">Email</span>
                        <span className="font-medium">{profile.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-black">Nomor HP</span>
                        <span className="font-medium">{profile.noHP}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-black">Bergabung Sejak</span>
                        <span className="font-medium">{profile.bergabung}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Informasi Teknisi */}
              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold mb-4">Informasi Teknisi</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-black mb-2">Area Penugasan</h3>
                    <p className="font-medium">{profile.area}</p>
                  </div>
                  <div>
                    <h3 className="text-black mb-2">Shift Kerja</h3>
                    <p className="font-medium">{profile.shift}</p>
                  </div>
                  <div>
                    <h3 className="text-black mb-2">Keahlian</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.keahlian.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold mb-4">Keamanan</h2>
                <button
                  className="bg-gray-100 text-black px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Ubah Password
                </button>
              </div>

              <div className="flex justify-end space-x-4">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-black hover:text-gray-900"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Simpan Perubahan
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Edit Profil
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}