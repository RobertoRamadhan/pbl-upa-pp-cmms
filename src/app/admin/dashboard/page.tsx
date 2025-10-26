'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardStats {
  currentStats: {
    pending: number;
    inProgress: number;
    completed: number;
    totalAssignments: number;
    totalTickets: number;
  };
  recentAssignments: {
    id: string;
    ticketSubject: string;
    technicianName: string;
    technicianExpertise: string;
    technicianArea: string;
    status: string;
    priority: string;
    category: string;
    location: string;
    assignedAt: string;
    department: string;
  }[];
  monthlyStats: {
    month: string;
    pending: number;
    inProgress: number;
    completed: number;
    totalTickets: number;
  }[];
  ticketCategories: {
    category: string;
    _count: {
      category: number;
    };
  }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const checkSessionAndFetchStats = async () => {
      console.log('Starting to fetch dashboard data...');
      try {
        const sessionStr = localStorage.getItem('user_session');
        if (!sessionStr) {
          console.log('No session found, redirecting to login...');
          setLoading(false); // Make sure to stop loading if no session
          router.replace('/login');
          return;
        }

        let session;
        try {
          session = JSON.parse(sessionStr);
          console.log('Session found:', { 
            hasId: !!session.id,
            role: session.role,
            isAdmin: session.role?.toLowerCase() === 'admin'
          });
        } catch (e) {
          console.error('Failed to parse session:', e);
          setLoading(false);
          localStorage.removeItem('user_session');
          router.replace('/login');
          return;
        }

        if (!session.id || !session.role || session.role.toLowerCase() !== 'admin') {
          console.log('Invalid session or not admin, redirecting to login...');
          setLoading(false);
          localStorage.removeItem('user_session');
          router.replace('/login');
          return;
        }

        console.log('Valid admin session found, fetching stats...');
        await fetchDashboardStats(session.id, session.role);
      } catch (err) {
        console.error('Session check error:', err);
        setLoading(false);
        localStorage.removeItem('user_session');
        router.replace('/login');
      }
    };

    // Initial fetch
    checkSessionAndFetchStats();

    // Set up interval for real-time updates
    intervalId = setInterval(checkSessionAndFetchStats, 30000); // Refresh every 30 seconds

    // Cleanup interval on component unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [router]);

  const fetchDashboardStats = async (userId: string, userRole: string) => {
    console.log('Fetching dashboard stats...');
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/admin/dashboard-stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
          'x-user-role': userRole
        },
        credentials: 'include'
      });

      console.log('API Response received:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('Error response data:', errorData);

        if (response.status === 401 || response.status === 403) {
          console.log('Authentication failed, redirecting to login...');
          localStorage.removeItem('user_session');
          router.replace('/login');
          return;
        }
        throw new Error(errorData.error || 'Failed to fetch dashboard stats');
      }
      
      const data = await response.json();
      console.log('Dashboard data received:', {
        currentStats: data.currentStats,
        recentAssignmentsCount: data.recentAssignments?.length,
        monthlyStatsCount: data.monthlyStats?.length,
        recentAssignments: data.recentAssignments,
        monthlyStats: data.monthlyStats
      });

      setStats(data);
      setError('');
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard statistics');
      setStats(null);
    } finally {
      console.log('Fetch completed, setting loading to false');
      setLoading(false);
    }
  };

  // Debug info for development
  console.log('Render state:', { loading, error, hasStats: !!stats });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-4 bg-red-100 text-red-700 rounded-lg max-w-md w-full">
          <div className="font-bold mb-2">Error Loading Dashboard</div>
          <div>{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Data akan otomatis menggunakan nilai default 0 melalui operator || di template

  const chartData = {
    labels: stats?.monthlyStats?.map(stat => stat.month) || [],
    datasets: [
      {
        label: 'Pending',
        data: stats?.monthlyStats?.map(stat => stat.pending) || [],
        backgroundColor: 'rgba(251, 191, 36, 0.5)',
        borderColor: 'rgb(251, 191, 36)',
        borderWidth: 1
      },
      {
        label: 'In Progress',
        data: stats?.monthlyStats?.map(stat => stat.inProgress) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      },
      {
        label: 'Completed',
        data: stats?.monthlyStats?.map(stat => stat.completed) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Statistik Tiket Bulanan'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-yellow-100 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-800 text-sm font-medium">Pending</p>
              <h3 className="text-2xl font-bold text-yellow-900">{stats?.currentStats?.pending || 0}</h3>
              <p className="text-yellow-600 text-xs mt-1">dari {stats?.currentStats?.totalTickets || 0} tiket</p>
            </div>
            <div className="p-3 bg-yellow-200 rounded-full">
              <svg className="w-6 h-6 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-blue-100 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-800 text-sm font-medium">On Progress</p>
              <h3 className="text-2xl font-bold text-blue-900">{stats?.currentStats?.inProgress || 0}</h3>
              <p className="text-blue-600 text-xs mt-1">dari {stats?.currentStats?.totalTickets || 0} tiket</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-full">
              <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-green-100 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-800 text-sm font-medium">Selesai</p>
              <h3 className="text-2xl font-bold text-green-900">{stats?.currentStats?.completed || 0}</h3>
              <p className="text-green-600 text-xs mt-1">dari {stats?.currentStats?.totalTickets || 0} tiket</p>
            </div>
            <div className="p-3 bg-green-200 rounded-full">
              <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-purple-100 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-800 text-sm font-medium">Total Penugasan</p>
              <h3 className="text-2xl font-bold text-purple-900">{stats?.currentStats?.totalAssignments || 0}</h3>
              <p className="text-purple-600 text-xs mt-1">Teknisi Ditugaskan</p>
            </div>
            <div className="p-3 bg-purple-200 rounded-full">
              <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* Recent Assignments Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Penugasan Terbaru</h3>
        </div>
        <div className="hidden md:block overflow-x-auto">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiket</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teknisi & Department</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status & Prioritas</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lokasi & Kategori</th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {stats?.recentAssignments?.map((assignment) => (
        <tr key={assignment.id} className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm font-medium text-gray-900">{assignment.ticketSubject}</div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm">
              <div className="font-medium text-gray-900">{assignment.technicianName}</div>
              <div className="text-gray-500">{assignment.department}</div>
              <div className="text-gray-500 text-xs">{assignment.technicianExpertise}</div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex flex-col gap-1">
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                ${assignment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  assignment.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'}`}>
                {assignment.status}
              </span>
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                ${assignment.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                  assignment.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'}`}>
                {assignment.priority}
              </span>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm">
              <div className="text-gray-900">{assignment.location}</div>
              <div className="text-gray-500 text-xs">{assignment.category}</div>
              <div className="text-gray-500 text-xs">
                {new Date(assignment.assignedAt).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

{/* Tampilan kartu untuk layar kecil */}
<div className="block md:hidden space-y-4">
  {stats?.recentAssignments?.map((assignment) => (
    <div key={assignment.id} className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
      <div className="font-semibold text-gray-900 mb-1">{assignment.ticketSubject}</div>
      <div className="text-sm text-gray-600 mb-2">
        {assignment.technicianName} — {assignment.department}
      </div>
      <div className="flex flex-wrap gap-2 mb-2">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full 
          ${assignment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
            assignment.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
            'bg-green-100 text-green-800'}`}>
          {assignment.status}
        </span>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full 
          ${assignment.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
            assignment.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-800' :
            'bg-gray-100 text-gray-800'}`}>
          {assignment.priority}
        </span>
      </div>
      <div className="text-xs text-gray-500">
        {assignment.location} — {assignment.category}<br />
        {new Date(assignment.assignedAt).toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </div>
    </div>
  ))}
</div>
      </div>
    </div>
  );
}
