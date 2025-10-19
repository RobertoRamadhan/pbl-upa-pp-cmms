"use client"

import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils/date';

// === Struktur data laporan ===
interface Report {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'assigned' | 'inProgress' | 'completed';
  submittedBy: string;
  submittedAt: string;
}

export default function ReportPage() {
  // === State utama untuk data laporan, loading, dan error ===
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // === Fetch data laporan dari API ===
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('/api/tickets');
        const data = await response.json();

        // Pastikan data berbentuk array
        const tickets = Array.isArray(data) ? data : [];

        // Format data laporan agar sesuai dengan interface
        const formattedReports = tickets.map((ticket: any) => ({
          id: ticket.id,
          title: ticket.title || "Tanpa Judul",
          description: ticket.description || "-",
          status: (ticket.status || "pending").toLowerCase(),
          submittedBy: ticket.reporter?.name || "Tidak diketahui",
          submittedAt: ticket.createdAt,
        }));

        setReports(formattedReports);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat laporan');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // === Loader saat data belum selesai dimuat ===
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // === Tampilan utama tabel laporan ===
  return (
    <div className="p-6 text-black">
      <h1 className="text-2xl font-semibold mb-6">Daftar Laporan</h1>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Judul</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Pelapor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {/* === Jika tidak ada data, tampilkan pesan di 1 baris tabel === */}
            {reports.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-6 text-gray-500 italic"
                >
                  Belum ada laporan.
                </td>
              </tr>
            ) : (
              // === Jika ada data, tampilkan semua baris laporan ===
              reports.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{report.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{report.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${report.status === 'assigned' ? 'bg-blue-100 text-blue-800' : ''}
                        ${report.status === 'inProgress' ? 'bg-purple-100 text-purple-800' : ''}
                        ${report.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                      `}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{report.submittedBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {formatDate(report.submittedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      onClick={() => {/* Lihat detail laporan */}}
                    >
                      Detail
                    </button>
                    <button
                      className="text-green-600 hover:text-green-900"
                      onClick={() => {/* Assign ke teknisi */}}
                    >
                      Assign
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
