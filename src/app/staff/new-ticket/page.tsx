'use client';

import { useState } from 'react';

interface TicketForm {
  category: string;
  location: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

export default function NewTicket() {
  const [formData, setFormData] = useState<TicketForm>({
    category: '',
    location: '',
    subject: '',
    description: '',
    priority: 'medium'
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
      // TODO: Implement API call to submit ticket
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      alert('Tiket berhasil dibuat!');
      // Reset form
      setFormData({
        category: '',
        location: '',
        subject: '',
        description: '',
        priority: 'medium'
      });
    } catch (error) {
      alert('Gagal membuat tiket. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Buat Tiket Baru</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Kategori */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Kategori Masalah
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

            {/* Lokasi */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Lokasi
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

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Subjek
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
                Deskripsi
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Jelaskan detail masalah yang Anda temui..."
                className="w-full p-2 border rounded-md h-32"
                required
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Prioritas
              </label>
              <div className="flex space-x-4">
                {['low', 'medium', 'high'].map((priority) => (
                  <label key={priority} className="flex items-center">
                    <input
                      type="radio"
                      value={priority}
                      checked={formData.priority === priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value as 'low' | 'medium' | 'high'})}
                      className="mr-2"
                    />
                    <span className="capitalize">{priority}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
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