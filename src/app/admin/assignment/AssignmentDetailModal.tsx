'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { formatDate } from '@/lib/utils/date';

interface AssignmentDetail {
  id: string;
  ticket: {
    id: string;
    ticketNumber: string;
    subject: string;
    description: string;
    priority: string;
    category: string;
    createdAt: string;
    reporterId: string;
  };
  technician: {
    id: string;
    name: string;
    email: string;
  };
  status: string;
  startTime: string | null;
  endTime: string | null;
  notes: string | null;
  completionNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CompletionImages {
  images: string[];
  uploadedAt: string;
}

interface AssignmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: string;
}

export default function AssignmentDetailModal({ isOpen, onClose, assignmentId }: AssignmentDetailModalProps) {
  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completionImages, setCompletionImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verifyingStatus, setVerifyingStatus] = useState<'idle' | 'approving' | 'rejecting'>('idle');
  const [verificationDone, setVerificationDone] = useState(false);

  useEffect(() => {
    if (isOpen && assignmentId) {
      console.log(`[ASSIGNMENT-DETAIL-MODAL] Opening modal for assignment: ${assignmentId}`);
      setLoading(true);
      setError(null);
      setAssignment(null);
      setCompletionImages([]);
      fetchAssignmentDetail();
    }
  }, [isOpen, assignmentId]);

  const fetchAssignmentDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`[ASSIGNMENT-DETAIL] Fetching assignment with ID: ${assignmentId}`);
      
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        cache: 'no-store',
      });

      console.log(`[ASSIGNMENT-DETAIL] Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ASSIGNMENT-DETAIL] Error response: ${errorText}`);
        const errorMsg = `Failed to fetch: ${response.status} ${response.statusText}`;
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      const data = await response.json();
      console.log(`[ASSIGNMENT-DETAIL] Data received:`, data);
      setAssignment(data);

      // Parse completion images from completionNotes
      if (data.completionNotes) {
        try {
          const parsed = JSON.parse(data.completionNotes) as CompletionImages;
          setCompletionImages(parsed.images || []);
          console.log(`[ASSIGNMENT-DETAIL] Images found: ${parsed.images?.length || 0}`);
        } catch (parseError) {
          console.error(`[ASSIGNMENT-DETAIL] Error parsing completionNotes:`, parseError);
          setCompletionImages([]);
        }
      }
    } catch (error) {
      console.error('[ASSIGNMENT-DETAIL] Error fetching assignment detail:', error);
      setError(error instanceof Error ? error.message : 'Failed to load assignment details');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-900">Detail Penugasan</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-800">
              <p className="font-semibold">Error loading assignment details</p>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={() => fetchAssignmentDetail()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Coba Lagi
              </button>
            </div>
          ) : assignment ? (
            <div className="space-y-6">
              {/* Ticket Information */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Tiket</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Nomor Tiket</p>
                    <p className="text-base font-medium text-gray-900">{assignment.ticket.ticketNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Subjek</p>
                    <p className="text-base font-medium text-gray-900">{assignment.ticket.subject}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Prioritas</p>
                    <p className="text-base font-medium text-gray-900">{assignment.ticket.priority}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Kategori</p>
                    <p className="text-base font-medium text-gray-900">{assignment.ticket.category}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Deskripsi</p>
                    <p className="text-base text-gray-900">{assignment.ticket.description}</p>
                  </div>
                </div>
              </section>

              {/* Assignment Information */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Penugasan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Teknisi</p>
                    <p className="text-base font-medium text-gray-900">{assignment.technician.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        assignment.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : assignment.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {assignment.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Waktu Mulai</p>
                    <p className="text-base text-gray-900">
                      {assignment.startTime ? formatDate(assignment.startTime) : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Waktu Selesai</p>
                    <p className="text-base text-gray-900">
                      {assignment.endTime ? formatDate(assignment.endTime) : '-'}
                    </p>
                  </div>
                </div>
              </section>

              {/* Notes */}
              {assignment.notes && (
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Catatan Verifikasi</h3>
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-gray-900">{assignment.notes}</p>
                  </div>
                </section>
              )}

              {/* Completion Images */}
              {completionImages.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Bukti Penyelesaian ({completionImages.length} Gambar)
                  </h3>

                  {/* Image Gallery */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {completionImages.map((image, index) => (
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
                          <span className="text-white text-opacity-0 hover:text-opacity-100 transition-all">
                            Lihat
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {completionImages.length === 0 && assignment.status === 'COMPLETED' && (
                <section>
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <p className="text-yellow-800">
                      ⚠️ Pekerjaan ini ditandai COMPLETED tetapi tidak ada bukti gambar yang diunggah.
                    </p>
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Data penugasan tidak ditemukan
            </div>
          )}
        </div>
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
    </div>
  );
}
