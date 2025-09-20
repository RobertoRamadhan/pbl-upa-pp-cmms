'use client';

import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function TeknisiDashboard() {
  const [activeTab, setActiveTab] = useState('tugas');
  const [stats, setStats] = useState({
    menunggu: 5,
    dikerjakan: 3,
    selesai: 12,
  });

  // Data untuk doughnut chart (Performa Teknisi)
  const performaData = {
    labels: ['Tepat Waktu', 'Terlambat'],
    datasets: [
      {
        data: [85, 15],
        backgroundColor: [
          'rgb(34, 197, 94)',  // Hijau
          'rgb(239, 68, 68)',  // Merah
        ],
        borderWidth: 0,
      },
    ],
  };

  // Data untuk line chart (Waktu Penyelesaian)
  const timelineData = {
    labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum'],
    datasets: [
      {
        fill: true,
        label: 'Waktu (Jam)',
        data: [4, 3, 5, 2, 4],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      x: {
        ticks: {
          font: {
            size: 12,
          },
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            size: 12,
          },
        },
      },
    },
    cutout: '70%',
  };

  // Dummy data tugas
  const tasks = [
    {
      id: 1,
      ruangan: 'Lab Komputer 1',
      masalah: 'Printer tidak berfungsi',
      status: 'menunggu',
      prioritas: 'tinggi',
      tanggal: '2025-09-18',
    },
    {
      id: 2,
      ruangan: 'Ruang Dosen',
      masalah: 'AC tidak dingin',
      status: 'dikerjakan',
      prioritas: 'sedang',
      tanggal: '2025-09-18',
    },
    {
      id: 3,
      ruangan: 'Lab Jaringan',
      masalah: 'Router perlu konfigurasi ulang',
      status: 'selesai',
      prioritas: 'rendah',
      tanggal: '2025-09-17',
    },
  ];

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
          /* Task List */
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-black">{task.ruangan}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      task.status === 'menunggu'
                        ? 'bg-orange-100 text-orange-600'
                        : task.status === 'dikerjakan'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-green-100 text-green-600'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
                <p className="text-sm text-black mb-2">{task.masalah}</p>
                <div className="flex justify-between items-center text-xs text-black">
                  <span>{task.tanggal}</span>
                  <span
                    className={`font-medium ${
                      task.prioritas === 'tinggi'
                        ? 'text-red-500'
                        : task.prioritas === 'sedang'
                        ? 'text-yellow-500'
                        : 'text-green-500'
                    }`}
                  >
                    Prioritas {task.prioritas}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Performance Charts */
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-medium text-black mb-4">
                Performa Penyelesaian
              </h3>
              <div className="w-48 h-48 mx-auto">
                <Doughnut data={performaData} options={doughnutOptions} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-medium text-black mb-4">
                Waktu Penyelesaian Minggu Ini
              </h3>
              <Line data={timelineData} options={chartOptions} />
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button for Quick Actions */}
      <button className="fixed bottom-6 right-6 bg-blue-600 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </button>
    </div>
  );
}