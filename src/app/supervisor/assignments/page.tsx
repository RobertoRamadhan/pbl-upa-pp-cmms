'use client';

import { useState, useEffect } from 'react';

interface Assignment {
  id: string;
  ticketId: string;
  technicianId: string;
  technicianName: string;
  status: string;
  startTime?: Date;
  endTime?: Date;
  notes?: string;
}

export default function SupervisorAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null); // status yang sedang dilihat

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch('/api/assignments');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch assignments');
        }

        setAssignments(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching assignments:', error);
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  // Hitung jumlah tiket per status
  const todoCount = assignments.filter(a => a.status === 'TODO').length;
  const inProgressCount = assignments.filter(a => a.status === 'IN_PROGRESS').length;
  const doneCount = assignments.filter(a => a.status === 'COMPLETED').length;

  // Data yang akan ditampilkan berdasarkan status terpilih
  const filteredAssignments = selectedStatus
    ? assignments.filter(a => a.status === selectedStatus)
    : assignments;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* === Bagian Kartu Status === */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* TO DO */}
        <div className="text-center bg-gray-300 rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-2">TO DO :</h2>
          <p className="text-sm text-gray-700">Total tickets</p>
          <p className="text-4xl font-bold my-2">{todoCount}</p>
          <button
            className="mt-2 px-4 py-1 bg-lime-400 text-black font-semibold rounded-full hover:bg-lime-500 transition-colors"
            onClick={() =>
              setSelectedStatus(selectedStatus === 'TODO' ? null : 'TODO')
            }
          >
            VIEW
          </button>
        </div>

        {/* IN PROGRESS */}
        <div className="text-center bg-gradient-to-b from-yellow-300 to-yellow-400 rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-2">IN PROGRESS :</h2>
          <p className="text-sm text-gray-700">Total tickets</p>
          <p className="text-4xl font-bold my-2">{inProgressCount}</p>
          <button
            className="mt-2 px-4 py-1 bg-lime-400 text-black font-semibold rounded-full hover:bg-lime-500 transition-colors"
            onClick={() =>
              setSelectedStatus(selectedStatus === 'IN_PROGRESS' ? null : 'IN_PROGRESS')
            }
          >
            VIEW
          </button>
        </div>

        {/* DONE */}
        <div className="text-center bg-gradient-to-b from-green-300 to-green-400 rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-2">DONE :</h2>
          <p className="text-sm text-gray-700">Total tickets</p>
          <p className="text-4xl font-bold my-2">{doneCount}</p>
          <button
            className="mt-2 px-4 py-1 bg-lime-400 text-black font-semibold rounded-full hover:bg-lime-500 transition-colors"
            onClick={() =>
              setSelectedStatus(selectedStatus === 'COMPLETED' ? null : 'COMPLETED')
            }
          >
            VIEW
          </button>
        </div>
      </div>

      {/* === Judul & Tombol Tambah === */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {selectedStatus
            ? `Detail Penugasan (${selectedStatus.replace('_', ' ')})`
            : 'Daftar Penugasan'}
        </h1>

        {!selectedStatus && (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => {
              /* Tambah penugasan baru */
            }}
          >
            Tambah Penugasan
          </button>
        )}
      </div>

      {/* === Tabel Penugasan === */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Tiket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teknisi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Waktu Mulai
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Waktu Selesai
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssignments.length > 0 ? (
                filteredAssignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{assignment.ticketId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{assignment.technicianName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${assignment.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : assignment.status === 'IN_PROGRESS'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {assignment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assignment.startTime ? new Date(assignment.startTime).toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assignment.endTime ? new Date(assignment.endTime).toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Hapus</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-6 text-gray-500 text-sm"
                  >
                    Tidak ada penugasan untuk status ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tombol kembali jika sedang melihat detail */}
      {selectedStatus && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setSelectedStatus(null)}
            className="px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400 transition-colors"
          >
            Kembali ke Semua Penugasan
          </button>
        </div>
      )}
    </div>
  );
}
