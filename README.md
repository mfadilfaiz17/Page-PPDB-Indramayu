# Sistem PPDB (Penerimaan Peserta Didik Baru) Kabupaten Indramayu

Platform online untuk pendaftaran peserta didik baru di sekolah-sekolah Kabupaten Indramayu.

**Status:** 🚧 In Development - Phase 2 (88% Complete)  
**Last Updated:** May 21, 2026

---

## 📊 Project Status

| Phase | Progress | Status |
|-------|----------|--------|
| Phase 1: Critical Quick Wins | 100% (7/7) | ✅ Complete |
| Phase 2: Backend Critical Fixes | 88% (7/8) | 🔄 In Progress |
| Phase 3: Database Improvements | 0% (0/12) | ⏳ Pending |
| Phase 4: Frontend Improvements | 0% (0/12) | ⏳ Pending |
| **Overall** | **33% (16/48)** | 🚧 In Development |

📋 **[View Detailed Progress](./PROGRESS_TRACKER.md)**

---

## 🎯 Fitur Utama

### Untuk Siswa
- ✅ **Registrasi Akun** - Daftar dengan validasi email, NISN, NIK
- ✅ **Form Pendaftaran 3-Langkah** - Pilih sekolah → jalur → upload dokumen
- ✅ **Upload Dokumen** - Upload KTP, KK, Ijazah, Rapor (max 2MB, PDF/JPG/PNG)
- ✅ **Tracking Status** - Lihat status pendaftaran dan verifikasi dokumen real-time
- ✅ **Hasil Seleksi** - Lihat hasil seleksi dengan peringkat

### Untuk Admin
- ✅ **Dashboard Admin** - Statistik pendaftar dan hasil seleksi
- ✅ **Verifikasi Dokumen** - Review dan approve/reject dokumen siswa
- ✅ **Input Hasil Seleksi** - Input status lulus/cadangan/tidak lulus
- ✅ **Kelola Master Data** - Manage sekolah, jalur PPDB, periode
- ✅ **Data Pendaftar** - Lihat semua pendaftar dengan filter

---

## 🛠️ Tech Stack

### Frontend
- **React 19.2.4** - UI library
- **Vite 8.0.0** - Build tool & dev server
- **Tailwind CSS 3.4.19** - Utility-first CSS
- **Heroicons** - Icon library
- **LocalStorage** - Client-side storage

### Backend
- **Express.js 4.21.2** - Server framework
- **MySQL 2** - Database
- **JWT** - Authentication & authorization
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Zod** - Input validation
- **Helmet** - Security headers
- **express-rate-limit** - Rate limiting

### Security Features
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Input validation with Zod
- ✅ Rate limiting on auth endpoints
- ✅ Security headers (Helmet)
- ✅ CORS configuration
- ✅ SQL injection protection
- ✅ Audit logging

---

## 📋 Prerequisites

- **Node.js** v16+ (recommended v18+)
- **npm** atau **yarn**
- **MySQL** 5.7+ atau 8.0+
- **Git**

---

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/USERNAME/PPDB-Indramayu.git
cd PPDB-Indramayu
```

### 2. Setup Database
```bash
# Login ke MySQL
mysql -u root -p

# Buat database
CREATE DATABASE sistem_ppdb;

# Import schema
mysql -u root -p sistem_ppdb < ppdb-backend/database.sql
```

### 3. Setup Backend
```bash
cd ppdb-backend

# Copy environment file
cp .env.example .env

# Edit .env dengan credentials Anda
# Minimal yang harus diisi:
# - DB_PASSWORD
# - JWT_SECRET
# - FRONTEND_URL (optional, default: http://localhost:5173)

# Install dependencies
npm install

# Jalankan server
npm run dev
```

Server akan berjalan di `http://localhost:5000`

