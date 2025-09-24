'use client';

import { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieLabelRenderProps
} from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalLaporan: 0,
    menunggu: 0,
    diproses: 0,
    selesai: 0,
  });

  const [pieData, setPieData] = useState([
    { name: 'Menunggu', value: 0, color: '#ff9f40' },
    { name: 'Diproses', value: 0, color: '#36a2eb' },
    { name: 'Selesai', value: 0, color: '#4bc0c0' }
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/tickets', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        let data;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          throw new Error("Response was not JSON");
        }

        // Pastikan data adalah array dan validasi struktur
        if (!Array.isArray(data)) {
          throw new Error('Data is not an array');
        }

        // Validasi struktur data
        const isValidData = data.every((item) => 
          typeof item === 'object' && 
          item !== null &&
          typeof item.status === 'string'
        );

        if (!isValidData) {
          throw new Error('Invalid data structure received');
        }

        const menunggu = data.filter(t => t.status === 'PENDING').length;
        const diproses = data.filter(t => t.status === 'IN_PROGRESS').length;
        const selesai = data.filter(t => t.status === 'COMPLETED').length;
        
        setStats({
          totalLaporan: data.length,
          menunggu,
          diproses,
          selesai,
        });

        setPieData([
          { name: 'Menunggu', value: menunggu, color: '#ff9f40' },
          { name: 'Diproses', value: diproses, color: '#36a2eb' },
          { name: 'Selesai', value: selesai, color: '#4bc0c0' }
        ]);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  // Data untuk bar chart (Laporan per Bulan)
  const barData = [
    { month: 'Jan', laporan: 65 },
    { month: 'Feb', laporan: 59 },
    { month: 'Mar', laporan: 80 },
    { month: 'Apr', laporan: 81 },
    { month: 'Mei', laporan: 56 },
    { month: 'Jun', laporan: 55 }
  ];

  // Data untuk area chart (Trend Waktu Penyelesaian)
  const areaData = [
    { month: 'Jan', waktu: 5 },
    { month: 'Feb', waktu: 4 },
    { month: 'Mar', waktu: 3 },
    { month: 'Apr', waktu: 4 },
    { month: 'Mei', waktu: 2 },
    { month: 'Jun', waktu: 3 }
  ];

  const COLORS = ['#ff9f40', '#36a2eb', '#4bc0c0'];

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-8">Dashboard Admin</h1>

        {/* Statistik Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-black text-sm font-medium">Total Laporan</h3>
            <p className="text-3xl font-bold text-black">{stats.totalLaporan}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-black text-sm font-medium">Menunggu</h3>
            <p className="text-3xl font-bold text-orange-500">{stats.menunggu}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-black text-sm font-medium">Diproses</h3>
            <p className="text-3xl font-bold text-blue-500">{stats.diproses}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-black text-sm font-medium">Selesai</h3>
            <p className="text-3xl font-bold text-teal-500">{stats.selesai}</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-black mb-4">Status Laporan</h2>
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
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-black mb-4">Laporan per Bulan</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="laporan" fill="#36a2eb" name="Jumlah Laporan" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Area Chart */}
          <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
            <h2 className="text-xl font-semibold text-black mb-4">Trend Waktu Penyelesaian</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={areaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="waktu" 
                  stroke="#4bc0c0" 
                  fill="rgba(75, 192, 192, 0.2)"
                  name="Rata-rata Waktu Penyelesaian (Hari)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}