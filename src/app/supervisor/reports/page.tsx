'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';

export default function SupervisorReports() {
  const [stats, setStats] = useState({
    total: 156,
    generatedToday: 8,
    pending: 4,
    scheduled: 12,
  });

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    reportType: 'All Reports',
  });

  const reportCategories = [
    {
      title: 'Laporan Maintenance',
      color: 'bg-blue-600',
      reports: [
        { name: 'Preventive Maintenance', desc: 'Laporan jadwal dan pelaksanaan PM' },
        { name: 'Corrective Maintenance', desc: 'Laporan perbaikan dan breakdown' },
        { name: 'Work Order Completion', desc: 'Status penyelesaian work order' },
      ],
    },
    {
      title: 'Laporan Equipment',
      color: 'bg-green-600',
      reports: [
        { name: 'Equipment Performance', desc: 'Performa dan efisiensi equipment' },
        { name: 'Downtime Analysis', desc: 'Analisis waktu down pada equipment' },
        { name: 'Equipment Utilization', desc: 'Tingkat penggunaan equipment' },
      ],
    },
    {
      title: 'Laporan Teknisi',
      color: 'bg-yellow-400',
      reports: [
        { name: 'Technician Productivity', desc: 'Produktivitas teknisi' },
        { name: 'Workload Distribution', desc: 'Distribusi beban kerja' },
        { name: 'Attendance Report', desc: 'Laporan kehadiran teknisi' },
      ],
    },
    {
      title: 'Laporan Biaya',
      color: 'bg-amber-400',
      reports: [
        { name: 'Maintenance Cost', desc: 'Biaya maintenance keseluruhan' },
        { name: 'Spare Parts Usage', desc: 'Penggunaan spare parts' },
        { name: 'Budget vs Actual', desc: 'Perbandingan budget dan aktual' },
      ],
    },
    {
      title: 'Laporan Compliance',
      color: 'bg-blue-900',
      reports: [
        { name: 'Safety Compliance', desc: 'Kepatuhan prosedur keselamatan' },
        { name: 'Inspection Records', desc: 'Catatan hasil inspeksi' },
        { name: 'Equipment Certification', desc: 'Sertifikasi peralatan' },
      ],
    },
    {
      title: 'Laporan Summary',
      color: 'bg-lime-500',
      reports: [
        { name: 'Monthly Summary', desc: 'Ringkasan bulanan' },
        { name: 'Quarterly Report', desc: 'Laporan triwulanan' },
        { name: 'Annual Report', desc: 'Laporan tahunan' },
      ],
    },
  ];

  const handleDownload = (reportName: string) => {
    alert(`Mengunduh laporan: ${reportName}`);
  };

  return (
    <div className="p-8 space-y-8">
      {/* ===== Statistik Ringkas ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <div className="text-gray-600 text-sm">Total Reports</div>
          <div className="text-3xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <div className="text-gray-600 text-sm">Generated Today</div>
          <div className="text-3xl font-bold">{stats.generatedToday}</div>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <div className="text-gray-600 text-sm">Pending Review</div>
          <div className="text-3xl font-bold">{stats.pending}</div>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <div className="text-gray-600 text-sm">Scheduled</div>
          <div className="text-3xl font-bold">{stats.scheduled}</div>
        </div>
      </div>

      {/* ===== Filter Bar ===== */}
      <div className="flex flex-wrap items-center gap-4">
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2"
        />
        <select
          value={filters.reportType}
          onChange={(e) => setFilters({ ...filters, reportType: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2"
        >
          <option>All Reports</option>
          {reportCategories.map((cat) => (
            <option key={cat.title}>{cat.title}</option>
          ))}
        </select>
      </div>

      {/* ===== Kategori Laporan (2 kolom × 3 baris) ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportCategories.map((category) => (
          <div
            key={category.title}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100"
          >
            {/* Header kategori */}
            <div className={`p-3 text-white font-semibold ${category.color}`}>
              {category.title}
            </div>

            {/* Isi laporan */}
            <div className="divide-y">
              {category.reports.map((report) => (
                <div
                  key={report.name}
                  className="flex justify-between items-center p-4 hover:bg-gray-50 transition"
                >
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      {report.name}
                    </div>
                    <div className="text-xs text-gray-500">{report.desc}</div>
                  </div>
                  <button
                    onClick={() => handleDownload(report.name)}
                    className="p-2 text-gray-600 hover:text-blue-600"
                    title="Unduh laporan"
                  >
                    <Download size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
