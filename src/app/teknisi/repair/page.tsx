'use client';

import { useState, useEffect } from 'react';
import { RepairRequest, RepairNote } from './types';

type RepairStatus = RepairRequest['status'];

const mockRepairData: RepairRequest[] = [
  {
    id: '1',
    userId: 'user-1',
    userName: 'John Doe',
    userRole: 'dosen',
    department: 'Informatika',
    location: 'Lab Komputer 1',
    category: 'Komputer',
    subject: 'PC tidak mau menyala',
    description: 'PC di meja nomor 5 tidak mau menyala sama sekali. Sudah dicoba untuk restart tapi tetap tidak bisa.',
    priority: 'high',
    status: 'pending',
    submitDate: new Date('2024-03-16T08:30:00'),
    assignedTo: 'teknisi-1',
    assignedDate: new Date('2024-03-16T09:00:00'),
  },
  {
    id: '2',
    userId: 'user-2',
    userName: 'Jane Smith',
    userRole: 'staff',
    department: 'Administrasi',
    location: 'Ruang Admin',
    category: 'AC',
    subject: 'AC berisik dan kurang dingin',
    description: 'AC di ruang administrasi tidak dingin dan mengeluarkan bunyi berisik.',
    priority: 'medium',
    status: 'in_progress',
    submitDate: new Date('2024-03-15T09:15:00'),
    assignedTo: 'teknisi-1',
    assignedDate: new Date('2024-03-15T10:00:00'),
    startDate: new Date('2024-03-15T10:30:00'),
  },
  {
    id: '3',
    userId: 'user-3',
    userName: 'David Lee',
    userRole: 'dosen',
    department: 'Teknik Elektro',
    location: 'Lab Elektronika',
    category: 'Listrik',
    subject: 'Stop kontak tidak berfungsi',
    description: 'Stop kontak di bagian belakang lab tidak berfungsi. Sudah dicek MCB tidak turun.',
    priority: 'high',
    status: 'completed',
    submitDate: new Date('2024-03-14T11:00:00'),
    assignedTo: 'teknisi-1',
    assignedDate: new Date('2024-03-14T11:30:00'),
    startDate: new Date('2024-03-14T13:00:00'),
    notes: ['Pekerjaan selesai, stop kontak sudah berfungsi normal'],
  }
];

import RepairDetailModal from './components/RepairDetailModal';

export default function RepairManagement() {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [repairs, setRepairs] = useState<RepairRequest[]>([]);
  const [selectedRepair, setSelectedRepair] = useState<RepairRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load initial data
    const loadRepairs = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        setRepairs(mockRepairData);
      } catch (error) {
        console.error('Error loading repairs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRepairs();
  }, []);

  const filteredRepairs = repairs.filter((repair) => {
    const matchesSearch = 
      repair.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repair.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repair.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = selectedPriority ? repair.priority === selectedPriority : true;
    const matchesCategory = selectedCategory ? repair.category === selectedCategory : true;
    const matchesTab = activeTab === 'all' ? true : repair.status === activeTab;

    return matchesSearch && matchesPriority && matchesCategory && matchesTab;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-black';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-black';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-black">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Manajemen Perbaikan</h1>
          <p>Kelola permintaan perbaikan dari pengguna</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b px-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'all'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-black hover:text-black'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'pending'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-black hover:text-gray-900'
              }`}
            >
              Menunggu
            </button>
            <button
              onClick={() => setActiveTab('in_progress')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'in_progress'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-black hover:text-gray-900'
              }`}
            >
              Sedang Dikerjakan
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'completed'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-black hover:text-gray-900'
              }`}
            >
              Selesai
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <input
                type="text"
                placeholder="Cari berdasarkan subjek, nama, atau lokasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Prioritas</option>
                <option value="urgent">Urgent</option>
                <option value="high">Tinggi</option>
                <option value="medium">Sedang</option>
                <option value="low">Rendah</option>
              </select>
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Kategori</option>
                <option value="Computer">Komputer</option>
                <option value="Electrical">Listrik</option>
                <option value="AC">AC</option>
                <option value="Furniture">Furnitur</option>
                <option value="Network">Jaringan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Repair Requests List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Subjek
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Pelapor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Lokasi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Prioritas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRepairs.map((repair) => (
                  <tr key={repair.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-black">
                        {repair.subject}
                      </div>
                      <div className="text-sm text-black">
                        {repair.category}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-black">{repair.userName}</div>
                      <div className="text-sm text-black">{repair.userRole}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-black">{repair.location}</div>
                      <div className="text-sm text-black">{repair.department}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(repair.priority)}`}>
                        {repair.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(repair.status)}`}>
                        {repair.status === 'pending' ? 'Menunggu' :
                         repair.status === 'in_progress' ? 'Dikerjakan' :
                         repair.status === 'completed' ? 'Selesai' :
                         'Ditolak'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-black">
                      {repair.submitDate.toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <button
                        onClick={() => setSelectedRepair(repair)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRepair && (
        <RepairDetailModal
          repair={selectedRepair}
          onClose={() => setSelectedRepair(null)}
          onStatusUpdate={async (status: RepairStatus, noteText: string) => {
            // TODO: Implement actual API call
            console.log('Updating status:', { status, noteText });
            const updatedRepairs = repairs.map(r => {
              if (r.id === selectedRepair.id) {
                return {
                  ...r,
                  status,
                  notes: [...(r.notes || []), noteText]
                };
              }
              return r;
            });
            setRepairs(updatedRepairs);
            setSelectedRepair(null);
          }}
          onAddNote={async (noteText: string) => {
            // TODO: Implement actual API call
            console.log('Adding note:', noteText);
            const updatedRepairs = repairs.map(r => {
              if (r.id === selectedRepair.id) {
                return {
                  ...r,
                  notes: [...(r.notes || []), noteText]
                };
              }
              return r;
            });
            setRepairs(updatedRepairs);
          }}
        />
      )}
    </div>
  );
}