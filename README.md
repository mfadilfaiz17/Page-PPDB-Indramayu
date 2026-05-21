# Sistem PPDB (Penerimaan Peserta Didik Baru) Kabupaten Indramayu

Platform online untuk pendaftaran peserta didik baru di sekolah-sekolah Kabupaten Indramayu.

## 🎯 Fitur Utama

- ✅ **Registrasi Siswa** - Daftar akun dengan validasi lengkap
- ✅ **Form Pendaftaran 3-Langkah** - Pilih sekolah → jalur → upload dokumen
- ✅ **Verifikasi Dokumen** - Admin verifikasi kelengkapan dokumen
- ✅ **Tracking Status** - Siswa lihat status pendaftaran real-time
- ✅ **Hasil Seleksi** - Admin input dan siswa lihat hasil seleksi

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI library
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **LocalStorage** - Client-side storage

### Backend
- **Express.js** - Server framework
- **MySQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload

## 📋 Prerequisites

- Node.js v16+
- npm atau yarn
- MySQL 5.7+
- Git

## 🚀 Installation

### 1. Clone Repository
```bash
git clone https://github.com/USERNAME/PPDB-Indramayu.git
cd PPDB-Indramayu
```

### 2. Setup Backend
```bash
cd ppdb-backend

# Copy .env.example ke .env
cp .env.example .env

# Edit .env dan masukkan credentials MySQL Anda
# DB_PASSWORD=your_password_here
# JWT_SECRET=your_secret_key_here

# Install dependencies
npm install

# Jalankan server
npm start
```

Server akan berjalan di `http://localhost:5000`

### 3. Setup Frontend
```bash
cd ppdb-app

# Install dependencies
npm install

# Jalankan dev server
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

## 📖 API Documentation

### Auth Endpoints
- `POST /api/auth/register` - Register siswa baru
- `POST /api/auth/login` - Login siswa
- `POST /api/auth/admin-login` - Login admin

### Siswa Endpoints
- `GET /api/dashboard` - Get dashboard data
- `POST /api/pendaftaran` - Submit pendaftaran
- `GET /api/pendaftaran/opsi` - Get opsi jalur & sekolah
- `GET /api/dokumen` - Get dokumen siswa
- `POST /api/dokumen/upload` - Upload dokumen
- `GET /api/hasil-seleksi` - Get hasil seleksi

### Admin Endpoints
- `GET /api/pendaftaran/admin` - Get semua pendaftar
- `GET /api/hasil-seleksi/admin` - Get semua hasil seleksi
- `POST /api/hasil-seleksi` - Input hasil seleksi

## 👤 Default Admin Account

- **Username:** `admin`
- **Password:** `admin123`

## 📁 Project Structure

```
PPDB-Indramayu/
├── ppdb-app/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── siswa/        # Halaman siswa
│   │   │   └── admin/        # Halaman admin
│   │   ├── components/       # Reusable components
│   │   └── App.jsx           # Main app component
│   └── vite.config.js
│
├── ppdb-backend/             # Backend (Express.js)
│   ├── routes/               # API routes
│   ├── middleware/           # Auth middleware
│   ├── config/               # Database config
│   └── server.js             # Express server
│
└── README.md                 # This file
```

## 🔐 Security Notes

- `.env` file tidak di-track di git (sensitive data)
- Use `.env.example` sebagai template
- Jangan share `.env` file
- Update `JWT_SECRET` dengan nilai yang aman

## 📝 Database Setup

Jalankan migration atau import schema:
```bash
# Via phpMyAdmin atau MySQL CLI
mysql -u root -p sistem_ppdb < ppdb-backend/database.sql
```

## 🤝 Kontribusi

Kontribusi welcome! Silakan buat PR untuk fitur baru atau bug fixes.

## 📄 License

MIT License

## 👨‍💻 Author

**Faiz** - [GitHub](https://github.com/USERNAME)

---

**Last Updated:** May 2025
