"use client";

import { useState, useEffect } from "react";
import AssignmentDialog from "./AssignmentDialog";

interface Assignment {
  id: string;
  reportId: string;
  reportTitle: string;
  technician?: string;
  assignedAt?: string;
  status: "pending" | "assigned" | "inProgress" | "waitingApproval" | "completed";
}

export default function AssignmentPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [unassignedTickets, setUnassignedTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string>('');

  const fetchData = async () => {
    try {
      // Fetch assignments
      const assignmentsResponse = await fetch("/api/assignments");
      const assignmentsData = await assignmentsResponse.json();
      
      // Fetch unassigned tickets
      const ticketsResponse = await fetch("/api/tickets?status=PENDING");
      const ticketsData = await ticketsResponse.json();

      const formattedAssignments = (assignmentsData || []).map((assignment: any) => ({
        id: assignment.id,
        reportId: assignment.ticket.id,
        reportTitle: assignment.ticket.subject,
        technician: assignment.user_assignment_technicianIdTouser?.name,
        assignedAt: assignment.createdAt,
        status: assignment.status.toLowerCase(),
      }));

      const unassignedTickets = (ticketsData || []).map((ticket: any) => ({
        id: ticket.id,
        reportId: ticket.id,
        reportTitle: ticket.subject,
        status: 'pending',
        priority: ticket.priority,
        createdAt: ticket.createdAt
      }));

      setAssignments(formattedAssignments);
      setUnassignedTickets(unassignedTickets);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignClick = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setIsAssignDialogOpen(true);
  };

  const handleAssign = async (technicianId: string) => {
    try {
      // Get the current user's ID (who is doing the assignment)
      const user = JSON.parse(localStorage.getItem('user_session') || '{}');
      if (!user.id) throw new Error('No user found');

      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ticketId: selectedTicketId,
          technicianId,
          assignedById: user.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create assignment');
      }

      // Wait for UI to settle
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchData();
    } catch (error) {
      console.error('Error assigning ticket:', error);
      throw error;
    }
  };

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
    <>
    <div className="p-4 sm:p-6 text-black">
      <h1 className="text-2xl font-semibold mb-6">Manajemen Penugasan</h1>

      {/* Unassigned Tickets Section */}
      <div className="bg-white p-4 mb-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Tiket Belum Ditugaskan</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="px-3 py-2 text-left font-medium">ID Tiket</th>
                <th className="px-3 py-2 text-left font-medium">Subjek</th>
                <th className="px-3 py-2 text-left font-medium">Prioritas</th>
                <th className="px-3 py-2 text-left font-medium">Tanggal Dibuat</th>
                <th className="px-3 py-2 text-left font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {unassignedTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2 border-t">{ticket.id}</td>
                  <td className="px-3 py-2 border-t">{ticket.reportTitle}</td>
                  <td className="px-3 py-2 border-t">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        ticket.priority === "HIGH"
                          ? "bg-red-100 text-red-700"
                          : ticket.priority === "MEDIUM"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-3 py-2 border-t">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2 border-t">
                    <button
                      onClick={() => handleAssignClick(ticket.id)}
                      className="bg-blue-600 text-white px-2.5 py-1 rounded text-xs hover:bg-blue-700 transition"
                    >
                      Tugaskan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assigned Tickets Section */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Daftar Penugasan Aktif</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="px-3 py-2">ID Tugas</th>
                <th className="px-3 py-2">ID Tiket</th>
                <th className="px-3 py-2">Subjek</th>
                <th className="px-3 py-2">Teknisi</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Tanggal Assign</th>
                <th className="px-3 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500 italic">
                    Memuat data...
                  </td>
                </tr>
              ) : assignments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500 italic">
                    Tidak ada penugasan ditemukan
                  </td>
                </tr>
              ) : (
                assignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2">{assignment.id}</td>
                    <td className="px-3 py-2">{assignment.reportId}</td>
                    <td className="px-3 py-2">{assignment.reportTitle}</td>
                    <td className="px-3 py-2">{assignment.technician}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-0.5 inline-flex text-xs font-medium rounded-full ${getStatusColor(
                          assignment.status
                        )}`}
                      >
                        {assignment.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {assignment.assignedAt
                        ? new Date(assignment.assignedAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 text-xs">
                          Detail
                        </button>
                        {assignment.status === "waitingApproval" && (
                          <button className="text-green-600 hover:text-green-800 text-xs">
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

    <AssignmentDialog
      isOpen={isAssignDialogOpen}
      onClose={() => setIsAssignDialogOpen(false)}
      ticketId={selectedTicketId}
      onAssign={handleAssign}
    />
    </>
  );
}