"use client"

import { useState, useEffect } from 'react';
import ReportDetailDialog from './ReportDetailDialog';
import { formatDate } from '@/lib/utils/date';

interface Report {
  id: string;
  title: string;
  description: string;
  category?: string;
  severity?: string;
  priority?: string;
  status: 'pending' | 'assigned' | 'inProgress' | 'completed';
  submittedBy: string;
  submittedAt: string;
  location?: string;
  assetCode?: string;
}

interface ApiTicket {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  severity?: string;
  priority?: string;
  status?: string;
  reporter?: { name?: string } | null;
  createdAt?: string;
  location?: string;
  assetCode?: string;
}

export default function ReportPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('/api/tickets');
        const data = await response.json();
        const tickets = Array.isArray(data) ? data as ApiTicket[] : [];

        const formattedReports: Report[] = tickets.map((t) => {
          const rawStatus = (t.status || 'PENDING').toUpperCase();
          let status: Report['status'];
          if (rawStatus === 'IN_PROGRESS' || rawStatus === 'INPROGRESS') {
            status = 'inProgress';
          } else if (rawStatus === 'ASSIGNED') {
            status = 'assigned';
          } else if (rawStatus === 'COMPLETED') {
            status = 'completed';
          } else {
            status = 'pending';
          }

          return {
            id: t.id,
            title: (t as any).subject || (t as any).ticketNumber || "Tanpa Judul",
            description: (t as any).description || "-",
            category: (t as any).category || "-",
            severity: (t as any).severity || "-",
            priority: (t as any).priority || "-",
            status,
            submittedBy: (t as any).user?.name || "Tidak diketahui",
            submittedAt: (t as any).createdAt ?? '',
            location: (t as any).location || "-",
            assetCode: (t as any).assetCode || "-",
          };
        });

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
  <table className="min-w-full" data-testid="reports-table">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Judul</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Kategori</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Prioritas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Keparahan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Lokasi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Pelapor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {reports.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-6 text-gray-500 italic">
                  Belum ada laporan.
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-black">{report.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{report.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      report.priority === 'high' || report.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                      report.priority === 'medium' || report.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {report.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      report.severity === 'CRITICAL' ? 'bg-red-200 text-red-800' :
                      report.severity === 'HIGH' ? 'bg-orange-200 text-orange-800' :
                      report.severity === 'NORMAL' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-green-200 text-green-800'
                    }`}>
                      {report.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{report.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{report.submittedBy}</td>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {formatDate(report.submittedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      data-testid={`detail-${report.id}`}
                      onClick={() => setSelectedReport(report)}
                    >
                      Detail
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      data-testid={`delete-${report.id}`}
                      onClick={async () => {
                        // confirmation
                        if (!confirm('Hapus laporan ini?')) return;
                        try {
                          setDeletingId(report.id);
                          const res = await fetch(`/api/tickets?id=${encodeURIComponent(report.id)}`, {
                            method: 'DELETE',
                          });
                          if (!res.ok) {
                            const body = await res.json().catch(() => ({}));
                            throw new Error(body?.error || 'Gagal menghapus');
                          }
                          setReports((r) => r.filter((x) => x.id !== report.id));
                        } catch (err) {
                          console.error(err);
                          alert('Gagal menghapus laporan');
                        } finally {
                          setDeletingId(null);
                        }
                      }}
                    >
                      {deletingId === report.id ? 'Menghapus...' : 'Hapus'}
                    </button>
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
                  <p className="text-xs text-gray-500 mt-1">{report.category}</p>
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

              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="text-gray-600">
                  <span className="font-medium">Prioritas:</span> {report.priority}
                </div>
                <div className="text-gray-600">
                  <span className="font-medium">Keparahan:</span> {report.severity}
                </div>
                <div className="text-gray-600">
                  <span className="font-medium">Lokasi:</span> {report.location}
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-1">
                <span className="font-medium text-gray-700">Pelapor:</span> {report.submittedBy}
              </div>
              <div className="text-xs text-gray-500 mb-4">
                <span className="font-medium text-gray-700">Tanggal:</span> {formatDate(report.submittedAt)}
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors duration-200"
                  onClick={() => setSelectedReport(report)}
                >
                  Detail
                </button>
                <button
                  className="text-red-600 hover:text-red-800 text-xs font-medium transition-colors duration-200"
                  onClick={async () => {
                    if (!confirm('Hapus laporan ini?')) return;
                    try {
                      setDeletingId(report.id);
                      const res = await fetch(`/api/tickets?id=${encodeURIComponent(report.id)}`, {
                        method: 'DELETE',
                      });
                      if (!res.ok) {
                        const body = await res.json().catch(() => ({}));
                        throw new Error(body?.error || 'Gagal menghapus');
                      }
                      setReports((r) => r.filter((x) => x.id !== report.id));
                    } catch (err) {
                      console.error(err);
                      alert('Gagal menghapus laporan');
                    } finally {
                      setDeletingId(null);
                    }
                  }}
                >
                  {deletingId === report.id ? 'Menghapus...' : 'Hapus'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Detail dialog */}
      <ReportDetailDialog
        isOpen={!!selectedReport}
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
}
