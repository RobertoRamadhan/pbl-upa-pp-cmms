'use client';

import { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalLaporan: 0,
    menunggu: 0,
    diproses: 0,
    selesai: 0,
  });

  const [pieData, setPieData] = useState([
    { name: 'Menunggu', value: 0, color: '#ffcc00' },
    { name: 'Diproses', value: 0, color: '#36a2eb' },
    { name: 'Selesai', value: 0, color: '#4bc0c0' }
  ]);

  useEffect(() => {
    // nanti bisa fetch data dari API /api/tickets
    setStats({
      totalLaporan: 0,
      menunggu: 0,
      diproses: 0,
      selesai: 0,
    });
  }, []);

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Judul */}
        <h1 className="text-2xl font-bold text-green-700 mb-6">Dashboard Admin</h1>

        {/* Statistik Card */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white border-2 border-green-600 rounded-xl shadow p-4 text-center">
            <p className="text-sm font-semibold text-gray-600">Total Laporan</p>
            <p className="text-3xl font-bold text-green-700">{stats.totalLaporan}</p>
          </div>
          <div className="bg-yellow-100 border border-yellow-400 rounded-xl shadow p-4 text-center">
            <p className="text-sm font-semibold text-gray-600">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.menunggu}</p>
          </div>
          <div className="bg-blue-100 border border-blue-400 rounded-xl shadow p-4 text-center">
            <p className="text-sm font-semibold text-gray-600">On Progress</p>
            <p className="text-3xl font-bold text-blue-600">{stats.diproses}</p>
          </div>
          <div className="bg-green-100 border border-green-400 rounded-xl shadow p-4 text-center">
            <p className="text-sm font-semibold text-gray-600">Selesai</p>
            <p className="text-3xl font-bold text-green-600">{stats.selesai}</p>
          </div>
        </div>

        {/* Grafik Statistik */}
        <div className="bg-white border-2 border-green-600 rounded-xl shadow p-6 text-center mb-10">
          <h2 className="text-xl font-semibold mb-4 text-green-700">Grafik Statistik</h2>
          {stats.totalLaporan === 0 ? (
            <p className="text-gray-500 italic">Belum ada laporan</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Assign Teknisi */}
        <div className="bg-white border-2 border-green-600 rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-green-700 mb-4">Assign Teknisi</h2>

          {stats.totalLaporan === 0 ? (
            <div className="text-center text-gray-500 italic">
              Belum ada laporan yang ditugaskan.
            </div>
          ) : (
            <div className="space-y-4">
              {/* contoh isi data laporan nanti */}
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-semibold">#1 Ruang Server</p>
                  <p className="text-gray-500 text-sm">AC Rusak</p>
                </div>
                <span className="bg-blue-200 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  On Progress
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
