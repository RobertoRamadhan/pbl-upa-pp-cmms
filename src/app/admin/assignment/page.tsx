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
      <div className="bg-yellow-50 p-4 mb-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Tiket Belum Ditugaskan</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-yellow-100">
                <th className="px-4 py-2 text-left">ID Tiket</th>
                <th className="px-4 py-2 text-left">Subjek</th>
                <th className="px-4 py-2 text-left">Prioritas</th>
                <th className="px-4 py-2 text-left">Tanggal Dibuat</th>
                <th className="px-4 py-2 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {unassignedTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-yellow-100">
                  <td className="px-4 py-2">{ticket.id}</td>
                  <td className="px-4 py-2">{ticket.reportTitle}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      ticket.priority === 'HIGH' 
                        ? 'bg-red-100 text-red-800'
                        : ticket.priority === 'MEDIUM'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    <button 
                      onClick={() => handleAssignClick(ticket.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      data-testid={`assign-ticket-${ticket.id}`}
                    >
                      Tugaskan
                    </button>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      onClick={() => handleAssignClick(ticket.id)}
                      data-testid={`assign-ticket-${ticket.id}`}
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
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-lg font-semibold p-4">Daftar Penugasan Aktif</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2">ID Tugas</th>
                <th className="px-4 py-2">Teknisi</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Tanggal Assign</th>
                <th className="px-4 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500 italic"
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
              assignments.map((assignment: Assignment) => (
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
                    {assignment.assignedAt ? new Date(assignment.assignedAt).toLocaleDateString() : '-'}
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

    <AssignmentDialog
      isOpen={isAssignDialogOpen}
      onClose={() => setIsAssignDialogOpen(false)}
      ticketId={selectedTicketId}
      onAssign={handleAssign}
    />
    </>
  );
}