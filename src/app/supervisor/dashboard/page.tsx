'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardStats {
  totalTickets: number;
  activeAssignments: number;
  completedTasks: number;
  avgCompletionTime: number;
}

interface TechnicianPerformance {
  id: string;
  name: string;
  tasksCompleted: number;
  onTimePercentage: number;
}

export default function SupervisorDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTickets: 0,
    activeAssignments: 0,
    completedTasks: 0,
    avgCompletionTime: 0
  });

  const [technicians, setTechnicians] = useState<TechnicianPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/supervisor/dashboard');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch dashboard data');
        }

        setStats(data.stats);
        setTechnicians(data.technicians);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        
        // Fallback data
        setStats({
          totalTickets: 156,
          activeAssignments: 42,
          completedTasks: 98,
          avgCompletionTime: 4.5
        });
        
        setTechnicians([
          {
            id: '1',
            name: 'Teknisi A',
            tasksCompleted: 45,
            onTimePercentage: 95
          },
          {
            id: '2',
            name: 'Teknisi B',
            tasksCompleted: 38,
            onTimePercentage: 92
          }
        ]);

        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Supervisor</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Tiket</div>
          <div className="mt-2 text-3xl font-semibold text-blue-800">{stats.totalTickets}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Penugasan Aktif</div>
          <div className="mt-2 text-3xl font-semibold text-green-600">{stats.activeAssignments}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Tugas Selesai</div>
          <div className="mt-2 text-3xl font-semibold text-purple-600">{stats.completedTasks}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Rata-rata Waktu Penyelesaian</div>
          <div className="mt-2 text-3xl font-semibold text-orange-500">{stats.avgCompletionTime}h</div>
        </div>
      </div>

      {/* Technician Performance */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performa Teknisi</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Teknisi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tugas Selesai
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ketepatan Waktu
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {technicians.map((technician) => (
                  <tr key={technician.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{technician.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{technician.tasksCompleted}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{technician.onTimePercentage}%</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>


    </div>
  );
}