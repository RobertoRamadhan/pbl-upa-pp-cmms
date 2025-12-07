'use client';

import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils/date';
import TicketDetailModal from '../components/TicketDetailModal';

interface Ticket {
  id: string;
  ticketNumber: string;
  category: string;
  subject: string;
  description: string;
  location: string;
  status: string;
  priority: string;
  severity: string;
  contactPerson?: string;
  contactPhone?: string;
  assetCode?: string;
  estimatedTime?: number;
  actualTime?: number;
  notes?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  assignedTo?: string;
  user?: {
    name: string;
    department: string;
  };
  assignment?: {
    technician?: {
      name: string;
    };
  };
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('/api/tickets', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch tickets');
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Invalid response format');
        }
        setTickets(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tickets');
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ASSIGNED':
        return 'bg-purple-100 text-purple-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return 'text-red-600';
      case 'MEDIUM':
        return 'text-yellow-600';
      case 'LOW':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-200 text-red-800';
      case 'HIGH':
        return 'bg-orange-200 text-orange-800';
      case 'NORMAL':
        return 'bg-yellow-200 text-yellow-800';
      case 'LOW':
        return 'bg-green-200 text-green-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const handleViewDetail = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const filteredTickets = filterStatus === 'ALL' 
    ? tickets 
    : tickets.filter(ticket => ticket.status?.toUpperCase() === filterStatus);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Tiket Saya</h1>
          <a href="/staff/new-ticket" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            + Buat Tiket Baru
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Filter */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filterStatus === 'ALL'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Semua ({tickets.length})
              </button>
              {['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((status) => {
                const count = tickets.filter(t => t.status?.toUpperCase() === status).length;
                return (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      filterStatus === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {status.replace('_', ' ')} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ticket List */}
          {filteredTickets.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>Tidak ada tiket dengan status {filterStatus !== 'ALL' ? filterStatus : 'apapun'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">No. Tiket</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Kategori</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Subjek</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Lokasi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Prioritas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Keparahan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Teknisi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Update</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{ticket.ticketNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{ticket.category}</td>
                      <td className="px-6 py-4 text-sm max-w-xs truncate">{ticket.subject}</td>
                      <td className="px-6 py-4 text-sm">{ticket.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`font-bold ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full font-semibold ${getSeverityBadge(ticket.severity)}`}>
                          {ticket.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {ticket.assignment?.technician?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatDate(ticket.updatedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewDetail(ticket)}
                          className="text-blue-600 hover:text-blue-900 hover:underline"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}