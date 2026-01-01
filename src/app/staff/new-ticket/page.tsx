'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TicketForm {
  category: string;
  subject: string;
  description: string;
  location: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

export default function NewTicket() {
  const router = useRouter();
  const [formData, setFormData] = useState<TicketForm>({
    category: '',
    subject: '',
    description: '',
    location: '',
    priority: 'MEDIUM'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/ticket-categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to hardcoded categories if API fails
        setCategories([
          { id: '1', name: 'Komputer/Laptop' },
          { id: '2', name: 'Printer' },
          { id: '3', name: 'Jaringan' },
          { id: '4', name: 'AC' },
          { id: '5', name: 'Listrik' },
          { id: '6', name: 'Furniture' },
          { id: '7', name: 'Lainnya' }
        ]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

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
          category: formData.category,
          subject: formData.subject,
          description: formData.description,
          location: formData.location,
          priority: formData.priority,
          status: 'PENDING'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create ticket');
      }

      const data = await response.json();
      alert('Tiket berhasil dibuat dengan nomor: ' + data.ticketNumber);
      router.push('/staff/tickets');
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Gagal membuat tiket. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-black">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Buat Tiket Baru</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loadingCategories}
              >
                <option value="">
                  {loadingCategories ? 'Loading...' : 'Pilih Kategori'}
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Lokasi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Contoh: Ruang 101"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Judul <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                placeholder="Contoh: Printer tidak bisa print"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                placeholder="Jelaskan masalah yang Anda alami..."
                className="w-full p-2 border rounded-md h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Prioritas <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                {['LOW', 'MEDIUM', 'HIGH'].map((p) => (
                  <label key={p} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      value={p}
                      checked={formData.priority === p}
                      onChange={(e) => setFormData({...formData, priority: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH'})}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{p === 'LOW' ? 'Rendah' : p === 'MEDIUM' ? 'Sedang' : 'Tinggi'}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 rounded-lg text-gray-700 bg-gray-300 hover:bg-gray-400 font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-lg text-white font-medium ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? 'Membuat...' : 'Buat Tiket'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}