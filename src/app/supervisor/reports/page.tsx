'use client';

import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils/date';

interface CompletionReport {
  id: string;
  ticketNumber: string;
  subject: string;
  technicianName: string;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  completedAt: string;
  images: string[];
  description?: string;
  category?: string;
  priority?: string;
  severity?: string;
}

export default function SupervisorReports() {
  const [reports, setReports] = useState<CompletionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [detailModal, setDetailModal] = useState<{ open: boolean; report: CompletionReport | null }>({
    open: false,
    report: null,
  });
  const [verifyModal, setVerifyModal] = useState<{ open: boolean; reportId: string; action: 'APPROVE' | 'REJECT' | null }>({
    open: false,
    reportId: '',
    action: null,
  });
  const [verifyNotes, setVerifyNotes] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/completion-evidence`, {
        cache: 'no-store',
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: reports.length,
    approved: reports.filter(r => r.verificationStatus === 'APPROVED').length,
    pending: reports.filter(r => r.verificationStatus === 'PENDING').length,
    rejected: reports.filter(r => r.verificationStatus === 'REJECTED').length,
  };

  const getDifficulty = (severity?: string, priority?: string) => {
    if (severity === 'CRITICAL' || priority === 'URGENT') return { level: 'SULIT', color: 'bg-red-100 text-red-800', icon: '🔴' };
    if (severity === 'HIGH' || priority === 'HIGH') return { level: 'SEDANG', color: 'bg-orange-100 text-orange-800', icon: '🟠' };
    return { level: 'MUDAH', color: 'bg-green-100 text-green-800', icon: '🟢' };
  };

  const handleVerify = async (reportId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      setVerifying(true);
      const response = await fetch(`/api/completion-evidence/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId: reportId, action, notes: verifyNotes }),
      });

      if (!response.ok) throw new Error('Verification failed');

      setVerifyNotes('');
      setVerifyModal({ open: false, reportId: '', action: null });
      setDetailModal({ open: false, report: null });
      await fetchReports();
    } catch (error) {
      console.error('Error verifying:', error);
      alert('Gagal memverifikasi laporan');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Laporan Penyelesaian Pekerjaan</h1>
        <p className="text-gray-600 mt-2">Lihat semua pekerjaan teknisi yang sudah selesai</p>
      </div>

      {/* ===== Statistik Ringkas ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-4 text-center border-l-4 border-blue-500">
          <div className="text-gray-600 text-sm">Total Laporan</div>
          <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center border-l-4 border-green-500">
          <div className="text-gray-600 text-sm">Disetujui</div>
          <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center border-l-4 border-yellow-500">
          <div className="text-gray-600 text-sm">Menunggu Review</div>
          <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center border-l-4 border-red-500">
          <div className="text-gray-600 text-sm">Ditolak</div>
          <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
        </div>
      </div>

      {/* Reports List - Simplified */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500 text-lg">Tidak ada laporan untuk status ini</p>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left - Info */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Nomor Tiket</p>
                    <p className="text-lg font-semibold text-gray-900">{report.ticketNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Subjek</p>
                    <p className="text-base text-gray-900">{report.subject}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Teknisi</p>
                    <p className="text-base text-gray-900">{report.technicianName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tanggal Selesai</p>
                    <p className="text-base text-gray-900">{formatDate(report.completedAt)}</p>
                  </div>
                </div>

                {/* Right - Images & Action */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-3">Bukti Penyelesaian ({report.images.length} gambar)</p>
                    {report.images.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {report.images.map((image, index) => (
                          <div
                            key={index}
                            className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => setSelectedImage(image)}
                          >
                            <img
                              src={image}
                              alt={`Bukti ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center">
                              <span className="text-white text-opacity-0 hover:text-opacity-100 transition-all text-sm font-semibold">
                                Lihat
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm italic">Tidak ada gambar</p>
                    )}
                  </div>
                  <button
                    onClick={() => setDetailModal({ open: true, report })}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                  >
                    Detail & Verifikasi
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-60 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 text-3xl z-10"
            >
              ✕
            </button>
            <img
              src={selectedImage}
              alt="Bukti Penyelesaian"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal.open && detailModal.report && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b bg-gray-50">
              <h2 className="text-2xl font-bold">{detailModal.report.ticketNumber}</h2>
              <button
                onClick={() => setDetailModal({ open: false, report: null })}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Subjek & Deskripsi */}
              <div>
                <h3 className="text-lg font-semibold mb-2">{detailModal.report.subject}</h3>
                {detailModal.report.description && (
                  <p className="text-gray-600">{detailModal.report.description}</p>
                )}
              </div>

              {/* Difficulty Card */}
              {(() => {
                const difficulty = getDifficulty(detailModal.report.severity, detailModal.report.priority);
                return (
                  <div className={`p-4 rounded-lg ${difficulty.color}`}>
                    <p className="font-semibold text-lg">
                      {difficulty.icon} Tingkat Kesulitan: <span className="uppercase">{difficulty.level}</span>
                    </p>
                  </div>
                );
              })()}

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Kategori</p>
                  <p className="font-medium">{detailModal.report.category || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Teknisi</p>
                  <p className="font-medium">{detailModal.report.technicianName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Prioritas</p>
                  <p className="font-medium">{detailModal.report.priority || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tanggal Selesai</p>
                  <p className="font-medium">{formatDate(detailModal.report.completedAt)}</p>
                </div>
              </div>

              {/* Verification Status */}
              <div className={`p-4 rounded-lg ${
                detailModal.report.verificationStatus === 'APPROVED' ? 'bg-green-50 border border-green-200' :
                detailModal.report.verificationStatus === 'REJECTED' ? 'bg-red-50 border border-red-200' :
                'bg-yellow-50 border border-yellow-200'
              }`}>
                <p className="font-semibold">
                  Status: {
                    detailModal.report.verificationStatus === 'APPROVED' ? '✓ Disetujui' :
                    detailModal.report.verificationStatus === 'REJECTED' ? '✗ Ditolak' :
                    '⏳ Menunggu Verifikasi'
                  }
                </p>
              </div>

              {/* Action Buttons - only show if PENDING */}
              {detailModal.report.verificationStatus === 'PENDING' && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setVerifyModal({ open: true, reportId: detailModal.report!.id, action: 'APPROVE' })}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    ✓ Setujui
                  </button>
                  <button
                    onClick={() => setVerifyModal({ open: true, reportId: detailModal.report!.id, action: 'REJECT' })}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                  >
                    ✗ Tolak
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {verifyModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-bold">
                {verifyModal.action === 'APPROVE' ? '✓ Setujui Laporan' : '✗ Tolak Laporan'}
              </h3>
              <textarea
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                placeholder="Catatan verifikasi (opsional)"
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setVerifyModal({ open: false, reportId: '', action: null })}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                  disabled={verifying}
                >
                  Batal
                </button>
                <button
                  onClick={() => handleVerify(verifyModal.reportId, verifyModal.action!)}
                  className={`flex-1 px-4 py-2 ${verifyModal.action === 'APPROVE' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-lg transition disabled:opacity-50`}
                  disabled={verifying}
                >
                  {verifying ? 'Memproses...' : 'Konfirmasi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
