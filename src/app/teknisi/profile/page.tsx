"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface TechnicianProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  joinDate?: string;
  createdAt?: string;
  technicianProfile: {
    expertise: string;
    area: string;
    shift: string;
  } | null;
}

interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}

export default function TeknisiProfile() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState<TechnicianProfile | null>(null);
  const [taskStats, setTaskStats] = useState<TaskStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    expertise: "",
    area: "",
    shift: "",
  });

  /* =========================
   * Helpers
   * ========================= */
  const getSession = () => {
    const sessionStr = localStorage.getItem("user_session");
    if (!sessionStr) return null;
    try {
      return JSON.parse(sessionStr);
    } catch {
      return null;
    }
  };

  const formatDate = (raw?: string) => {
    if (!raw) return "-";
    const d = new Date(raw);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  /* =========================
   * Fetching Data
   * ========================= */
  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const session = getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const res = await fetch(`/api/admin/technicians/${session.id}`);
      if (!res.ok) throw new Error("Gagal mengambil profil");

      const data: TechnicianProfile = await res.json();
      setProfile(data);

      setFormData({
        name: data.name,
        email: data.email,
        phone: data.phone || "",
        expertise: data.technicianProfile?.expertise || "",
        area: data.technicianProfile?.area || "",
        shift: data.technicianProfile?.shift || "",
      });

      await fetchTaskStats(session.id);
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat memuat profil");
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskStats = async (technicianId: string) => {
    try {
      const res = await fetch(`/api/assignments?technicianId=${technicianId}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        setTaskStats({ total: 0, pending: 0, inProgress: 0, completed: 0 });
        return;
      }

      const assignments = await res.json();
      if (!Array.isArray(assignments)) return;

      const pending = assignments.filter(
        (a: any) => a.status === "PENDING"
      ).length;
      const inProgress = assignments.filter(
        (a: any) => a.status === "IN_PROGRESS"
      ).length;
      const completed = assignments.filter(
        (a: any) => a.status === "COMPLETED"
      ).length;

      setTaskStats({
        total: assignments.length,
        pending,
        inProgress,
        completed,
      });
    } catch (err) {
      console.error(err);
      setTaskStats({ total: 0, pending: 0, inProgress: 0, completed: 0 });
    }
  };

  /* =========================
   * Actions
   * ========================= */
  const handleSave = async () => {
    try {
      setError("");

      const session = getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // Build payload: teknisi hanya boleh memperbarui info personal/password.
      const payload: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      };

      // Hanya admin yang bisa mengubah informasi teknisi (expertise/area/shift).
      if (session.role === "admin") {
        payload.expertise = formData.expertise;
        payload.area = formData.area;
        payload.shift = formData.shift;
      }

      const res = await fetch(`/api/admin/technicians/${session.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Gagal menyimpan profil");
      }

      setIsEditing(false);
      await fetchProfile();
      alert("Profil berhasil diperbarui");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Terjadi kesalahan saat menyimpan");
    }
  };

  /* =========================
   * Render States
   * ========================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-black">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-black">
        <p className="text-lg text-red-600">
          {error || "Profil tidak ditemukan"}
        </p>
      </div>
    );
  }

  const joinDate = formatDate(profile.joinDate ?? profile.createdAt);

  /* =========================
   * UI
   * ========================= */
  return (
    <div className="min-h-screen bg-gray-50 p-4 text-black">
      <div className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-lg bg-white shadow-lg">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-lg sm:h-32 sm:w-32">
                  <svg
                    className="h-16 w-16 text-blue-600 sm:h-20 sm:w-20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-xl font-bold sm:text-2xl">
                    {profile.name}
                  </h1>
                  <p className="text-blue-100">Teknisi</p>
                </div>
              </div>

              <div className="text-center sm:text-right">
                <p className="text-sm">Bergabung sejak</p>
                <p className="text-sm font-medium">{joinDate}</p>
              </div>
            </div>
          </div>

          {/* Statistik */}
          <div className="grid grid-cols-2 gap-4 bg-blue-50 p-4 text-center sm:grid-cols-4">
            <Stat
              label="Total Tugas"
              value={taskStats.total}
              color="text-blue-600"
            />
            <Stat
              label="Menunggu"
              value={taskStats.pending}
              color="text-orange-500"
            />
            <Stat
              label="Sedang Dikerjakan"
              value={taskStats.inProgress}
              color="text-blue-500"
            />
            <Stat
              label="Selesai"
              value={taskStats.completed}
              color="text-green-600"
            />
          </div>

          {error && (
            <div className="m-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          {/* Konten */}
          <div className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Informasi Personal */}
              <Section title="Informasi Personal">
                {isEditing ? (
                  <InputGroup formData={formData} setFormData={setFormData} />
                ) : (
                  <ReadOnlyPersonal profile={profile} joinDate={joinDate} />
                )}
              </Section>

              {/* Tampilkan Informasi Teknisi hanya saat tidak sedang mengedit,
                  atau saat yang mengedit adalah admin */}
              {!isEditing ? (
                <Section title="Informasi Teknisi">
                  <TechnicianView profile={profile} />
                </Section>
              ) : getSession()?.role === "admin" ? (
                <Section title="Informasi Teknisi">
                  <TechnicianForm
                    formData={formData}
                    setFormData={setFormData}
                  />
                </Section>
              ) : null}

              <Section title="Keamanan">
                <button className="rounded-md bg-gray-100 px-4 py-2 hover:bg-gray-200">
                  Ubah Password
                </button>
              </Section>
 
              <div className="flex justify-end gap-2 md:col-span-2">
                {isEditing ? (
                  <>
                    <button onClick={() => setIsEditing(false)}>Batal</button>
                    <button
                      onClick={handleSave}
                      className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                      Simpan Perubahan
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Edit Profil
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
 * Small Components
 * ========================= */
function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-sm">{label}</p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b pb-4">
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function InputGroup({ formData, setFormData }: any) {
  return (
    <div className="space-y-4">
      <input
        className="w-full rounded-md border p-2"
        placeholder="Nama Lengkap"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <input
        className="w-full rounded-md border p-2"
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <input
        className="w-full rounded-md border p-2"
        placeholder="Nomor HP"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
      />
    </div>
  );
}

function ReadOnlyPersonal({ profile, joinDate }: any) {
  return (
    <div className="space-y-3">
      <Row label="Email" value={profile.email} />
      <Row label="Nomor HP" value={profile.phone || "-"} />
      <Row label="Bergabung Sejak" value={joinDate} />
    </div>
  );
}

function TechnicianForm({ formData, setFormData }: any) {
  return (
    <div className="space-y-4">
      <input
        className="w-full rounded-md border p-2"
        placeholder="Keahlian"
        value={formData.expertise}
        onChange={(e) =>
          setFormData({ ...formData, expertise: e.target.value })
        }
      />
      <input
        className="w-full rounded-md border p-2"
        placeholder="Area Penugasan"
        value={formData.area}
        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
      />
      <select
        className="w-full rounded-md border p-2"
        value={formData.shift}
        onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
      >
        <option value="">Pilih Shift</option>
        <option value="Pagi">Pagi</option>
        <option value="Siang">Siang</option>
        <option value="Malam">Malam</option>
      </select>
    </div>
  );
}

function TechnicianView({ profile }: any) {
  return (
    <div className="space-y-3">
      <Row
        label="Keahlian"
        value={profile.technicianProfile?.expertise || "-"}
      />
      <Row
        label="Area Penugasan"
        value={profile.technicianProfile?.area || "-"}
      />
      <Row
        label="Shift Kerja"
        value={profile.technicianProfile?.shift || "-"}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
