'use client';

import { useState } from 'react';

interface TicketDetailProps {
  ticket: {
    id: string;
    ticketNumber: string;
    category: string;
    subject: string;
    description: string;
    location: string;
    priority: string;
    severity: string;
    status: string;
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
    user?: {
      name: string;
      department: string;
    };
    assignment?: {
      technician?: {
        name: string;
      };
    };
  };
  isOpen: boolean;
  onClose: () => void;
}

const TicketDetailModal: React.FC<TicketDetailProps> = ({ ticket, isOpen, onClose }) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    } as Intl.DateTimeFormatOptions);
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

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'bg-blue-100 text-blue-800';
      case 'ASSIGNED':
        return 'bg-purple-100 text-purple-800';
      case 'IN_PROGRESS':
        return 'bg-orange-100 text-orange-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return 'text-red-600';
      case 'HIGH':
        return 'text-orange-600';
      case 'NORMAL':
        return 'text-yellow-600';
      case 'LOW':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{ticket.ticketNumber}</h2>
            <p className="text-blue-100 mt-1">{ticket.subject}</p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl font-bold hover:text-gray-200"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-black">
          {/* Status and Priority Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-500 uppercase">Status</p>
              <p className={`inline-block px-2 py-1 rounded text-sm font-semibold ${getStatusColor(ticket.status)}`}>
                {ticket.status}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Prioritas</p>
              <p className={`inline-block px-2 py-1 rounded text-sm font-semibold ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Keparahan</p>
              <p className={`font-semibold ${getSeverityColor(ticket.severity)}`}>
                {ticket.severity}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Kategori</p>
              <p className="font-semibold">{ticket.category}</p>
            </div>
          </div>

          {/* Main Information */}
          <div className="border-t pt-6 space-y-4">
            {/* Location and Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Lokasi</p>
                <p className="font-semibold">{ticket.location}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Kontak</p>
                <p className="font-semibold">{ticket.contactPerson || '-'}</p>
                <p className="text-sm text-gray-600">{ticket.contactPhone || '-'}</p>
              </div>
            </div>

            {/* Asset Code and Estimated Time */}
            {(ticket.assetCode || ticket.estimatedTime) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ticket.assetCode && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Kode Aset</p>
                    <p className="font-semibold">{ticket.assetCode}</p>
                  </div>
                )}
                {ticket.estimatedTime && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Estimasi Waktu</p>
                    <p className="font-semibold">{ticket.estimatedTime} menit</p>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <p className="text-xs text-gray-500 uppercase">Deskripsi Masalah</p>
              <p className="mt-2 text-gray-700 bg-gray-50 p-3 rounded">{ticket.description}</p>
            </div>

            {/* Additional Notes */}
            {ticket.notes && (
              <div>
                <p className="text-xs text-gray-500 uppercase">Catatan Tambahan</p>
                <p className="mt-2 text-gray-700 bg-gray-50 p-3 rounded">{ticket.notes}</p>
              </div>
            )}

            {/* Resolution Notes */}
            {ticket.resolutionNotes && (
              <div>
                <p className="text-xs text-gray-500 uppercase">Hasil Penyelesaian</p>
                <p className="mt-2 text-gray-700 bg-green-50 p-3 rounded">{ticket.resolutionNotes}</p>
              </div>
            )}

            {/* Timeline */}
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 uppercase mb-3">Timeline</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Dibuat:</span>
                  <span className="font-semibold">{formatDate(ticket.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Update Terakhir:</span>
                  <span className="font-semibold">{formatDate(ticket.updatedAt)}</span>
                </div>
                {ticket.completedAt && (
                  <div className="flex justify-between">
                    <span>Selesai:</span>
                    <span className="font-semibold">{formatDate(ticket.completedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Assigned Technician */}
            {ticket.assignment?.technician && (
              <div>
                <p className="text-xs text-gray-500 uppercase">Teknisi Ditugaskan</p>
                <p className="font-semibold">{ticket.assignment.technician.name}</p>
              </div>
            )}

            {/* Actual Time Spent */}
            {ticket.actualTime && (
              <div>
                <p className="text-xs text-gray-500 uppercase">Waktu Aktual Dikerjakan</p>
                <p className="font-semibold">{ticket.actualTime} menit</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-semibold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailModal;
