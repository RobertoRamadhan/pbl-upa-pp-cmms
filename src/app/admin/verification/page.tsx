'use client';

import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils/date';
import Image from 'next/image';

interface CompletionEvidence {
  id: string;
  ticketNumber: string;
  technicianName: string;
  subject: string;
  images: string[];
  completionNotes: string;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  verifiedAt?: string;
  completedAt: string;
}

export default function VerificationPage() {
  const [evidences, setEvidences] = useState<CompletionEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('PENDING');
  const [selectedEvidence, setSelectedEvidence] = useState<CompletionEvidence | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    fetchEvidences();
  }, [filterStatus]);

  const fetchEvidences = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/completion-evidence?status=${filterStatus}`, {
        cache: 'no-store',
      });
      
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      setEvidences(data);
    } catch (error) {
      console.error('Error fetching evidences:', error);
      setEvidences([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (assignmentId: string, action: 'APPROVED' | 'REJECTED') => {
    if (action === 'REJECTED' && !rejectionReason.trim()) {
      alert('Silakan masukkan alasan penolakan');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch('/api/repairs/verify-completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId,
          action,
          verifierId: localStorage.getItem('user_id'),
          reason: rejectionReason,
        }),
      });

      if (response.ok) {
        alert(`Verifikasi ${action === 'APPROVED' ? 'disetujui' : 'ditolak'} berhasil`);
        setSelectedEvidence(null);
        setRejectionReason('');
        await fetchEvidences();
      } else {
        alert('Gagal memverifikasi');
      }
    } catch (error) {
      console.error('Error verifying:', error);
      alert('Gagal memverifikasi');
    } finally {
      setIsVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Verifikasi Penyelesaian Pekerjaan</h1>
          <p className="text-gray-600 mt-2">Review bukti pekerjaan dari teknisi sebelum mengesahkan penyelesaian</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
          <div className="flex border-b">
            {['PENDING', 'APPROVED', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`flex-1 px-4 py-4 font-semibold text-center transition ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {status === 'PENDING' && 'Menunggu Verifikasi'}
                {status === 'APPROVED' && 'Disetujui'}
                {status === 'REJECTED' && 'Ditolak'}
                ({evidences.length})
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {evidences.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-lg">Tidak ada bukti yang perlu diverifikasi</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {evidences.map((evidence) => (
              <div
                key={evidence.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition border border-gray-200"
              >
                {/* Card Header */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{evidence.ticketNumber}</h3>
                      <p className="text-sm text-gray-600">{evidence.subject}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      evidence.verificationStatus === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : evidence.verificationStatus === 'APPROVED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {evidence.verificationStatus}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="px-6 py-4 space-y-4">
                  {/* Technician & Date */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Teknisi</p>
                      <p className="text-gray-900 font-medium">{evidence.technicianName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Tanggal Selesai</p>
                      <p className="text-gray-900">{formatDate(evidence.completedAt)}</p>
                    </div>
                  </div>

                  {/* Images */}
                  {evidence.images.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Bukti Pekerjaan ({evidence.images.length} gambar)</p>
                      <div className="grid grid-cols-3 gap-2">
                        {evidence.images.map((image, index) => (
                          <div key={index} className="relative aspect-square">
                            <Image
                              src={image}
                              alt={`Evidence ${index + 1}`}
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {evidence.completionNotes && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Catatan Penyelesaian</p>
                      <p className="text-gray-700 text-sm">{evidence.completionNotes}</p>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                {evidence.verificationStatus === 'PENDING' && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 space-y-2">
                    <button
                      onClick={() => setSelectedEvidence(evidence)}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      Review Lengkap
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedEvidence && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-96 overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-black">Review Bukti Pekerjaan</h2>
              <button
                onClick={() => setSelectedEvidence(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 text-black space-y-4">
              {/* Header Info */}
              <div>
                <p className="text-sm text-gray-500 mb-1">Tiket</p>
                <h3 className="text-xl font-bold">{selectedEvidence.ticketNumber}</h3>
                <p className="text-gray-700 mt-1">{selectedEvidence.subject}</p>
              </div>

              {/* Images */}
              {selectedEvidence.images.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Bukti Pekerjaan</p>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedEvidence.images.map((image, index) => (
                      <div key={index} className="relative aspect-square">
                        <Image
                          src={image}
                          alt={`Evidence ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Catatan</p>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedEvidence.completionNotes || '-'}
                </p>
              </div>

              {/* Rejection Reason (if needed) */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Alasan Penolakan (jika ditolak)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Jelaskan mengapa pekerjaan perlu diperbaiki..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  rows={3}
                  disabled={isVerifying}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 border-t border-gray-200 p-4 flex gap-2">
              <button
                onClick={() => setSelectedEvidence(null)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded font-semibold hover:bg-gray-300 transition"
              >
                Tutup
              </button>
              <button
                onClick={() => handleVerification(selectedEvidence.id, 'REJECTED')}
                disabled={isVerifying}
                className="flex-1 bg-red-600 text-white py-2 rounded font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                {isVerifying ? 'Memproses...' : 'Tolak'}
              </button>
              <button
                onClick={() => handleVerification(selectedEvidence.id, 'APPROVED')}
                disabled={isVerifying}
                className="flex-1 bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 transition disabled:opacity-50"
              >
                {isVerifying ? 'Memproses...' : 'Setujui'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
