'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TicketForm {
  category: string;
  location: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  severity: 'low' | 'normal' | 'high' | 'critical';
  contactPerson: string;
  contactPhone: string;
  assetCode: string;
  estimatedTime: string;
  notes: string;
}

export default function NewTicket() {
  const router = useRouter();
  const [formData, setFormData] = useState<TicketForm>({
    category: '',
    location: '',
    subject: '',
    description: '',
    priority: 'medium',
    severity: 'normal',
    contactPerson: '',
    contactPhone: '',
    assetCode: '',
    estimatedTime: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Komputer/Laptop',
    'Printer',
    'Jaringan',
    'AC',
    'Listrik',
    'Furniture',
    'Lainnya'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status: 'PENDING',
          priority: formData.priority.toUpperCase(),
          severity: formData.severity.toUpperCase(),
          estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create ticket');
      }

      const data = await response.json();
      
      alert('Tiket berhasil dibuat dengan nomor: ' + data.ticketNumber);
      router.push('/staff/tickets');
      
      // Reset form
      setFormData({
        category: '',
        location: '',
        subject: '',
        description: '',
        priority: 'medium',
        severity: 'normal',
        contactPerson: '',
        contactPhone: '',
        assetCode: '',
        estimatedTime: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Gagal membuat tiket. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Buat Tiket Baru</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: Category and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Kategori Masalah <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Prioritas <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value as 'low' | 'medium' | 'high'})}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="low">Rendah</option>
                  <option value="medium">Sedang</option>
                  <option value="high">Tinggi</option>
                </select>
              </div>
            </div>

            {/* Row 2: Severity and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tingkat Keparahan <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({...formData, severity: e.target.value as 'low' | 'normal' | 'high' | 'critical'})}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="low">Rendah</option>
                  <option value="normal">Normal</option>
                  <option value="high">Tinggi</option>
                  <option value="critical">Kritis</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Lokasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Contoh: Ruang 101, Lab Komputer A"
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
            </div>

            {/* Row 3: Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nama Orang yang Menghubungi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                  placeholder="Nama lengkap"
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Nomor Telepon <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                  placeholder="Contoh: 0812345678"
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
            </div>

            {/* Row 4: Asset Code and Estimated Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Kode Aset (Opsional)
                </label>
                <input
                  type="text"
                  value={formData.assetCode}
                  onChange={(e) => setFormData({...formData, assetCode: e.target.value})}
                  placeholder="Contoh: AST-001"
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Estimasi Waktu (Menit) (Opsional)
                </label>
                <input
                  type="number"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({...formData, estimatedTime: e.target.value})}
                  placeholder="Contoh: 60"
                  min="0"
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Subjek <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                placeholder="Ringkasan singkat masalah"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Deskripsi Masalah <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Jelaskan detail masalah yang Anda temui..."
                className="w-full p-2 border rounded-md h-32"
                required
              />
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Catatan Tambahan (Opsional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Informasi tambahan yang mungkin membantu teknisi..."
                className="w-full p-2 border rounded-md h-24"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 rounded-lg text-gray-700 bg-gray-300 hover:bg-gray-400"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-lg text-white ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? 'Membuat Tiket...' : 'Buat Tiket'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}