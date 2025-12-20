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

interface TechnicianFormData {
  id?: string;
  name: string;
  email: string;
  password: string;
  expertise: string;
  area: string;
  shift: string;
}

export default function TechnicianManagement() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newTechnician, setNewTechnician] = useState<TechnicianFormData>({
    name: "",
    email: "",
    password: "",
    expertise: "",
    area: "",
    shift: "",
  });
  const [editTechnician, setEditTechnician] = useState<TechnicianFormData | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchTechnicians = async () => {
    try {
      const response = await fetch("/api/admin/technicians");
      const data = await response.json();
      if (response.ok) {
        setTechnicians(Array.isArray(data) ? data : []);
        setError("");
      } else {
        setError(data.message || "Gagal mengambil data teknisi");
      }
    } catch (error) {
      console.error("Fetch error:", error);
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
    setError("");
    setSuccess("");
    
    try {
      const response = await fetch(`/api/admin/technicians/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess("Teknisi berhasil dihapus!");
        fetchTechnicians();
      } else {
        setError(data.message || "Gagal menghapus teknisi");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Terjadi kesalahan saat menghapus teknisi");
    }
  };

  const handleEdit = (technician: Technician) => {
    setEditTechnician({
      id: technician.id,
      name: technician.name,
      email: technician.email,
      password: "",
      expertise: technician.technicianProfile?.expertise || "",
      area: technician.technicianProfile?.area || "",
      shift: technician.technicianProfile?.shift || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!editTechnician) return;
    
    try {
      const response = await fetch(`/api/admin/technicians/${editTechnician.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editTechnician),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess("Data teknisi berhasil diperbarui!");
        setIsEditDialogOpen(false);
        fetchTechnicians();
      } else {
        setError(data.message || "Gagal memperbarui teknisi");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Terjadi kesalahan saat memperbarui teknisi");
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-semibold text-gray-900">Manajemen Teknisi</h1>
        <button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer transition-colors"
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
          <thead className="bg-gray-100 text-gray-700 border-b">
            <tr>
              <th className="px-6 py-3 ">Nama</th>
              <th className="px-6 py-3 ">Email</th>
              <th className="px-6 py-3 ">Keahlian</th>
              <th className="px-6 py-3 ">Area</th>
              <th className="px-6 py-3 ">Tanggal Dibuat</th>
              <th className="px-6 py-3 ">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">Loading...</td>
              </tr>
            ) : technicians.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
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
                  <td className="px-6 py-4">{new Date(technician.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 flex gap-3">
                    <button
                      onClick={() => handleEdit(technician)}
                      aria-label={`Edit ${technician.name}`}
                      className="px-3 py-1.5 rounded-md bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 hover:shadow-sm cursor-pointer transition text-sm"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(technician.id)}
                      aria-label={`Hapus ${technician.name}`}
                      className="px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 cursor-pointer transition text-sm"
                    >
                      Hapus
                    </button>
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
                <p><span className="font-medium">Dibuat:</span> {new Date(technician.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex justify-end gap-3 mt-3">
                <button
                  onClick={() => handleEdit(technician)}
                  aria-label={`Edit ${technician.name}`}
                  className="px-3 py-1 rounded-md bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 cursor-pointer transition text-sm"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(technician.id)}
                  aria-label={`Hapus ${technician.name}`}
                  className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 cursor-pointer transition text-sm"
                >
                  Hapus
                </button>
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
      {isEditDialogOpen && editTechnician && (
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

interface DialogProps {
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  formData: TechnicianFormData;
  setFormData: (data: TechnicianFormData) => void;
  isEdit?: boolean;
}

function Dialog({ title, onClose, onSubmit, formData, setFormData, isEdit = false }: DialogProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = "Nama harus diisi";
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = "Email harus diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }
    
    if (!isEdit && !formData.password) {
      newErrors.password = "Password harus diisi";
    }
    
    if (isEdit && formData.password && formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }
    
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn px-3">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg p-5 sm:p-6 relative overflow-y-auto max-h-[90vh]">
        {/* Tombol close */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 cursor-pointer text-xl disabled:opacity-50"
        >
          ✕
        </button>

        {/* Judul */}
        <h2 className="text-xl font-semibold mb-5 text-gray-800 text-center">
          {title}
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Nama"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
              className={`w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:outline-none ${
                errors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
              className={`w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:outline-none ${
                errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {!isEdit && (
            <div>
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                className={`w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:outline-none ${
                  errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
          )}

          {isEdit && (
            <div>
              <input
                type="password"
                placeholder="Password (opsional, kosongkan jika tidak ingin mengubah)"
                value={formData.password || ""}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                className={`w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:outline-none ${
                  errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
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

          

          {/* Tombol aksi */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer transition text-sm disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition text-sm disabled:opacity-50"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