### 4. Setup Frontend
```bash
cd ppdb-app

# Copy environment file
cp .env.example .env

# Edit .env jika perlu (default sudah OK untuk development)

# Install dependencies
npm install

# Jalankan dev server
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

---

## 👤 Default Accounts

### Admin Account
- **Username:** `admin`
- **Password:** `admin123`

### Test Student Accounts
- **Email:** `zora@example.com` | **Password:** `password123`
- **Email:** `faiz@example.com` | **Password:** `password123`
- **Email:** `sumbul@example.com` | **Password:** `password123`

---

## 📖 API Documentation

📄 **[Full API Documentation](./ppdb-backend/API_DOCUMENTATION.md)**

### Auth Endpoints
```
POST   /api/auth/register       - Register siswa baru
POST   /api/auth/login          - Login siswa
POST   /api/auth/admin-login    - Login admin
```

### Siswa Endpoints (Requires JWT)
```
GET    /api/dashboard           - Dashboard data siswa
POST   /api/pendaftaran         - Submit pendaftaran
GET    /api/pendaftaran/opsi    - Get opsi jalur & sekolah
GET    /api/dokumen             - Get dokumen siswa
POST   /api/dokumen/upload      - Upload dokumen
GET    /api/hasil-seleksi       - Get hasil seleksi siswa
```

### Admin Endpoints (Requires Admin JWT)
```
GET    /api/pendaftaran/admin   - Get semua pendaftar
GET    /api/hasil-seleksi/admin - Get semua hasil seleksi
POST   /api/hasil-seleksi       - Input hasil seleksi
GET    /api/master/sekolah      - Get semua sekolah
POST   /api/master/sekolah      - Tambah sekolah
PUT    /api/master/sekolah/:id  - Update sekolah
DELETE /api/master/sekolah/:id  - Hapus sekolah
GET    /api/master/jalur        - Get semua jalur
POST   /api/master/jalur        - Tambah jalur
PUT    /api/master/jalur/:id    - Update jalur
DELETE /api/master/jalur/:id    - Hapus jalur
```

---

## 📁 Project Structure

```
PPDB-Indramayu/
├── ppdb-app/                      # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── siswa/             # Halaman siswa
│   │   │   │   ├── HalamanAuth.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── FormPendaftaran.jsx
│   │   │   │   ├── StatusDokumen.jsx
│   │   │   │   └── HasilSeleksi.jsx
│   │   │   └── admin/             # Halaman admin
│   │   │       ├── LoginAdmin.jsx
│   │   │       ├── DashboardAdmin.jsx
│   │   │       ├── DataPendaftar.jsx
│   │   │       ├── VerifikasiDokumen.jsx
│   │   │       ├── HasilSeleksiAdmin.jsx
│   │   │       └── KelolaSekolah.jsx
│   │   ├── components/            # Reusable components
│   │   │   ├── SidebarAdmin.jsx
│   │   │   ├── NoticeBox.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   ├── config/
│   │   │   └── api.js             # API configuration
│   │   ├── services/
│   │   │   └── httpClient.js      # HTTP client
│   │   ├── App.jsx                # Main app component
│   │   └── main.jsx               # Entry point
│   ├── .env                       # Environment variables
│   ├── .env.example               # Environment template
│   └── vite.config.js
│
├── ppdb-backend/                  # Backend (Express.js)
│   ├── routes/                    # API routes
│   │   ├── auth.js                # Authentication
│   │   ├── dashboard.js           # Dashboard data
│   │   ├── pendaftaran.js         # Pendaftaran CRUD
│   │   ├── dokumen.js             # Document upload
│   │   ├── hasilSeleksi.js        # Hasil seleksi
│   │   ├── master.js              # Master data
│   │   ├── emailAuth.js           # Email verification
│   │   └── health.js              # Health check
│   ├── middleware/                # Middleware
│   │   ├── auth.js                # JWT verification
│   │   ├── requireAdmin.js        # Admin authorization
│   │   ├── authorize.js           # RBAC authorization
│   │   ├── rateLimiter.js         # Rate limiting
│   │   ├── errorHandler.js        # Error handling
│   │   └── auditLog.js            # Audit logging
│   ├── schemas/
│   │   └── validation.js          # Zod validation schemas
│   ├── utils/
│   │   ├── idGenerator.js         # ID generation
│   │   └── tokenGenerator.js      # Token generation
│   ├── services/
│   │   ├── emailService.js        # Email service
│   │   └── rbacService.js         # RBAC service
│   ├── config/
│   │   └── database.js            # Database connection
│   ├── migrations/                # Database migrations
│   ├── uploads/                   # Uploaded files
│   ├── .env                       # Environment variables
│   ├── .env.example               # Environment template
│   ├── database.sql               # Database schema
│   └── server.js                  # Express server
│
├── PROGRESS_TRACKER.md            # Project progress tracking
├── BACKEND_IMPROVEMENTS.md        # Backend improvement plan
├── FRONTEND_IMPROVEMENTS.md       # Frontend improvement plan
├── AGENTS.md                      # Agent guidelines
└── README.md                      # This file
```

---

## 🔐 Security

### Environment Variables
File `.env` berisi sensitive data dan **TIDAK** di-track di git.

**Backend (.env):**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=sistem_ppdb
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000/api
```

