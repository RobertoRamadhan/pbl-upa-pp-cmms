"use client";

import { useState } from "react";
import { RepairRequest } from "../types";
import { formatDate } from "@/lib/utils/date";
import Image from "next/image";

interface RepairDetailModalProps {
  repair: RepairRequest;
  onClose: () => void;
  onStatusUpdate: (
    status: RepairRequest["status"],
    note: string,
    images?: string[]
  ) => Promise<void>;
  onAddNote: (note: string) => Promise<void>;
}

export default function RepairDetailModal({
  repair,
  onClose,
  onStatusUpdate,
  onAddNote,
}: RepairDetailModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newStatus, setNewStatus] = useState(repair.status);
  const [statusNote, setStatusNote] = useState("");
  const [newNote, setNewNote] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [imageDataUrls, setImageDataUrls] = useState<string[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const MAX_FILES = 5;
  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

  const handleFileChange = (
    eOrObj: React.ChangeEvent<HTMLInputElement> | { target: { files: File[] } }
  ) => {
    const rawFiles =
      "target" in eOrObj && eOrObj.target.files
        ? Array.from(eOrObj.target.files)
        : ([] as File[]);

    if (rawFiles.length === 0) {
      setSelectedFiles([]);
      setPreviewUrls([]);
      setImageDataUrls([]);
      setFileError(null);
      return;
    }

    if (rawFiles.length > MAX_FILES) {
      setFileError(`Maks ${MAX_FILES} file saja.`);
      return;
    }

    for (const f of rawFiles) {
      if (!f.type.startsWith("image/")) {
        setFileError("Tipe file tidak didukung. Hanya gambar diperbolehkan.");
        return;
      }
      if (f.size > MAX_SIZE) {
        setFileError("Ukuran file terlalu besar. Maks 5MB per file.");
        return;
      }
    }

    setFileError(null);
    setSelectedFiles(rawFiles);
    const urls = rawFiles.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);

    // Convert to data URLs to send as JSON
    Promise.all(
      rawFiles.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error("File read error"));
            reader.readAsDataURL(file);
          })
      )
    )
      .then((dataUrls) => setImageDataUrls(dataUrls))
      .catch((err) => console.error(err));
  };

  const removeImage = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    setPreviewUrls(newPreviews);
    const newData = imageDataUrls.filter((_, i) => i !== index);
    setImageDataUrls(newData);
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Require either a note or at least one image when changing status
    if (newStatus === repair.status) return;

    // If user marks as completed, require at least 1 image
    if (newStatus === "completed" && imageDataUrls.length === 0) {
      setFileError(
        "Harap lampirkan minimal 1 foto saat menandai tugas sebagai selesai."
      );
      return;
    }

    if (!statusNote.trim() && imageDataUrls.length === 0) {
      setFileError("Tambahkan catatan atau lampirkan minimal 1 foto.");
      return;
    }

    setFileError(null);
    setIsSubmitting(true);
    try {
      await onStatusUpdate(newStatus, statusNote, imageDataUrls);
      setStatusNote("");
      setSelectedFiles([]);
      setPreviewUrls([]);
      setImageDataUrls([]);
    } catch (error: any) {
      console.error("Error updating status:", error);
      setServerError(error?.message || "Gagal mengubah status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddNote(newNote);
      setNewNote("");
    } catch (error) {
      console.error("Error adding note:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white/95 backdrop-filter backdrop-blur-sm bg-clip-padding rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-xl"
        data-testid="repair-form"
      >
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Detail Laporan Perbaikan</h2>
          <button
            onClick={onClose}
            className="text-black hover:text-gray-900"
            data-testid="close-repair-modal"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-129px)]">
          {/* Header Information */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium text-black mb-4">Informasi Laporan</h3>
              <div className="space-y-2">
                <p>
                  <span className="text-black">Subjek:</span> {repair.subject}
                </p>
                <p>
                  <span className="text-black">Kategori:</span>{" "}
                  {repair.category}
                </p>
                <p>
                  <span className="text-black">Prioritas:</span>{" "}
                  {repair.priority}
                </p>
                <p>
                  <span className="text-black">Status:</span> {repair.status}
                </p>
                <p>
                  <span className="text-black">Tanggal Laporan:</span>{" "}
                  {formatDate(repair.submitDate)}
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-black mb-4">Informasi Pelapor</h3>
              <div className="space-y-2">
                <p>
                  <span className="text-black">Nama:</span> {repair.userName}
                </p>
                <p>
                  <span className="text-black">Role:</span> {repair.userRole}
                </p>
                <p>
                  <span className="text-black">Departemen:</span>{" "}
                  {repair.department}
                </p>
                <p>
                  <span className="text-black">Lokasi:</span> {repair.location}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-medium text-black mb-2">Deskripsi Masalah</h3>
            <p className="text-black whitespace-pre-wrap">
              {repair.description}
            </p>
          </div>

          {/* Images */}
          {repair.images && repair.images.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium text-black mb-2">Gambar</h3>
              <div className="grid grid-cols-4 gap-4">
                {repair.images.map((image, index) => (
                  <div key={index} className="relative aspect-square">
                    <Image
                      src={image}
                      alt={`Image ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Update Form (styled) */}
          <div className="mb-6">
            <h3 className="font-medium text-black mb-3">Update Status</h3>

            <div className="bg-white shadow-sm border rounded-lg p-4">
              <form onSubmit={handleStatusUpdate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <label className="text-sm text-gray-700">Pilih Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) =>
                      setNewStatus(e.target.value as RepairRequest["status"])
                    }
                    className="col-span-2 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                    data-testid="status-select"
                  >
                    <option value="pending">Menunggu</option>
                    <option value="in_progress">Sedang Dikerjakan</option>
                    <option value="completed">Selesai</option>
                    <option value="rejected">Ditolak</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-700 block mb-1">
                    Catatan
                  </label>
                  <textarea
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Tambahkan catatan untuk perubahan status (wajib jika tidak ada foto)..."
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    disabled={isSubmitting}
                    data-testid="status-note"
                  ></textarea>
                  <p className="text-xs text-gray-500 mt-1">
                    Catatan harus diisi jika tidak melampirkan bukti foto.
                  </p>
                </div>

                {/* Enhanced Image upload area */}
                <div>
                  <label className="text-sm text-gray-700 mb-2 block">
                    Bukti Foto (opsional)
                  </label>

                  <div
                    className={`border-2 rounded-lg p-4 flex flex-col items-center justify-center gap-2 text-center transition-colors ${
                      typeof window !== "undefined" && previewUrls.length === 0
                        ? "border-dashed border-gray-300 bg-gray-50"
                        : "border-gray-200"
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      (e.currentTarget as HTMLDivElement).classList.add(
                        "ring-2",
                        "ring-blue-300"
                      );
                    }}
                    onDragLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).classList.remove(
                        "ring-2",
                        "ring-blue-300"
                      );
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      (e.currentTarget as HTMLDivElement).classList.remove(
                        "ring-2",
                        "ring-blue-300"
                      );
                      const files = Array.from(
                        e.dataTransfer.files || []
                      ).filter((f) => f.type.startsWith("image/"));
                      if (files.length)
                        handleFileChange({
                          target: { files },
                        } as unknown as React.ChangeEvent<HTMLInputElement>);
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="text-gray-600">
                      Tarik & letakkan gambar di sini atau
                    </div>
                    <label className="mt-2 inline-flex items-center gap-2 cursor-pointer text-blue-600 hover:underline">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        disabled={isSubmitting}
                        data-testid="image-input"
                        className="hidden"
                      />
                      <span className="px-3 py-1 rounded bg-blue-50 text-blue-700">
                        Pilih File
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Maks 5 file, masing-masing maksimal 5MB. (jpg/png/webp)
                    </p>
                  </div>

                  {/* File validation feedback */}
                  {fileError && (
                    <p className="text-sm text-red-600 mt-2">{fileError}</p>
                  )}

                  {/* Preview grid */}
                  {previewUrls.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {previewUrls.map((src, idx) => (
                        <div
                          key={idx}
                          className="relative border rounded overflow-hidden"
                        >
                          <img
                            src={src}
                            alt={`preview ${idx}`}
                            className="object-cover w-full h-24"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-white rounded-full p-1 text-red-500 shadow"
                            aria-label={`Remove preview ${idx}`}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <div className="flex-1 text-left">
                    {fileError && (
                      <p className="text-sm text-red-600">{fileError}</p>
                    )}
                    {serverError && (
                      <p className="text-sm text-red-600 mt-1">{serverError}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
                    disabled={isSubmitting}
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 ${
                      isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                    }`}
                    disabled={
                      isSubmitting ||
                      newStatus === repair.status ||
                      (newStatus === "completed" &&
                        imageDataUrls.length === 0) ||
                      (!statusNote.trim() && imageDataUrls.length === 0)
                    }
                    data-testid="submit-repair"
                  >
                    {isSubmitting && (
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    )}
                    Update Status
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Add Note Form (styled) */}
          <div className="mb-6">
            <h3 className="font-medium text-black mb-3">Tambah Catatan</h3>

            <div className="bg-white shadow-sm border rounded-lg p-4">
              <form onSubmit={handleAddNote} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-700 block mb-1">
                    Catatan Baru
                  </label>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Tuliskan catatan yang relevan..."
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    disabled={isSubmitting}
                    data-testid="note-input"
                  ></textarea>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">
                      Catatan akan tampil di riwayat
                    </p>
                    <p className="text-xs text-gray-400">
                      {newNote.length} karakter
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setNewNote("")}
                    className="px-3 py-1 rounded-lg border text-gray-700 hover:bg-gray-50"
                    disabled={isSubmitting || !newNote.trim()}
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                      isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                    }`}
                    disabled={isSubmitting || !newNote.trim()}
                    data-testid="add-note"
                  >
                    Tambah Catatan
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Timeline */}
          {repair.notes && repair.notes.length > 0 && (
            <div>
              <h3 className="font-medium text-black mb-2">Riwayat</h3>
              <div className="space-y-4">
                {repair.notes.map((note, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <p className="text-black whitespace-pre-wrap">{note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
