# 📋 Struktur Kategori Tiket CMMS - UPA Polibatam

## Daftar Kategori Tiket yang Telah Dibuat

Sistem CMMS sekarang memiliki **14 kategori tiket** yang terstruktur sesuai dengan fungsi dan lingkup UPA (Unit Pengelolaan Aset) Polibatam.

### 1. **KERUSAKAN GEDUNG (FISIK BANGUNAN)**
Kategori utama untuk semua jenis kerusakan pada struktur fisik bangunan kampus.

#### Sub-Kategori:
- **Bangunan & Struktur**
  - Dinding retak/rusak
  - Atap bocor/rusak
  - Lantai rusak
  - Plafon jebol

- **Pintu & Jendela**
  - Engsel rusak
  - Kunci macet
  - Kaca pecah
  - Kusen lapuk

- **Fasilitas Sanitasi**
  - Toilet mampet/rusak
  - Keran bocor
  - Instalasi air rusak

---

### 2. **SISTEM ELEKTRIKAL & MEKANIKAL**
Kategori untuk masalah sistem kelistrikan, plumbing, dan HVAC.

#### Sub-Kategori:
- **Instalasi Listrik**
  - Lampu mati
  - Stopkontak tidak berfungsi
  - Korsleting
  - Gangguan MCB

- **Sistem Air**
  - Pipa bocor
  - Pompa air rusak
  - Instalasi air panas/dingin bermasalah

- **Sistem Pendingin (AC)**
  - AC tidak dingin
  - AC bocor
  - AC mati

---

### 3. **PERALATAN & FASILITAS PENDIDIKAN/UMUM**
Kategori untuk peralatan yang mendukung kegiatan akademis dan operasional kampus.

#### Sub-Kategori:
- **Peralatan Komputer & IT**
  - Komputer error
  - Proyektor mati/bergaris
  - Speaker tidak bersuara
  - Printer rusak

- **Peralatan Laboratorium**
  - Kerusakan alat praktikum
  - Peralatan laboratorium yang tidak berfungsi

- **Meubel & Furnitur**
  - Kursi patah
  - Meja rusak
  - Lemari tidak bisa ditutup

- **Fasilitas Umum**
  - Pagar rusak
  - Gerbang bermasalah
  - Papan pengumuman pecah

---

### 4. **PEMELIHARAAN RUTIN**
Kategori untuk pemeriksaan berkala dan perawatan preventif.

**Deskripsi:** Pemeriksaan berkala dan perawatan preventif untuk mencegah kerusakan lebih besar pada semua fasilitas di atas.

---

## Cara Menggunakan Kategori Tiket

### Untuk Staff (Pembuat Tiket):
1. Buka halaman "Buat Tiket Baru"
2. Pilih kategori yang sesuai dengan jenis kerusakan/masalah
3. Isi detail masalah
4. Submit tiket

### Untuk Supervisor:
1. Lihat dashboard tiket per kategori
2. Analisis volume kerusakan per kategori
3. Alokasikan sumber daya teknisi berdasarkan kategori
4. Monitor trend kerusakan per kategori

### Untuk Teknisi:
1. Filter tugas berdasarkan kategori
2. Lihat detail kategori untuk memahami jenis pekerjaan
3. Dokumentasikan perbaikan sesuai kategori

---

## Integrasi dengan Sistem CMMS

### Database Schema
- Tabel: `TicketCategory`
- Fields: `id`, `name`, `description`, `isActive`, `createdAt`, `updatedAt`

### API Endpoints
- `GET /api/ticket-categories/` - Daftar semua kategori
- `GET /api/ticket-categories/:id` - Detail kategori
- `POST /api/ticket-categories/` - Buat kategori baru (Admin only)
- `PUT /api/ticket-categories/:id` - Update kategori (Admin only)
- `DELETE /api/ticket-categories/:id` - Hapus kategori (Admin only)

---

## Notes
- Semua kategori sudah tersedia dan aktif di sistem
- Admin dapat menambah/mengedit kategori melalui dashboard admin
- Rekomendasi: Jangan hapus kategori yang sudah digunakan, hanya set `isActive = false`

---

**Last Updated:** 2 January 2026
**Created by:** CMMS System Admin
