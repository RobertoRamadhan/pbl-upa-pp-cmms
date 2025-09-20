"use client"

import { useState } from 'react';

interface Assignment {
  id: string;
  reportId: string;
  reportTitle: string;
  technician: string;
  assignedAt: string;
  status: 'assigned' | 'inProgress' | 'waitingApproval' | 'completed';
}

export default function AssignmentPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([
    // Dummy data
    {
      id: 'A1',
      reportId: '1',
      reportTitle: 'Kerusakan AC Ruang 101',
      technician: 'Teknisi A',
      assignedAt: '2024-01-15T10:00:00',
      status: 'assigned',
    },
  ]);

  const getStatusColor = (status: Assignment['status']) => {
    switch (status) {
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'inProgress':
        return 'bg-purple-100 text-purple-800';
      case 'waitingApproval':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return '';
    }
  };

  return (
    <div className="p-6 text-black">
      <h1 className="text-2xl font-semibold mb-6">Daftar Penugasan</h1>
      
      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">ID Tugas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">ID Laporan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Judul Laporan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Teknisi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Tanggal Assign</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assignments.map((assignment) => (
              <tr key={assignment.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{assignment.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{assignment.reportId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{assignment.reportTitle}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{assignment.technician}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(assignment.status)}`}>
                    {assignment.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                  {new Date(assignment.assignedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    className="text-blue-600 hover:text-blue-900 mr-4"
                    onClick={() => {/* View details */}}
                  >
                    Detail
                  </button>
                  {assignment.status === 'waitingApproval' && (
                    <button
                      className="text-green-600 hover:text-green-900"
                      onClick={() => {/* Approve completion */}}
                    >
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}