"use client";

import { useState, useEffect } from "react";
import { RepairRequest } from "./types";
import RepairDetailModal from "./components/RepairDetailModal";
import { formatDate } from "@/lib/utils/date";

export default function RepairPage() {
  const [repairs, setRepairs] = useState<RepairRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRepair, setSelectedRepair] = useState<RepairRequest | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRepairs = async () => {
    try {
      const response = await fetch("/api/repairs", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setRepairs(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load repair data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  const handleRepairClick = (repair: RepairRequest) => {
    setSelectedRepair(repair);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        data-testid="loading"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        data-testid="error"
      >
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  const filteredRepairs = repairs.filter((repair) => {
    const matchesStatus =
      statusFilter === "all" || repair.status === statusFilter;
    const matchesSearch =
      repair.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 text-black">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-black">
            Daftar Permintaan Perbaikan
          </h1>
          <p className="mt-1 text-sm sm:text-base text-black">
            Kelola dan tangani permintaan perbaikan yang masuk
          </p>
        </div>

        {/* Filters */}
        <div className="mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            data-testid="status-filter"
            className="block w-full sm:w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-black"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="in_progress">Sedang Dikerjakan</option>
            <option value="completed">Selesai</option>
            <option value="need_parts">Butuh Sparepart</option>
          </select>
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Cari subjek, deskripsi, lokasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="search-input"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 pl-8 text-black"
            />
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Cards for mobile */}
        <div className="grid grid-cols-1 gap-4 sm:hidden">
          {filteredRepairs.length === 0 && (
            <div className="text-center py-4 text-black">
              Tidak ada permintaan perbaikan yang sesuai dengan filter
            </div>
          )}
          {filteredRepairs.map((repair) => (
            <div key={repair.id} className="bg-white shadow rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-black">{repair.subject}</div>
                  <div className="text-sm text-gray-600">{repair.location}</div>
                </div>
                <button
                  onClick={() => handleRepairClick(repair)}
                  className="text-blue-600 hover:text-blue-900 font-semibold"
                >
                  Detail
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    repair.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : repair.status === "in_progress"
                      ? "bg-blue-100 text-blue-800"
                      : repair.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : repair.status === "need_parts"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {repair.status.replace("_", " ").toUpperCase()}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    repair.priority === "urgent"
                      ? "bg-red-100 text-red-800"
                      : repair.priority === "high"
                      ? "bg-orange-100 text-orange-800"
                      : repair.priority === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {repair.priority.toUpperCase()}
                </span>
                <span className="px-2 py-1 rounded-full text-xs text-gray-700 bg-gray-100">
                  {formatDate(repair.submitDate)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Table for desktop */}
        <div className="hidden sm:block overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-2 text-left font-medium text-black uppercase tracking-wider">
                  Subjek/Lokasi
                </th>
                <th className="px-4 sm:px-6 py-2 text-left font-medium text-black uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-2 text-left font-medium text-black uppercase tracking-wider">
                  Prioritas
                </th>
                <th className="px-4 sm:px-6 py-2 text-left font-medium text-black uppercase tracking-wider">
                  Tanggal Submit
                </th>
                <th className="px-4 sm:px-6 py-2 text-left font-medium text-black uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRepairs.map((repair) => (
                <tr key={repair.id} className="hover:bg-gray-50">
                  <td className="px-4 sm:px-6 py-2 whitespace-nowrap">
                    <div className="font-medium text-black">
                      {repair.subject}
                    </div>
                    <div className="text-sm text-gray-600">
                      {repair.location}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-2 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs sm:text-sm font-medium ${
                        repair.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : repair.status === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : repair.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : repair.status === "need_parts"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {repair.status.replace("_", " ").toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-2 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs sm:text-sm font-medium ${
                        repair.priority === "urgent"
                          ? "bg-red-100 text-red-800"
                          : repair.priority === "high"
                          ? "bg-orange-100 text-orange-800"
                          : repair.priority === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {repair.priority.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-2 whitespace-nowrap">
                    {formatDate(repair.submitDate)}
                  </td>
                  <td className="px-4 sm:px-6 py-2 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleRepairClick(repair)}
                      className="text-blue-600 hover:text-blue-900 font-semibold"
                      data-testid="detail-btn"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRepairs.length === 0 && (
            <div className="text-center py-4 text-black">
              Tidak ada permintaan perbaikan yang sesuai dengan filter
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && selectedRepair && (
          <RepairDetailModal
            repair={selectedRepair}
            onClose={() => {
              setShowModal(false);
              setSelectedRepair(null);
            }}
            onStatusUpdate={async (status, note) => {
              await fetch(`/api/repairs/${selectedRepair.id}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status, note }),
              });
              fetchRepairs();
            }}
            onAddNote={async (note) => {
              await fetch(`/api/repairs/${selectedRepair.id}/notes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ note }),
              });
              fetchRepairs();
            }}
          />
        )}
      </div>
    </div>
  );
}
