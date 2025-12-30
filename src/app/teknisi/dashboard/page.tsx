'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { formatDate } from '@/lib/utils/date';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Assignment {
  id: string;
  ticket: {
    id: string;
    ticketNumber: string;
    subject: string;
    description: string;
    category: string;
    priority: string;
    severity: string;
    location: string;
    createdAt: string;
  };
  status: string;
  createdAt: string;
  user_assignment_technicianIdTouser?: {
    name: string;
  };
}

interface AssignmentData {
  status: string;
}

interface PerformanceData {
  onTime: number;
  late: number;
}

interface UserSession {
  id: string;
  role?: string;
}

export default function TeknisiDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('tugas');
  const [isLoading, setIsLoading] = useState(true);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [stats, setStats] = useState({
    menunggu: 0,
    dikerjakan: 0,
    selesai: 0,
  });
  
  const [performaData, setPerformaData] = useState({
    labels: ['Tepat Waktu', 'Terlambat'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['rgb(34, 197, 94)', 'rgb(239, 68, 68)'],
      borderWidth: 0,
    }],
  });

  const fetchStats = async (technicianId: string) => {
    try {
      const response = await fetch(`/api/assignments?technicianId=${technicianId}`, { cache: 'no-store' });
      if (!response.ok) {
        console.warn(`fetchStats failed with status ${response.status}`);
        setStats({ menunggu: 0, dikerjakan: 0, selesai: 0 });
        setAssignments([]);
        return;
      }

      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Data is not an array');

      setAssignments(data);
      setStats({
        menunggu: data.filter((a: AssignmentData) => a.status === 'PENDING').length,
        dikerjakan: data.filter((a: AssignmentData) => a.status === 'IN_PROGRESS').length,
        selesai: data.filter((a: AssignmentData) => a.status === 'COMPLETED').length,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      setStats({ menunggu: 0, dikerjakan: 0, selesai: 0 });
      setAssignments([]);
    }
  };

  const fetchPerformance = async (technicianId: string) => {
    try {
      const response = await fetch(`/api/assignments/performance?technicianId=${technicianId}`, { cache: 'no-store' });
      if (!response.ok) {
        console.warn(`fetchPerformance failed with status ${response.status}`);
        return;
      }

      const data: PerformanceData = await response.json();
      if (!data || typeof data.onTime !== 'number' || typeof data.late !== 'number') {
        console.warn('Invalid performance data, using defaults');
        return;
      }

      setPerformaData(prev => ({
        ...prev,
        datasets: [{ ...prev.datasets[0], data: [data.onTime, data.late] }]
      }));
    } catch (err) {
      console.error('Error fetching performance data:', err);
    }
  };

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      if (typeof window === 'undefined') return;

      const userSessionStr = localStorage.getItem('user_session');
      if (!userSessionStr) return router.push('/login');

      try {
        const userSession = JSON.parse(userSessionStr) as UserSession;
        if (!userSession?.id || userSession.role !== 'teknisi') {
          localStorage.removeItem('user_session');
          return router.replace('/login');
        }

        // Fetch stats and performance
        await Promise.all([fetchStats(userSession.id), fetchPerformance(userSession.id)]);
      } catch (err) {
        console.error('Session error:', err);
        localStorage.removeItem('user_session');
        window.location.replace('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndFetchData();
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 p-4">
        <div className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-orange-500">
          <p className="text-xs text-black">Menunggu</p>
          <p className="text-xl font-bold text-orange-500">{stats.menunggu}</p>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-blue-500">
          <p className="text-xs text-black">Dikerjakan</p>
          <p className="text-xl font-bold text-blue-500">{stats.dikerjakan}</p>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-green-500">
          <p className="text-xs text-black">Selesai</p>
          <p className="text-xl font-bold text-green-500">{stats.selesai}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-white">
        <button
          className={`flex-1 py-3 text-sm font-medium ${activeTab === 'tugas' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-black'}`}
          onClick={() => setActiveTab('tugas')}
        >
          Daftar Tugas
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium ${activeTab === 'performa' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-black'}`}
          onClick={() => setActiveTab('performa')}
        >
          Performa
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'tugas' ? (
          <div className="space-y-4">
            {assignments.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500">Belum ada tugas yang ditugaskan</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden border border-gray-200"
                  >
                    {/* Card Header */}
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 mb-1">ID Tiket</p>
                          <h3 className="font-semibold text-gray-900">{assignment.ticket.ticketNumber}</h3>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}>
                          {assignment.status}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="px-4 py-3 space-y-3">
                      {/* Subject */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Subjek</p>
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">{assignment.ticket.subject}</p>
                      </div>

                      {/* Category & Priority */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-gray-500 mb-1">Kategori</p>
                          <p className="text-gray-700">{assignment.ticket.category || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Prioritas</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(assignment.ticket.priority)}`}>
                            {assignment.ticket.priority || '-'}
                          </span>
                        </div>
                      </div>

                      {/* Location */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Lokasi</p>
                        <p className="text-sm text-gray-700">{assignment.ticket.location || '-'}</p>
                      </div>

                      {/* Severity & Date */}
                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-200">
                        <div>
                          <p className="text-gray-500 mb-1">Keparahan</p>
                          <p className="text-gray-700">{assignment.ticket.severity || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Tanggal</p>
                          <p className="text-gray-700">{formatDate(assignment.ticket.createdAt)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                      <button
                        onClick={() => setSelectedAssignment(assignment)}
                        className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition text-sm"
                      >
                        Lihat Detail
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-medium text-black mb-4">Performa Penyelesaian</h3>
              <div className="w-48 h-48 mx-auto">
                <Doughnut data={performaData} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-black">Detail Tugas</h2>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 text-black space-y-4">
              {/* ID Tiket */}
              <div>
                <p className="text-xs text-gray-500 mb-1">ID Tiket</p>
                <p className="text-lg font-bold">{selectedAssignment.ticket.ticketNumber}</p>
              </div>

              {/* Subjek */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Subjek</p>
                <p className="text-gray-900 font-semibold">{selectedAssignment.ticket.subject}</p>
              </div>

              {/* Deskripsi */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Deskripsi</p>
                <p className="text-gray-700 text-sm">{selectedAssignment.ticket.description}</p>
              </div>

              {/* Grid Info */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Kategori</p>
                  <p className="text-gray-900">{selectedAssignment.ticket.category}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Prioritas</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(selectedAssignment.ticket.priority)}`}>
                    {selectedAssignment.ticket.priority}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Keparahan</p>
                  <p className="text-gray-900">{selectedAssignment.ticket.severity}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedAssignment.status)}`}>
                    {selectedAssignment.status}
                  </span>
                </div>
              </div>

              {/* Lokasi */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Lokasi</p>
                <p className="text-gray-900">{selectedAssignment.ticket.location}</p>
              </div>

              {/* Tanggal */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Tanggal Dibuat</p>
                <p className="text-gray-900">{formatDate(selectedAssignment.ticket.createdAt)}</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 border-t border-gray-200 p-4 flex gap-2">
              <button
                onClick={() => setSelectedAssignment(null)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded font-semibold hover:bg-gray-300 transition"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setSelectedAssignment(null);
                  router.push(`/teknisi/repair?assignmentId=${selectedAssignment.id}`);
                }}
                className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
              >
                Mulai Perbaikan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
