"use client"

import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils/date';

interface Report {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'assigned' | 'inProgress' | 'completed';
  submittedBy: string;
  submittedAt: string;
}

export default function ReportPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('/api/tickets');
        const data = await response.json();
        const tickets = Array.isArray(data) ? data : [];
        const formattedReports = tickets.map((ticket: any) => ({
          id: ticket.id,
          title: ticket.title || "Tanpa Judul",
          description: ticket.description || "-",
          status: ticket.status === "IN_PROGRESS" ? "inProgress" : (ticket.status || "pending").toLowerCase(),
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 font-medium">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 text-black">
      <h1 className="text-2xl font-semibold mb-6">Daftar Laporan</h1>

      {/* ✅ Tabel untuk layar besar */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
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
            {reports.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500 italic">
                  Belum ada laporan.
                </td>
              </tr>
            ) : (
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
                    <button className="text-blue-600 hover:text-blue-900 mr-4">Detail</button>
                    <button className="text-green-600 hover:text-green-900">Assign</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Tampilan card untuk mobile */}
      <div className="md:hidden space-y-4">
        {reports.length === 0 ? (
          <div className="text-center text-gray-500 italic">Belum ada laporan.</div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-lg shadow p-4 border border-gray-100"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h2 className="font-semibold text-gray-800">{report.title}</h2>
                  <p className="text-xs text-gray-500 mt-1">ID: {report.id}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full
                    ${report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${report.status === 'assigned' ? 'bg-blue-100 text-blue-800' : ''}
                    ${report.status === 'inProgress' ? 'bg-purple-100 text-purple-800' : ''}
                    ${report.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                  `}
                >
                  {report.status}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3">{report.description}</p>

              <div className="text-xs text-gray-500 mb-1">
                <span className="font-medium text-gray-700">Pelapor:</span> {report.submittedBy}
              </div>
              <div className="text-xs text-gray-500 mb-4">
                <span className="font-medium text-gray-700">Tanggal:</span> {formatDate(report.submittedAt)}
              </div>

              <div className="flex gap-3">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200">
                  Detail
                </button>
                <button className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors duration-200">
                  Assign
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
