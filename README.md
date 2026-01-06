# CMMS System - Computerized Maintenance Management System
## PBL (Project Based Learning) - UPA PP CMMS Kampus

![Next.js](https://img.shields.io/badge/Next.js-15.5.9-black)
![React](https://img.shields.io/badge/React-19.1.0-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.16.2-2d3748)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-336791)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38bdf8)

---

## 📋 Daftar Isi

1. [Deskripsi Proyek](#deskripsi-proyek)
2. [Tim Pengembang](#tim-pengembang)
3. [Fitur Utama](#fitur-utama)
4. [Teknologi yang Digunakan](#teknologi-yang-digunakan)
5. [Panduan Instalasi](#panduan-instalasi)
6. [Cara Menjalankan Aplikasi](#cara-menjalankan-aplikasi)
7. [Struktur Proyek](#struktur-proyek)
8. [Link Penting](#link-penting)
9. [Dokumentasi Sistem](#dokumentasi-sistem)
10. [Lisensi](#lisensi)

---

## 📖 Deskripsi Proyek

**CMMS System (Computerized Maintenance Management System)** adalah aplikasi web modern yang dirancang untuk mengelola sistem pemeliharaan dan perbaikan aset secara efisien. Sistem ini memungkinkan organisasi untuk:

- **Mengelola Tiket Maintenance**: Staff dapat membuat permintaan pemeliharaan dengan detail lengkap
- **Menugaskan Teknisi**: Supervisor dapat mengassign pekerjaan kepada teknisi berdasarkan expertise dan availability
- **Tracking Progress**: Monitor progress pekerjaan secara real-time
- **Quality Assurance**: Verifikasi dan approval hasil pekerjaan oleh supervisor
- **Analytics & Reporting**: Laporan komprehensif tentang performa tim dan aset
- **Manajemen Aset**: Tracking semua aset dan riwayat maintenancenya

Aplikasi ini dibangun dengan teknologi terkini menggunakan **Next.js 15**, **React 19**, **Prisma ORM**, dan **PostgreSQL** dengan desain yang user-friendly dan responsif.

---

## 👥 Tim Pengembang

### Tim 3A-6 Semester 4 - Universitas Pendidikan dan Pelatihan

| No | NIM | Nama | Peran |
|:--:|:---:|------|-------|
| 1 | 3312411039 | **Roberto November Ramadhan** | Ketua Tim |
| 2 | 3312411035 | **Silvi Yulia Rahmawati** | Anggota |
| 3 | 3312411048 | **Jery Chandra** | Anggota |
| 4 | 3312411056 | **Riska Safitri** | Anggota |

**Kelas**: 3A-6  
**Semester**: 4  
**Tahun Akademik**: 2024/2025

---

## ✨ Fitur Utama

### 👤 Untuk Admin
- ✅ Manajemen user account (create, edit, deactivate)
- ✅ Generate dan manage registration tokens
- ✅ Dashboard analytics & system health
- ✅ Manage ticket categories
- ✅ Manage aset inventory dengan QR code
- ✅ View system audit logs
- ✅ Generate comprehensive reports

### 👷 Untuk Technician
- ✅ View assigned maintenance tasks
- ✅ Accept/Reject assignments
- ✅ Create repair logs dengan detail
- ✅ Upload completion evidence (photos)
- ✅ Track time spent on repairs
- ✅ View personal performance metrics
- ✅ Mobile-optimized interface

### 👨‍💼 Untuk Supervisor
- ✅ View & filter unassigned tickets
- ✅ Smart technician assignment
- ✅ Monitor team workload
- ✅ Real-time progress tracking
- ✅ Review & approve completed work
- ✅ Team performance analytics
- ✅ Generate team reports

### 👨‍💻 Untuk Staff
- ✅ Create maintenance tickets
- ✅ Track ticket status
- ✅ Upload issue documentation
- ✅ View ticket history
- ✅ Provide additional information

---

## 🛠️ Teknologi yang Digunakan

### Frontend
- **Next.js 15.5.9** - React framework dengan App Router
- **React 19.1.0** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **React Hook Form** - Form management
- **Recharts** - Data visualization
- **Lucide React** - Icon library
- **Headless UI** - Accessible UI components

### Backend & Database
- **Next.js API Routes** - RESTful API
- **Prisma ORM 6.16.2** - Database management
- **PostgreSQL** - Database
- **NextAuth 4** - Authentication & authorization
- **bcryptjs** - Password hashing

### Tools & Libraries
- **WebSocket (ws)** - Real-time notifications
- **Sharp** - Image optimization
- **Playwright** - E2E testing

### Development Tools
- **ESLint** - Code linting
- **Tailwind CSS** - Styling
- **ts-node** - TypeScript execution
- **Prisma Studio** - Database GUI

---

## 📥 Panduan Instalasi

### Prasyarat
- Node.js 18+ atau 20+
- npm, yarn, pnpm, atau bun
- PostgreSQL 12+
- Git

### Langkah-Langkah Instalasi

1. **Clone Repository**
```bash
git clone https://github.com/yourusername/pbl-upa-pp-cmms.git
cd pbl-upa-pp-cmms
```

2. **Install Dependencies**
```bash
npm install
# atau
yarn install
pnpm install
bun install
```

3. **Setup Environment Variables**
Buat file `.env.local` di root directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/cmms_db"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

4. **Setup Database**
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed initial data (optional)
npm run prisma:seed
```

5. **Generate Prisma Client**
```bash
npm run prisma:generate
```

---

## 🚀 Cara Menjalankan Aplikasi

### Mode Development
```bash
npm run dev
# atau
yarn dev
pnpm dev
bun dev
```

Akses aplikasi di: [http://localhost:3000](http://localhost:3000)

### Build untuk Production
```bash
npm run build
npm run start
```

### Testing
```bash
npm run test:e2e
```

### Lint Code
```bash
npm run lint
```

---

## 📂 Struktur Proyek

```
pbl-upa-pp-cmms/
├── src/
│   ├── app/
│   │   ├── admin/              # Admin pages
│   │   ├── staff/              # Staff pages
│   │   ├── teknisi/            # Technician pages
│   │   ├── supervisor/         # Supervisor pages
│   │   ├── api/                # API routes
│   │   ├── auth/               # Authentication pages
│   │   ├── login/              # Login page
│   │   ├── register/           # Register page
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Global styles
│   ├── lib/
│   │   ├── prisma.ts           # Prisma client
│   │   ├── notification.ts     # Notification service
│   │   └── utils/              # Utility functions
│   └── middleware.ts           # Next.js middleware
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Database migrations
│   └── seed.ts                 # Seed script
├── public/
│   └── uploads/                # User uploads directory
├── .env.local                  # Environment variables
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
└── README.md
```

---

## 🔗 Link Penting

### 📄 Dokumentasi & Laporan

| Item | Link |
|------|------|
| **📋 Laporan Lengkap** | [Google Drive](https://drive.google.com/file/d/1n_CwT79-ltLo9eeacKJeAwM9lxqZDQQ_/view?usp=drive_link) |
| **📁 Folder Lengkap** | [Google Drive Folder](https://drive.google.com/drive/folders/1-Y9JOblfCXdlssLUBnt6PeDZInKpuQ7A?usp=drive_link) |

### 🎥 Video Demonstrasi

| Konten | Link |
|--------|------|
| **Demo Aplikasi** | [YouTube - Demo Video](https://youtu.be/eV81d5qNo1A?si=-d-TH-KR1HavpOyj) |
| **Presentasi & Penjelasan** | [YouTube - Presentasi](https://youtu.be/YqiHLv-pQs4?si=DwcqGkzFGiRWJez1) |

### 💻 Source Code

| Repository | Link |
|------------|------|
| **GitHub Repository** | Anda sedang melihatnya! |
| **Main Branch** | Source code lengkap aplikasi |

---

## 📚 Dokumentasi Sistem

### Database Schema
Dokumentasi lengkap database dapat dilihat di [prisma/schema.prisma](./prisma/schema.prisma)

**11 Model Utama:**
- SystemUser (User management)
- Ticket (Maintenance requests)
- TicketCategory (Ticket classification)
- Assignment (Task assignment)
- RepairLog (Repair tracking)
- Asset (Equipment inventory)
- MaintenanceHistory (Maintenance records)
- Material (Materials used)
- TechnicianProfile (Technician info)
- Notification (System notifications)
- RegistrationToken (User registration)

### API Endpoints

**Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/register-with-token` - Register with token
- `POST /api/auth/logout` - User logout

**Tickets**
- `GET /api/tickets` - List tickets
- `POST /api/tickets` - Create ticket
- `GET /api/tickets/:id` - Get ticket detail
- `PUT /api/tickets/:id` - Update ticket

**Assignments**
- `GET /api/assignments` - List assignments
- `POST /api/assignments` - Create assignment
- `GET /api/assignments/:id` - Get assignment detail
- `PUT /api/assignments/:id` - Update assignment

**Repairs**
- `GET /api/repair-logs` - List repair logs
- `POST /api/repair-logs` - Create repair log
- `POST /api/repairs/verify-completion` - Verify completion

**Assets**
- `GET /api/assets` - List assets
- `POST /api/assets` - Create asset
- `GET /api/assets/:id` - Get asset detail

### User Roles & Permissions

| Role | Deskripsi | Akses |
|------|-----------|-------|
| **ADMIN** | System Administrator | Full system access |
| **SUPERVISOR** | Team Lead | Manage assignments & team |
| **TECHNICIAN** | Service Technician | Execute repairs |
| **STAFF** | Maintenance Staff | Create tickets |

---

## 🔐 Keamanan

- ✅ Password hashing dengan bcryptjs
- ✅ JWT token-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Secure session management
- ✅ Environment variable protection
- ✅ SQL injection protection (via Prisma ORM)

---

## 📊 Fitur Tambahan

### Notifikasi
- Real-time in-app notifications
- Status change alerts
- Assignment notifications
- Completion alerts

### Reporting & Analytics
- Dashboard dengan metrics key
- Team performance analytics
- Ticket analysis reports
- Cost analysis
- Trend analysis

### File Management
- Photo upload untuk completion evidence
- Document attachments
- QR code generation untuk aset
- Image optimization

---

## 🤝 Kontribusi

Untuk berkontribusi pada proyek ini:

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

---

## 📧 Kontak

Untuk pertanyaan atau saran, silakan hubungi tim pengembang:

- **Ketua Tim**: Roberto November Ramadhan
- **Email**: roberto.november@student.edu (ganti dengan email yang sesuai)
- **GitHub**: [Team Repository](https://github.com)

---

## 📄 Lisensi

Proyek ini dikembangkan sebagai bagian dari Program Beasiswa Latihan (PBL) di Universitas Pendidikan dan Pelatihan.

**License**: MIT (atau sesuai kebijakan institusi)

---

## 🎓 Informasi Akademis

- **Program**: Project Based Learning (PBL)
- **Institusi**: Universitas Pendidikan dan Pelatihan
- **Kelas**: 3A-6
- **Semester**: 4
- **Tahun Akademik**: 2024/2025

---

## ✅ Checklist Deployment

Sebelum deployment ke production, pastikan:

- [ ] Semua environment variables sudah dikonfigurasi
- [ ] Database migrations sudah di-run
- [ ] Build process berhasil tanpa error
- [ ] Testing sudah dilakukan
- [ ] Security audit sudah selesai
- [ ] Backup strategy sudah terencana
- [ ] Monitoring tools sudah setup

---

## 🙏 Ucapan Terima Kasih

Terima kasih kepada:
- Tim dosen pembimbing PBL
- Seluruh anggota tim pengembang
- Semua yang telah mendukung proyek ini

---

**Last Updated**: January 6, 2026

Untuk informasi lebih lanjut, silakan buka folder dokumentasi atau akses link-link di atas.