### Git Ignore
Repository menggunakan comprehensive `.gitignore` untuk:
- ✅ Mencegah commit credentials (`.env` files)
- ✅ Exclude dependencies (`node_modules/`)
- ✅ Ignore build outputs (`dist/`, `build/`)
- ✅ Exclude uploaded files (`uploads/*`)
- ✅ Ignore log files (`*.log`)
- ✅ Exclude OS files (`.DS_Store`, `Thumbs.db`)
- ✅ Ignore IDE files (`.vscode/`, `.idea/`)

📋 **[View .gitignore Guide](./GITIGNORE_GUIDE.md)** untuk detail lengkap

### Cleanup Git Repository
Jika ada file yang tidak sengaja ter-commit:

**Windows (PowerShell):**
```powershell
.\git-cleanup.ps1
```

**Linux/Mac (Bash):**
```bash
chmod +x git-cleanup.sh
./git-cleanup.sh
```

### Security Best Practices
- ✅ Passwords hashed dengan bcrypt (10 rounds)
- ✅ JWT tokens dengan expiration
- ✅ Rate limiting pada auth endpoints
- ✅ Input validation dengan Zod
- ✅ SQL injection protection
- ✅ CORS configuration
- ✅ Security headers (Helmet)
- ✅ File upload restrictions (2MB, PDF/JPG/PNG only)

---

## 🧪 Testing

### Backend Testing
```bash
cd ppdb-backend

# Test server startup
npm start

# Test with curl
curl http://localhost:5000/api/health
```

### Frontend Testing
```bash
cd ppdb-app

# Run dev server
npm run dev

# Run linter
npm run lint

# Build for production
npm run build
```

---

## 📝 Development Workflow

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/nama-fitur

# Make changes and commit
git add .
git commit -m "feat: deskripsi fitur"

# Push to remote
git push origin feature/nama-fitur

# Create Pull Request
```

### Commit Message Convention
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Build/config changes

---

## 🐛 Troubleshooting

### Backend tidak bisa start
```bash
# Check MySQL running
mysql -u root -p

# Check port 5000 available
netstat -ano | findstr :5000

# Check .env file exists
ls ppdb-backend/.env
```

### Frontend tidak bisa start
```bash
# Clear node_modules
rm -rf node_modules
npm install

# Check port 5173 available
netstat -ano | findstr :5173
```

### Database connection error
- Pastikan MySQL running
- Check credentials di `.env`
- Pastikan database `sistem_ppdb` sudah dibuat
- Check firewall tidak block port 3306

---

## 🤝 Contributing

Kontribusi welcome! Silakan:
1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details

---

## 👨‍💻 Team

**Developer:** ZORA  
**Project:** PPDB Kabupaten Indramayu  
**Year:** 2026

---

## 📞 Support

Jika ada pertanyaan atau issue:
- 📧 Email: mfadilfaiz17@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/mfadilfazi17/PPDB-Indramayu/issues)

---

**Last Updated:** May 21, 2026  
**Version:** 0.3.0 (Phase 2 - 88% Complete)
