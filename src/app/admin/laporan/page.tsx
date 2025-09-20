"use client"

import { useState } from 'react';

interface Report {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'assigned' | 'inProgress' | 'completed';
  submittedBy: string;
  submittedAt: string;
}

export default function ReportPage() {
  const [reports, setReports] = useState<Report[]>([
    // Dummy data
    {
      id: '1',
      title: 'Kerusakan AC Ruang 101',
      description: 'AC tidak dingin dan mengeluarkan bunyi keras',
      status: 'pending',
      submittedBy: 'John Doe',
      submittedAt: '2024-01-15T08:00:00',
    },
  ]);

  return (
    <div className="p-6 text-black">
      <h1 className="text-2xl font-semibold mb-6">Daftar Laporan</h1>
      
      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Judul</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Pelapor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.map((report) => (
              <tr key={report.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{report.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{report.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${report.status === 'assigned' ? 'bg-blue-100 text-blue-800' : ''}
                    ${report.status === 'inProgress' ? 'bg-purple-100 text-purple-800' : ''}
                    ${report.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                  `}>
                    {report.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{report.submittedBy}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                  {new Date(report.submittedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    className="text-blue-600 hover:text-blue-900 mr-4"
                    onClick={() => {/* View details */}}
                  >
                    Detail
                  </button>
                  <button
                    className="text-green-600 hover:text-green-900"
                    onClick={() => {/* Assign to technician */}}
                  >
                    Assign
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}