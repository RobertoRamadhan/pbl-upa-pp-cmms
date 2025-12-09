'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TechnicianProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  joinDate: string;
  technicianProfile: {
    expertise: string;
    area: string;
    shift: string;
  } | null;
}

export default function TeknisiProfile() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<TechnicianProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    expertise: '',
    area: '',
    shift: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const sessionStr = localStorage.getItem('user_session');
      if (!sessionStr) {
        router.push('/login');
        return;
      }

      const session = JSON.parse(sessionStr);
      const response = await fetch(`/api/admin/technicians/${session.id}`);
      
      if (!response.ok) {
        throw new Error('Gagal mengambil profil');
      }

      const data = await response.json();
      setProfile(data);
      setFormData({
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        expertise: data.technicianProfile?.expertise || '',
        area: data.technicianProfile?.area || '',
        shift: data.technicianProfile?.shift || '',
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Terjadi kesalahan saat memuat profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setError('');
      const sessionStr = localStorage.getItem('user_session');
      if (!sessionStr) {
        router.push('/login');
        return;
      }

      const session = JSON.parse(sessionStr);
      const response = await fetch(`/api/admin/technicians/${session.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          expertise: formData.expertise,
          area: formData.area,
          shift: formData.shift,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Gagal menyimpan profil');
      }

      setIsEditing(false);
      await fetchProfile();
      alert('Profil berhasil diperbarui');
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 text-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 text-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600">{error || 'Profil tidak ditemukan'}</p>
        </div>
      </div>
    );
  }

  const joinDate = new Date(profile.joinDate).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

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
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <p className="text-blue-100">Teknisi</p>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 gap-4 p-4 bg-blue-50">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">--</p>
              <p className="text-sm text-black">Tugas Selesai</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
              {error}
            </div>
          )}

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
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full p-2 border rounded-md border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full p-2 border rounded-md border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Nomor HP</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full p-2 border rounded-md border-gray-300"
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
                        <span className="font-medium">{profile.phone || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-black">Bergabung Sejak</span>
                        <span className="font-medium">{joinDate}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Informasi Teknisi */}
              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold mb-4">Informasi Teknisi</h2>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Keahlian</label>
                      <input
                        type="text"
                        value={formData.expertise}
                        onChange={(e) => setFormData({...formData, expertise: e.target.value})}
                        className="w-full p-2 border rounded-md border-gray-300"
                        placeholder="Contoh: Jaringan, Hardware, Printer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Area Penugasan</label>
                      <input
                        type="text"
                        value={formData.area}
                        onChange={(e) => setFormData({...formData, area: e.target.value})}
                        className="w-full p-2 border rounded-md border-gray-300"
                        placeholder="Contoh: Gedung A & B"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Shift Kerja</label>
                      <select
                        value={formData.shift}
                        onChange={(e) => setFormData({...formData, shift: e.target.value})}
                        className="w-full p-2 border rounded-md border-gray-300"
                      >
                        <option value="">Pilih Shift</option>
                        <option value="Pagi">Pagi</option>
                        <option value="Siang">Siang</option>
                        <option value="Malam">Malam</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-black mb-2">Keahlian</h3>
                      <p className="font-medium">{profile.technicianProfile?.expertise || '-'}</p>
                    </div>
                    <div>
                      <h3 className="text-black mb-2">Area Penugasan</h3>
                      <p className="font-medium">{profile.technicianProfile?.area || '-'}</p>
                    </div>
                    <div>
                      <h3 className="text-black mb-2">Shift Kerja</h3>
                      <p className="font-medium">{profile.technicianProfile?.shift || '-'}</p>
                    </div>
                  </div>
                )}
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