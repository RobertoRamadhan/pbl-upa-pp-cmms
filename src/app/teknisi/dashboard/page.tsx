"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import RepairDetailModal from "../repair/components/RepairDetailModal";
import { RepairRequest } from "../repair/types";

ChartJS.register(ArcElement, Tooltip, Legend);

interface AssignmentData {
  status: string;
}

interface PerformanceData {
  onTime: number;
  late: number;
}

interface UserSession {
  id: string;
  role?: string;
}

export default function TeknisiDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("tugas");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    menunggu: 0,
    dikerjakan: 0,
    selesai: 0,
  });

  const [performaData, setPerformaData] = useState({
    labels: ["Tepat Waktu", "Terlambat"],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ["rgb(34, 197, 94)", "rgb(239, 68, 68)"],
        borderWidth: 0,
      },
    ],
  });

  const fetchStats = async (technicianId: string) => {
    try {
      const response = await fetch(
        `/api/assignments?technicianId=${technicianId}`,
        { cache: "no-store" }
      );
      if (!response.ok) {
        console.warn(`fetchStats failed with status ${response.status}`);
        setStats({ menunggu: 0, dikerjakan: 0, selesai: 0 });
        return;
      }

      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Data is not an array");

      setStats({
        menunggu: data.filter((a: AssignmentData) => a.status === "PENDING")
          .length,
        dikerjakan: data.filter(
          (a: AssignmentData) => a.status === "IN_PROGRESS"
        ).length,
        selesai: data.filter((a: AssignmentData) => a.status === "COMPLETED")
          .length,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
      setStats({ menunggu: 0, dikerjakan: 0, selesai: 0 });
    }
  };

  const fetchPerformance = async (technicianId: string) => {
    try {
      const response = await fetch(
        `/api/assignments/performance?technicianId=${technicianId}`,
        { cache: "no-store" }
      );
      if (!response.ok) {
        console.warn(`fetchPerformance failed with status ${response.status}`);
        return;
      }

      const data: PerformanceData = await response.json();
      if (
        !data ||
        typeof data.onTime !== "number" ||
        typeof data.late !== "number"
      ) {
        console.warn("Invalid performance data, using defaults");
        return;
      }

      setPerformaData((prev) => ({
        ...prev,
        datasets: [{ ...prev.datasets[0], data: [data.onTime, data.late] }],
      }));
    } catch (err) {
      console.error("Error fetching performance data:", err);
    }
  };

  // ===== Assignments (Daftar Tugas) =====
  interface Assignment {
    id: string;
    subject?: string;
    priority?: string;
    status?: string;
    submitDate?: string | null;
    assignedDate?: string | null;
    startDate?: string | null;
    completionDate?: string | null;
    location?: string;
    description?: string;
  }

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [startingTaskId, setStartingTaskId] = useState<string | null>(null);

  // Modal state for opening repair detail from dashboard
  const [showModal, setShowModal] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState<RepairRequest | null>(
    null
  );

  const fetchAssignments = async (technicianId: string) => {
    try {
      const res = await fetch(`/api/repairs?technicianId=${technicianId}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        console.warn("Failed to fetch assignments for teknisi", res.status);
        setAssignments([]);
        return;
      }
      const data = await res.json();
      setAssignments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setAssignments([]);
    }
  };

  const getNextAction = (status?: string) => {
    if (!status) return { label: "", nextStatus: null, enabled: false };
    const s = status.toLowerCase();

    if (["pending", "assigned", "accepted"].includes(s)) {
      return { label: "Mulai", nextStatus: "in_progress", enabled: true };
    }

    if (s === "in_progress") {
      return { label: "Selesai", nextStatus: "completed", enabled: true };
    }

    return { label: s.replace(/_/g, " "), nextStatus: null, enabled: false };
  };

  // Open the repair completion modal for finalization
  async function openCompletionModal(assignmentId: string) {
    // Try to find the full repair object in current assignments
    const found = assignments.find((r) => r.id === assignmentId) as unknown as
      | RepairRequest
      | undefined;
    if (found) {
      setSelectedRepair(found);
      setShowModal(true);
      return;
    }

    // Fallback: re-fetch repairs and look for the id
    try {
      const userSessionStr = localStorage.getItem("user_session");
      const userSession = userSessionStr
        ? (JSON.parse(userSessionStr) as UserSession)
        : null;
      const res = await fetch(
        userSession?.id
          ? `/api/repairs?technicianId=${userSession.id}`
          : `/api/repairs`,
        { cache: "no-store" }
      );
      if (!res.ok) return alert("Gagal membuka modal, coba lagi");
      const data = await res.json();
      const fresh = Array.isArray(data)
        ? data.find((d: any) => d.id === assignmentId)
        : undefined;
      if (fresh) {
        setSelectedRepair(fresh as RepairRequest);
        setShowModal(true);
        return;
      }
      alert("Data tugas tidak ditemukan");
    } catch (err) {
      console.error("Error fetching repair for modal", err);
      alert("Gagal membuka modal, coba lagi");
    }
  }

  const updateTaskStatus = async (
    assignmentId: string,
    nextStatus: string | null,
    note?: string
  ) => {
    if (!nextStatus) return;

    // If attempting to complete a task directly, open the completion modal instead
    if (nextStatus === "completed") {
      openCompletionModal(assignmentId);
      return;
    }

    try {
      setStartingTaskId(assignmentId);
      const res = await fetch(`/api/repairs/${assignmentId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          note: note || "Diperbarui oleh teknisi",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(async () => {
          const text = await res.text().catch(() => "");
          return { error: text || "Unknown error" };
        });
        console.error("Failed to update task status", res.status, err);
        alert(err?.error || "Gagal memperbarui status tugas");
        setStartingTaskId(null);
        return;
      }

      // refresh stats and assignments
      const userSessionStr = localStorage.getItem("user_session");
      const userSession = userSessionStr
        ? (JSON.parse(userSessionStr) as UserSession)
        : null;
      if (userSession?.id) {
        await Promise.all([
          fetchStats(userSession.id),
          fetchAssignments(userSession.id),
          fetchPerformance(userSession.id),
        ]);
      }

      setStartingTaskId(null);
    } catch (err) {
      console.error("Error updating task status:", err);
      alert("Terjadi kesalahan saat memperbarui status tugas");
      setStartingTaskId(null);
    }
  };

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      if (typeof window === "undefined") return;

      const userSessionStr = localStorage.getItem("user_session");
      if (!userSessionStr) return router.push("/login");

      try {
        const userSession = JSON.parse(userSessionStr) as UserSession;
        if (!userSession?.id || userSession.role !== "teknisi") {
          localStorage.removeItem("user_session");
          return router.replace("/login");
        }

        // Fetch stats, performance and assignments
        await Promise.all([
          fetchStats(userSession.id),
          fetchPerformance(userSession.id),
          fetchAssignments(userSession.id),
        ]);
      } catch (err) {
        console.error("Session error:", err);
        localStorage.removeItem("user_session");
        window.location.replace("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 p-4">
        <div className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-orange-500">
          <p className="text-xs text-black">Menunggu</p>
          <p className="text-xl font-bold text-orange-500">{stats.menunggu}</p>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-blue-500">
          <p className="text-xs text-black">Dikerjakan</p>
          <p className="text-xl font-bold text-blue-500">{stats.dikerjakan}</p>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-green-500">
          <p className="text-xs text-black">Selesai</p>
          <p className="text-xl font-bold text-green-500">{stats.selesai}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-white">
        <button
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === "tugas"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-black"
          }`}
          onClick={() => setActiveTab("tugas")}
        >
          Daftar Tugas
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === "performa"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-black"
          }`}
          onClick={() => setActiveTab("performa")}
        >
          Performa
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === "tugas" ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Berikut adalah daftar tugas yang ditugaskan ke Anda.
            </p>

            {/* Responsive task cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
              {assignments.length === 0 ? (
                <div className="col-span-full bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-gray-600">
                    Belum ada tugas yang ditugaskan.
                  </p>
                </div>
              ) : (
                assignments.map((a) => (
                  <div
                    key={a.id}
                    className="bg-white rounded-lg p-4 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 className="text-md font-semibold text-gray-900">
                          {a.subject || "No subject"}
                        </h4>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded ${
                            a.priority === "HIGH"
                              ? "bg-red-100 text-red-600"
                              : a.priority === "MEDIUM"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {a.priority ? a.priority.toLowerCase() : "low"}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mt-2">
                        {a.description ? a.description.slice(0, 120) : "-"}
                      </p>

                      <div className="mt-3 text-xs text-gray-500 space-y-1">
                        <p>Lokasi: {a.location || "-"}</p>
                        <p>
                          Ditugaskan:{" "}
                          {a.assignedDate
                            ? new Date(a.assignedDate).toLocaleString()
                            : "-"}
                        </p>
                        <p>
                          Status:{" "}
                          <span className="font-semibold text-black">
                            {a.status || "-"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {a.assignedDate
                          ? new Date(a.assignedDate).toLocaleDateString()
                          : ""}
                      </div>
                      {getNextAction(a.status).enabled ? (
                        <button
                          onClick={() =>
                            updateTaskStatus(
                              a.id,
                              getNextAction(a.status).nextStatus
                            )
                          }
                          disabled={startingTaskId === a.id}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          {startingTaskId === a.id
                            ? `${getNextAction(a.status).label}...`
                            : getNextAction(a.status).label}
                        </button>
                      ) : (
                        <button
                          className="inline-flex items-center px-3 py-1.5 bg-gray-200 text-gray-700 rounded"
                          disabled
                        >
                          {a.status ? a.status.replace("_", " ") : "—"}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-medium text-black mb-4">
                Performa Penyelesaian
              </h3>
              <div className="w-48 h-48 mx-auto">
                <Doughnut data={performaData} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
