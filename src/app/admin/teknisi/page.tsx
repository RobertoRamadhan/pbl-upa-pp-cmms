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
      if (response.ok) {
        setTechnicians(data);
      } else {
        setError("Failed to fetch technicians");
      }
    } catch (err) {
      setError("Error fetching technicians");
      console.error(err);
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
    } catch (err) {
      setError("Terjadi kesalahan saat menambahkan teknisi");
      console.error(err);
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
      } else {
        setError("Gagal menghapus teknisi");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat menghapus teknisi");
      console.error(err);
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
      } else {
        setError("Gagal memperbarui teknisi");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat memperbarui teknisi");
      console.error(err);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keahlian</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Dibuat</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  Loading...
                </td>
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
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(technician)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(technician.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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

function Dialog({
  title,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isEdit = false,
}: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nama"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border-gray-300 rounded-md p-2"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full border-gray-300 rounded-md p-2"
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
              className="w-full border-gray-300 rounded-md p-2"
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
            className="w-full border-gray-300 rounded-md p-2"
          />
          <input
            type="text"
            placeholder="Area"
            value={formData.area}
            onChange={(e) =>
              setFormData({ ...formData, area: e.target.value })
            }
            className="w-full border-gray-300 rounded-md p-2"
          />
          <select
            value={formData.shift}
            onChange={(e) =>
              setFormData({ ...formData, shift: e.target.value })
            }
            className="w-full border-gray-300 rounded-md p-2"
          >
            <option value="">Pilih Shift</option>
            <option value="Pagi">Pagi</option>
            <option value="Siang">Siang</option>
            <option value="Malam">Malam</option>
          </select>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
