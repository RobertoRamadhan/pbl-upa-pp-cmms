"use client";

import { useState, useEffect } from "react";

interface TechnicianProfile {
  expertise: string;
  area: string;
  shift: string;
}

interface Technician {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  technicianProfile: TechnicianProfile | null;
}

export default function TechnicianManagement() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newTechnician, setNewTechnician] = useState({
    name: "",
    email: "",
    password: "",
    expertise: "",
    area: "",
    shift: "",
  });
  const [editTechnician, setEditTechnician] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchTechnicians = async () => {
    try {
      const response = await fetch("/api/admin/technicians");
      const data = await response.json();
      if (response.ok) setTechnicians(data);
      else setError("Gagal mengambil data teknisi");
    } catch {
      setError("Terjadi kesalahan saat memuat data teknisi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/technicians", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTechnician),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess("Teknisi berhasil ditambahkan!");
        setNewTechnician({
          name: "",
          email: "",
          password: "",
          expertise: "",
          area: "",
          shift: "",
        });
        setIsAddDialogOpen(false);
        fetchTechnicians();
      } else {
        setError(data.message || "Gagal menambahkan teknisi");
      }
    } catch {
      setError("Terjadi kesalahan saat menambahkan teknisi");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus teknisi ini?")) return;
    try {
      const response = await fetch(`/api/admin/technicians/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setSuccess("Teknisi berhasil dihapus!");
        fetchTechnicians();
      } else setError("Gagal menghapus teknisi");
    } catch {
      setError("Terjadi kesalahan saat menghapus teknisi");
    }
  };

  const handleEdit = (technician: Technician) => {
    setEditTechnician({
      ...technician,
      expertise: technician.technicianProfile?.expertise || "",
      area: technician.technicianProfile?.area || "",
      shift: technician.technicianProfile?.shift || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/admin/technicians/${editTechnician.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editTechnician),
      });
      if (response.ok) {
        setSuccess("Data teknisi berhasil diperbarui!");
        setIsEditDialogOpen(false);
        fetchTechnicians();
      } else setError("Gagal memperbarui teknisi");
    } catch {
      setError("Terjadi kesalahan saat memperbarui teknisi");
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-semibold text-gray-900">Manajemen Teknisi</h1>
        <button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Tambah Teknisi
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* 💻 Tampilan tabel untuk desktop */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keahlian</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shift</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Dibuat</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">Loading...</td>
              </tr>
            ) : technicians.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  Belum ada teknisi terdaftar
                </td>
              </tr>
            ) : (
              technicians.map((technician) => (
                <tr key={technician.id}>
                  <td className="px-6 py-4">{technician.name}</td>
                  <td className="px-6 py-4">{technician.email}</td>
                  <td className="px-6 py-4">{technician.technicianProfile?.expertise || "-"}</td>
                  <td className="px-6 py-4">{technician.technicianProfile?.area || "-"}</td>
                  <td className="px-6 py-4">{technician.technicianProfile?.shift || "-"}</td>
                  <td className="px-6 py-4">{new Date(technician.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 flex gap-3">
                    <button onClick={() => handleEdit(technician)} className="text-blue-600 hover:text-blue-800">Edit</button>
                    <button onClick={() => handleDelete(technician.id)} className="text-red-600 hover:text-red-800">Hapus</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 📱 Tampilan kartu untuk mobile */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : technicians.length === 0 ? (
          <p className="text-center text-gray-500">Belum ada teknisi terdaftar</p>
        ) : (
          technicians.map((technician) => (
            <div key={technician.id} className="bg-white p-4 rounded-lg shadow border border-gray-100">
              <p className="font-semibold text-gray-800">{technician.name}</p>
              <p className="text-sm text-gray-600">{technician.email}</p>
              <div className="mt-2 text-sm text-gray-700 space-y-1">
                <p><span className="font-medium">Keahlian:</span> {technician.technicianProfile?.expertise || "-"}</p>
                <p><span className="font-medium">Area:</span> {technician.technicianProfile?.area || "-"}</p>
                <p><span className="font-medium">Shift:</span> {technician.technicianProfile?.shift || "-"}</p>
                <p><span className="font-medium">Dibuat:</span> {new Date(technician.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex justify-end gap-3 mt-3">
                <button onClick={() => handleEdit(technician)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                <button onClick={() => handleDelete(technician.id)} className="text-red-600 hover:text-red-800 text-sm">Hapus</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dialog Tambah */}
      {isAddDialogOpen && (
        <Dialog
          title="Tambah Teknisi Baru"
          onClose={() => setIsAddDialogOpen(false)}
          onSubmit={handleSubmit}
          formData={newTechnician}
          setFormData={setNewTechnician}
        />
      )}

      {/* Dialog Edit */}
      {isEditDialogOpen && (
        <Dialog
          title="Edit Data Teknisi"
          onClose={() => setIsEditDialogOpen(false)}
          onSubmit={handleUpdate}
          formData={editTechnician}
          setFormData={setEditTechnician}
          isEdit
        />
      )}
    </div>
  );
}

function Dialog({ title, onClose, onSubmit, formData, setFormData, isEdit = false }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn px-3">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg p-5 sm:p-6 relative overflow-y-auto max-h-[90vh]">
        {/* Tombol close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
        >
          ✕
        </button>

        {/* Judul */}
        <h2 className="text-xl font-semibold mb-5 text-gray-800 text-center">
          {title}
        </h2>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nama"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none rounded-lg p-2.5 text-sm"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none rounded-lg p-2.5 text-sm"
            required
          />

          {!isEdit && (
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none rounded-lg p-2.5 text-sm"
              required
            />
          )}

          <input
            type="text"
            placeholder="Keahlian"
            value={formData.expertise}
            onChange={(e) =>
              setFormData({ ...formData, expertise: e.target.value })
            }
            className="w-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none rounded-lg p-2.5 text-sm"
          />

          <input
            type="text"
            placeholder="Area"
            value={formData.area}
            onChange={(e) =>
              setFormData({ ...formData, area: e.target.value })
            }
            className="w-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none rounded-lg p-2.5 text-sm"
          />

          <select
            value={formData.shift}
            onChange={(e) =>
              setFormData({ ...formData, shift: e.target.value })
            }
            className="w-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none rounded-lg p-2.5 text-sm"
          >
            <option value="">Pilih Shift</option>
            <option value="Pagi">Pagi</option>
            <option value="Siang">Siang</option>
            <option value="Malam">Malam</option>
          </select>

          {/* Tombol aksi */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition text-sm"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
