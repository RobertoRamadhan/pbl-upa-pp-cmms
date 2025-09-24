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

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

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
  const [stats, setStats] = useState({
    menunggu: 0,
    dikerjakan: 0,
    selesai: 0,
  });
  
  const [performaData, setPerformaData] = useState({
    labels: ['Tepat Waktu', 'Terlambat'],
    datasets: [{
      data: [0, 0],
      backgroundColor: [
        'rgb(34, 197, 94)',  // Hijau
        'rgb(239, 68, 68)',  // Merah
      ],
      borderWidth: 0,
    }],
  });

  const fetchStats = async (technicianId: string) => {
    try {
      const response = await fetch(`/api/assignments?technicianId=${technicianId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Data is not an array');
      }

      setStats({
        menunggu: data.filter((a: AssignmentData) => a.status === 'PENDING').length,
        dikerjakan: data.filter((a: AssignmentData) => a.status === 'IN_PROGRESS').length,
        selesai: data.filter((a: AssignmentData) => a.status === 'COMPLETED').length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        menunggu: 0,
        dikerjakan: 0,
        selesai: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPerformance = async (technicianId: string) => {
    try {
      const response = await fetch(`/api/assignments/performance?technicianId=${technicianId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PerformanceData = await response.json();
      
      setPerformaData(prev => ({
        ...prev,
        datasets: [{
          ...prev.datasets[0],
          data: [data.onTime, data.late]
        }]
      }));
    } catch (error) {
      console.error('Error fetching performance data:', error);
    }
  };

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      console.log('Starting auth check...');
      
      // Don't run on server side
      if (typeof window === 'undefined') {
        console.log('Server side rendering, skipping auth check');
        return;
      }

      // Get session from localStorage
      const userSessionStr = localStorage.getItem('user_session');
      console.log('Session string:', userSessionStr ? 'Found' : 'Not found');
      
      if (!userSessionStr) {
        console.log('No session found, redirecting to login');
        router.push('/login');
        return;
      }

      try {
        // Parse and validate session
        const userSession = JSON.parse(userSessionStr) as UserSession;
        console.log('Session parsed:', {
          hasId: !!userSession?.id,
          role: userSession?.role || 'none'
        });

        if (!userSession?.id || userSession.role !== 'teknisi') {
          console.log('Invalid session (wrong role or no ID), clearing and redirecting');
          localStorage.removeItem('user_session');
          router.replace('/login');
          return;
        }

        console.log('Valid technician session, fetching data...');
        // Fetch data only if we have valid session
        await Promise.all([
          fetchStats(userSession.id),
          fetchPerformance(userSession.id)
        ]);
        
        console.log('Data fetch completed');
      } catch (error) {
        console.error('Session error:', error);
        localStorage.removeItem('user_session');
        window.location.replace('/login');
      }
    };

    // Run immediately
    checkAuthAndFetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Quick Stats - Mobile Friendly Cards */}
      <div className="grid grid-cols-3 gap-2 p-4">
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <p className="text-xs text-black">Menunggu</p>
          <p className="text-xl font-bold text-orange-500">{stats.menunggu}</p>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <p className="text-xs text-black">Dikerjakan</p>
          <p className="text-xl font-bold text-blue-500">{stats.dikerjakan}</p>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <p className="text-xs text-black">Selesai</p>
          <p className="text-xl font-bold text-green-500">{stats.selesai}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b bg-white">
        <button
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'tugas'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-black'
          }`}
          onClick={() => setActiveTab('tugas')}
        >
          Daftar Tugas
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'performa'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-black'
          }`}
          onClick={() => setActiveTab('performa')}
        >
          Performa
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4">
        {activeTab === 'tugas' ? (
          <div className="space-y-4">
            {/* Tugas content will be added here */}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-medium text-black mb-4">
                Performa Penyelesaian
              </h3>
              <div className="w-48 h-48 mx-auto">
                <Doughnut data={performaData} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
