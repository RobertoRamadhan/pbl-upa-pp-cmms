'use client';

import { useState } from 'react';
import { RepairRequest } from '../types';
import { formatDate } from '@/lib/utils/date';
import Image from 'next/image';

interface RepairDetailModalProps {
  repair: RepairRequest;
  onClose: () => void;
  onStatusUpdate: (status: RepairRequest['status'], note: string) => Promise<void>;
  onAddNote: (note: string) => Promise<void>;
}

export default function RepairDetailModal({
  repair,
  onClose,
  onStatusUpdate,
  onAddNote,
}: RepairDetailModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newStatus, setNewStatus] = useState(repair.status);
  const [statusNote, setStatusNote] = useState('');
  const [newNote, setNewNote] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newStatus === repair.status || !statusNote.trim()) return;

    setIsSubmitting(true);
    try {
      await onStatusUpdate(newStatus, statusNote);
      setStatusNote('');
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddNote(newNote);
      setNewNote('');
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreview((prev) => [...prev, event.target.result as string]);
        }
      };

      reader.readAsDataURL(file);
    }
  };

  const removeImagePreview = (index: number) => {
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadImages = async () => {
    if (imagePreview.length === 0) return;

    setIsSubmitting(true);
    try {
      // Upload gambar ke server
      const formData = new FormData();
      
      // Konversi preview ke blob
      for (let i = 0; i < imagePreview.length; i++) {
        const response = await fetch(imagePreview[i]);
        const blob = await response.blob();
        formData.append('images', blob, `image-${Date.now()}-${i}.png`);
      }

      const uploadResponse = await fetch('/api/repairs/upload-images', {
        method: 'POST',
        body: formData,
      });

      if (uploadResponse.ok) {
        const data = await uploadResponse.json();
        setUploadedImages((prev) => [...prev, ...data.urls]);
        setImagePreview([]);
        alert('Gambar berhasil diunggah');
      } else {
        alert('Gagal mengunggah gambar');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Gagal mengunggah gambar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden" data-testid="repair-form">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Detail Laporan Perbaikan</h2>
          <button
            onClick={onClose}
            className="text-black hover:text-gray-900"
            data-testid="close-repair-modal"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-129px)]">
          {/* Header Information */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium text-black mb-4">Informasi Laporan</h3>
              <div className="space-y-2">
                <p><span className="text-black">Subjek:</span> {repair.subject}</p>
                <p><span className="text-black">Kategori:</span> {repair.category}</p>
                <p><span className="text-black">Prioritas:</span> {repair.priority}</p>
                <p><span className="text-black">Status:</span> {repair.status}</p>
                <p><span className="text-black">Tanggal Laporan:</span> {formatDate(repair.submitDate)}</p>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-black mb-4">Informasi Pelapor</h3>
              <div className="space-y-2">
                <p><span className="text-black">Nama:</span> {repair.userName}</p>
                <p><span className="text-black">Role:</span> {repair.userRole}</p>
                <p><span className="text-black">Departemen:</span> {repair.department}</p>
                <p><span className="text-black">Lokasi:</span> {repair.location}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-medium text-black mb-2">Deskripsi Masalah</h3>
            <p className="text-black whitespace-pre-wrap">{repair.description}</p>
          </div>

          {/* Images - Gambar Laporan */}
          {repair.images && repair.images.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium text-black mb-2">Gambar Laporan</h3>
              <div className="grid grid-cols-4 gap-4">
                {repair.images.map((image, index) => (
                  <div key={index} className="relative aspect-square">
                    <Image
                      src={image}
                      alt={`Image ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Gambar Bukti Pekerjaan */}
          <div className="mb-6">
            <h3 className="font-medium text-black mb-2">Upload Gambar Bukti Pekerjaan</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-black"
                disabled={isSubmitting || repair.status === 'completed'}
              />
              <p className="text-sm text-gray-500 mt-2">
                Pilih satu atau lebih gambar untuk diunggah sebagai bukti pekerjaan
              </p>

              {/* Preview Gambar */}
              {imagePreview.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-black mb-2">Preview ({imagePreview.length} gambar)</p>
                  <div className="grid grid-cols-4 gap-4">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImagePreview(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleUploadImages}
                    disabled={isSubmitting}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {isSubmitting ? 'Mengunggah...' : 'Unggah Gambar'}
                  </button>
                </div>
              )}

              {/* Uploaded Images */}
              {uploadedImages.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-green-600 mb-2">✓ {uploadedImages.length} gambar berhasil diunggah</p>
                  <div className="grid grid-cols-4 gap-4">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative aspect-square">
                        <Image
                          src={image}
                          alt={`Uploaded ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Update Form */}
          <div className="mb-6">
            <h3 className="font-medium text-black mb-2">Update Status</h3>
            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as RepairRequest['status'])}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={isSubmitting || repair.status === 'completed'}
                  data-testid="status-select"
                >
                  <option value="pending">Menunggu</option>
                  <option value="in_progress">Sedang Dikerjakan</option>
                  <option value="completed">Selesai</option>
                  <option value="rejected">Ditolak</option>
                </select>
                {repair.status === 'completed' && (
                  <p className="text-sm text-green-600 mt-2">✓ Status sudah selesai dan tidak dapat diubah</p>
                )}
              </div>
              <div>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Tambahkan catatan untuk perubahan status..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                  rows={3}
                  disabled={isSubmitting || repair.status === 'completed'}
                  data-testid="status-note"
                ></textarea>
              </div>
              <div>
                <button
                  type="submit"
                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                    isSubmitting || repair.status === 'completed' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isSubmitting || newStatus === repair.status || !statusNote.trim() || repair.status === 'completed'}
                  data-testid="submit-repair"
                >
                  Update Status
                </button>
              </div>
            </form>
          </div>

          {/* Add Note Form */}
          <div className="mb-6">
            <h3 className="font-medium text-black mb-2">Tambah Catatan</h3>
            <form onSubmit={handleAddNote} className="space-y-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Tambahkan catatan baru..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                disabled={isSubmitting}
                data-testid="note-input"
              ></textarea>
              <button
                type="submit"
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                disabled={isSubmitting || !newNote.trim()}
                data-testid="add-note"
              >
                Tambah Catatan
              </button>
            </form>
          </div>

          {/* Timeline */}
          {repair.notes && repair.notes.length > 0 && (
            <div>
              <h3 className="font-medium text-black mb-2">Riwayat</h3>
              <div className="space-y-4">
                {repair.notes.map((note, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <p className="text-black whitespace-pre-wrap">{note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}