# 📋 PANDUAN TOKEN REGISTRASI ADMIN

## 🎯 Alur Registrasi Teknisi & Supervisor

Admin > Generate Token → Bagikan Token → Teknisi/Supervisor Register dengan Token

---

## 📱 CARA ADMIN MEMBUAT TOKEN

### 1. **Buka Menu Token Registrasi**
   - Login sebagai Admin
   - Klik **"Token Registrasi"** di sidebar admin
   - URL: `/admin/registration-tokens`

### 2. **Buat Token Baru**
   - Klik tombol **"+ Buat Token Baru"** (berwarna biru)
   - Modal akan muncul dengan form

### 3. **Isi Form**
   ```
   ┌─────────────────────────────────┐
   │ Role (pilih salah satu):        │
   │ ○ Teknisi                       │
   │ ○ Supervisor                    │
   │                                 │
   │ Email (opsional):               │
   │ [user@example.com]              │
   │ (jika diisi, token hanya untuk  │
   │  email ini)                     │
   │                                 │
   │ [Buat Token] [Batal]            │
   └─────────────────────────────────┘
   ```

### 4. **Token Berhasil Dibuat**
   - ✅ Token muncul dengan info:
     ```
     ✅ Token Berhasil Dibuat!
     Bagikan token ini kepada [ROLE] yang ingin mendaftar.
     Token berlaku 7 hari.
     
     Token: abc123def456ghi789...
     [Copy] (tombol untuk copy)
     ```

### 5. **Bagikan Token**
   - Klik **"Copy"** untuk copy token
   - Kirim ke teknisi/supervisor via:
     - WhatsApp
     - Email
     - Atau cara lain

---

## 👤 CARA TEKNISI/SUPERVISOR MENDAFTAR DENGAN TOKEN

### 1. **Buka Halaman Register**
   - URL: `/register`
   - Atau klik "Daftar" dari halaman login

### 2. **Pilih "Daftar dengan Token"**
   ```
   ┌────────────────────────────────┐
   │ PENDAFTARAN                    │
   │                                │
   │ ○ Daftar Akun Baru             │
   │ ● Daftar dengan Token          │
   │                                │
   │ Token:                         │
   │ [abc123def456ghi789...]        │
   │                                │
   │ [Submit]                       │
   └────────────────────────────────┘
   ```

### 3. **Masukkan Token**
   - Paste token yang diterima dari admin
   - Klik **Submit**

### 4. **Isi Data Lengkap**
   - Username
   - Password
   - Nama Lengkap
   - Email
   - Department (opsional)

### 5. **Registrasi Selesai**
   - Akun berhasil dibuat
   - Langsung bisa login dengan username & password

---

## 📊 TABEL TOKEN - YANG BISA DILIHAT ADMIN

### Kolom Tabel:
| Kolom | Keterangan |
|-------|-----------|
| **Role** | Teknisi atau Supervisor |
| **Token** | Awal dari token (16 karakter) |
| **Email** | Email yang dibatasi (atau "-") |
| **Dibuat** | Tanggal & jam pembuatan |
| **Expire** | Tanggal & jam kadaluarsa (7 hari) |
| **Status** | Aktif / Expired / Terpakai |
| **Aksi** | Tombol Hapus |

### Status Token:
- 🟢 **Aktif** = Belum digunakan, belum expired
- 🔴 **Expired** = Sudah lewat 7 hari, tidak bisa pakai lagi
- ⚫ **Terpakai** = Sudah digunakan untuk registrasi

---

## ⚙️ ATURAN TOKEN

### Keamanan:
1. **Berlaku 7 hari** dari pembuatan
2. **Sekali pakai** - token tidak bisa digunakan 2x
3. **Email restrict** (opsional) - hanya email tertentu yang bisa pakai
4. **Unik** - setiap token berbeda

### Tidak Bisa Registrasi Kalau:
- ❌ Token sudah digunakan sebelumnya
- ❌ Token sudah expired (> 7 hari)
- ❌ Email tidak sesuai dengan batasan (jika ada)
- ❌ Token format salah / tidak ada

---

## 📝 CONTOH SKENARIO

### Admin ingin tambah Teknisi baru:

1. **Admin:**
   ```
   - Buka /admin/registration-tokens
   - Klik "Buat Token Baru"
   - Pilih Role: Teknisi
   - Email: budi@company.com (opsional)
   - Klik "Buat Token"
   - Dapat token: 7f8a9b2c5d...
   ```

2. **Kirim ke Teknisi (Budi):**
   ```
   "Halo Budi, berikut token registrasi:
   Token: 7f8a9b2c5d...
   Buka: https://your-app.com/register
   Pilih 'Daftar dengan Token'
   Paste token, isi data, selesai!"
   ```

3. **Teknisi Budi:**
   ```
   - Buka /register
   - Pilih "Daftar dengan Token"
   - Paste: 7f8a9b2c5d...
   - Isi: Username, Password, Nama, Email (budi@company.com)
   - Submit
   - ✅ Akun berhasil dibuat
   - Login dengan username & password
   ```

4. **Admin cek:**
   ```
   - Buka /admin/registration-tokens
   - Lihat token di tabel
   - Status: "Terpakai" ✓
   - Waktu terpakai: hari & jam
   ```

---

## ❓ PERTANYAAN SERING

**Q: Bisakah admin berbagi token ke banyak orang?**
A: TIDAK recommended. Buat token baru untuk setiap orang agar lebih aman & tertracking.

**Q: Token sudah kadaluarsa, apa yang harus dilakukan?**
A: Buat token baru, token lama tidak bisa dipakai lagi.

**Q: Bisakah menghapus token yang sudah terpakai?**
A: Bisa, tapi tidak perlu. Token yang terpakai sudah aman (akun sudah dibuat).

**Q: Berapa lama token berlaku?**
A: **7 hari** dari tanggal pembuatan.

**Q: Bisakah mengubah durasi token?**
A: Admin dashboard saat ini tetap 7 hari. Bisa custom via database kalau diperlukan.

---

## 🔐 BEST PRACTICES

1. ✅ **Buat token individual** untuk setiap orang
2. ✅ **Restrict email** jika memungkinkan
3. ✅ **Hapus token lama** yang sudah expired
4. ✅ **Bagikan via secure channel** (WhatsApp, Email, bukan public)
5. ✅ **Catat** siapa dapat token apa untuk tracking

---
