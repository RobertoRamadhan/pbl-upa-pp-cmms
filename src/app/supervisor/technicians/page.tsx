'use client';

import { useState, useEffect } from 'react';

interface Technician {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  department: string | null;
  expertise: string | null;
  area: string | null;
  shift: string | null;
  rating: number;
  totalTasks: number;
  status: 'Available' | 'Busy';
}

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await fetch('/api/supervisor/technicians');
      if (!response.ok) throw new Error('Gagal memuat data teknisi');
      const data = await response.json();
      setTechnicians(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center text-red-600 py-10">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-8">Technician Detail</h1>

      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {technicians.map((tech) => (
              <tr key={tech.id}>
                <td className="px-6 py-4 text-sm text-gray-900">{tech.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{tech.name}</td>
                <td className="px-6 py-4 text-sm text-blue-600 underline">{tech.email}</td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() =>
                      setSelectedTechnician(
                        selectedTechnician?.id === tech.id ? null : tech
                      )
                    }
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full text-sm transition"
                  >
                    {selectedTechnician?.id === tech.id ? 'Hide detail' : 'See detail'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedTechnician && (
        <div className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Employee Detail</h2>
          <div className="flex items-start gap-6">
            {/* Foto profil placeholder */}
            <div className="w-28 h-28 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-blue-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 14c3.314 0 6-2.686 6-6S15.314 2 12 2 6 4.686 6 8s2.686 6 6 6zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z"
                />
              </svg>
            </div>

            {/* Detail teknisi */}
            <div className="flex-1 space-y-2">
              <div className="text-sm">
                <strong>ID:</strong> {selectedTechnician.id}
              </div>
              <div className="text-sm">
                <strong>Name:</strong> {selectedTechnician.name}
              </div>
              <div className="text-sm">
                <strong>Email:</strong>{' '}
                <a href={`mailto:${selectedTechnician.email}`} className="text-blue-600 underline">
                  {selectedTechnician.email}
                </a>
              </div>
              <div className="text-sm">
                <strong>Department:</strong> {selectedTechnician.department || '-'}
              </div>
              <div className="text-sm">
                <strong>Job Title:</strong> {selectedTechnician.expertise || 'Technician'}
              </div>
              <div className="text-sm mt-4">
                <em>
                  Join on November 2, 2024 to November 2, 2027 with the job title of{' '}
                  {selectedTechnician.expertise || 'Maintenance'}
                </em>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
