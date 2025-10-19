"use client";

import { useState, useEffect } from "react";

interface Assignment {
  id: string;
  reportId: string;
  reportTitle: string;
  technician: string;
  assignedAt: string;
  status: "assigned" | "inProgress" | "waitingApproval" | "completed";
}

export default function AssignmentPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch("/api/assignments");
        const data = await response.json();

        const assignments = Array.isArray(data) ? data : [];

        const formattedAssignments = assignments.map((assignment: any) => ({
          id: assignment.id,
          reportId: assignment.ticket.id,
          reportTitle: assignment.ticket.title,
          technician: assignment.technician.name,
          assignedAt: assignment.createdAt,
          status: assignment.status.toLowerCase(),
        }));

        setAssignments(formattedAssignments);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const getStatusColor = (status: Assignment["status"]) => {
    switch (status) {
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "inProgress":
        return "bg-purple-100 text-purple-800";
      case "waitingApproval":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "";
    }
  };

  return (
    <div className="p-4 sm:p-6 text-black">
      <h1 className="text-2xl font-semibold mb-6">Daftar Penugasan</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Wrapper untuk scroll horizontal di layar kecil */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 sm:px-6 py-3 text-left font-medium text-black uppercase tracking-wider">
                  ID Tugas
                </th>
                <th className="px-4 sm:px-6 py-3 text-left font-medium text-black uppercase tracking-wider">
                  ID Laporan
                </th>
                <th className="px-4 sm:px-6 py-3 text-left font-medium text-black uppercase tracking-wider">
                  Judul Laporan
                </th>
                <th className="px-4 sm:px-6 py-3 text-left font-medium text-black uppercase tracking-wider">
                  Teknisi
                </th>
                <th className="px-4 sm:px-6 py-3 text-left font-medium text-black uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-3 text-left font-medium text-black uppercase tracking-wider">
                  Tanggal Assign
                </th>
                <th className="px-4 sm:px-6 py-3 text-left font-medium text-black uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-6 text-gray-500 italic"
                  >
                    Memuat data...
                  </td>
                </tr>
              ) : assignments.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-6 text-gray-500 italic"
                  >
                    Tidak ada penugasan ditemukan
                  </td>
                </tr>
              ) : (
                assignments.map((assignment) => (
                  <tr
                    key={assignment.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                      {assignment.id}
                    </td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                      {assignment.reportId}
                    </td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                      {assignment.reportTitle}
                    </td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                      {assignment.technician}
                    </td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusColor(
                          assignment.status
                        )}`}
                      >
                        {assignment.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                      {new Date(assignment.assignedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                      <div className="flex space-x-3">
                        <button className="text-blue-600 hover:text-blue-900 transition-colors">
                          Detail
                        </button>
                        {assignment.status === "waitingApproval" && (
                          <button className="text-green-600 hover:text-green-900 transition-colors">
                            Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
