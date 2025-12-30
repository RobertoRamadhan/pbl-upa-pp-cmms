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

type TabType = 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('ASSIGNED');

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
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800';
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
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
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

  const getFilteredTickets = (tab: TabType) => {
    switch (tab) {
      case 'ASSIGNED':
        return tickets.filter(t => ['PENDING', 'ASSIGNED'].includes(t.status?.toUpperCase() || ''));
      case 'IN_PROGRESS':
        return tickets.filter(t => t.status?.toUpperCase() === 'IN_PROGRESS');
      case 'COMPLETED':
        return tickets.filter(t => ['COMPLETED', 'CANCELLED'].includes(t.status?.toUpperCase() || ''));
      default:
        return tickets;
    }
  };

  const filteredTickets = getFilteredTickets(activeTab);
  const tabs: { label: string; value: TabType; count: number }[] = [
    { label: 'ASSIGNED', value: 'ASSIGNED', count: getFilteredTickets('ASSIGNED').length },
    { label: 'IN_PROGRESS', value: 'IN_PROGRESS', count: getFilteredTickets('IN_PROGRESS').length },
    { label: 'COMPLETED', value: 'COMPLETED', count: getFilteredTickets('COMPLETED').length },
  ];

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
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 text-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tiket Saya</h1>
            <p className="text-gray-600 text-sm mt-1">Total: {tickets.length} tiket</p>
          </div>
          <a 
            href="/staff/new-ticket" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            + Buat Tiket Baru
          </a>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
          <div className="flex border-b">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex-1 px-4 py-4 font-semibold text-center transition ${
                  activeTab === tab.value
                    ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="block">{tab.label}</span>
                <span className="text-sm font-normal">({tab.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredTickets.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>Tidak ada tiket {activeTab.toLowerCase()}</p>
            </div>
          ) : (
            <>
              {/* Desktop View - Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">No. Tiket</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Subjek</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Kategori</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Prioritas</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Keparahan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Teknisi</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Tanggal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{ticket.ticketNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{ticket.subject}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{ticket.category || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(ticket.severity)}`}>
                            {ticket.severity || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {ticket.assignment?.technician?.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {formatDate(ticket.createdAt)}
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

              {/* Mobile View - Cards */}
              <div className="md:hidden space-y-4 p-4">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                        <p className="text-xs text-gray-500 mt-1">ID: {ticket.ticketNumber}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div className="text-gray-600">
                        <span className="font-medium">Kategori:</span> {ticket.category || '-'}
                      </div>
                      <div className="text-gray-600">
                        <span className="font-medium">Prioritas:</span> {ticket.priority || '-'}
                      </div>
                      <div className="text-gray-600">
                        <span className="font-medium">Keparahan:</span> {ticket.severity || '-'}
                      </div>
                      <div className="text-gray-600">
                        <span className="font-medium">Teknisi:</span> {ticket.assignment?.technician?.name || '-'}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 mb-3">
                      <span className="font-medium">Tanggal:</span> {formatDate(ticket.createdAt)}
                    </div>

                    <button
                      onClick={() => handleViewDetail(ticket)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
                    >
                      Lihat Detail
                    </button>
                  </div>
                ))}
              </div>
            </>
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