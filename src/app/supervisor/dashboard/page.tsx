'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

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
  rating?: number;
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
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/supervisor/dashboard');
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        
        if (!data.stats || !data.technicians) {
          throw new Error('Invalid dashboard data format');
        }

        setStats(data.stats);
        setTechnicians(data.technicians);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error instanceof Error ? error.message : 'Unknown error');

        // Data fallback (dummy)
        setStats({
          totalTickets: 156,
          activeAssignments: 42,
          completedTasks: 98,
          avgCompletionTime: 4.5
        });

        setTechnicians([
          { id: '1', name: 'Teknisi A', tasksCompleted: 45, onTimePercentage: 95, rating: 4.5 },
          { id: '2', name: 'Teknisi B', tasksCompleted: 38, onTimePercentage: 92, rating: 4.2 },
          { id: '3', name: 'Teknisi C', tasksCompleted: 25, onTimePercentage: 88, rating: 3.9 },
          { id: '4', name: 'Teknisi D', tasksCompleted: 40, onTimePercentage: 90, rating: 4.3 },
          { id: '5', name: 'Teknisi E', tasksCompleted: 30, onTimePercentage: 87, rating: 3.8 },
        ]);

        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-2rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 min-h-[calc(100vh-2rem)] pb-8">
      {/* ===== Dashboard Stats ===== */}
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Supervisor</h1>

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

      {/* ===== Tabel Performa Teknisi ===== */}
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
                {technicians.map((tech) => (
                  <tr key={tech.id}>
                    <td className="px-6 py-4">{tech.name}</td>
                    <td className="px-6 py-4">{tech.tasksCompleted}</td>
                    <td className="px-6 py-4">{tech.onTimePercentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ===== Grafik Technician Performance ===== */}
      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-center text-xl font-bold mb-2">Technician Performance</h2>
        <p className="text-center text-gray-500 mb-8">
          View performance analytics of technicians.
        </p>

        <div className="space-y-12">
          {/* Completed Tasks Chart */}
          <div>
            <h3 className="text-gray-700 font-semibold mb-2">Completed Tasks</h3>
            <p className="text-sm text-gray-500 mb-4">Tasks Completed</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={technicians}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tasksCompleted" fill="#b4ff4f" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Technician Rating Chart */}
          <div>
            <h3 className="text-gray-700 font-semibold mb-2">Technician Rating</h3>
            <p className="text-sm text-gray-500 mb-4">Average Rating</p>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={technicians}>
                <defs>
                  <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000" stopOpacity={0.7}/>
                    <stop offset="95%" stopColor="#000" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Area type="monotone" dataKey="rating" stroke="#000" fill="url(#ratingGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
