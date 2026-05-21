# PPDB Backend API Documentation

**Base URL:** `http://localhost:5000/api`

**Auth Headers:**
- Student endpoints: `Authorization: Bearer {jwt_token}` (from `/auth/register` or `/auth/login`)
- Admin endpoints: `Authorization: Bearer {admin_token}` (from `/auth/admin-login`)

---

## 🔐 Authentication Routes

### `POST /auth/register`
Register a new student account.

**Request Body:**
```json
{
  "nisn": "1234567890",
  "nama_lengkap": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "no_wa": "081234567890",
  "tanggal_lahir": "2008-01-15"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Pendaftaran berhasil! Silakan login.",
  "id_siswa": "S-abc123d4"
}
```

**Validation Errors (400):**
- NISN must be 10 digits
- Email must be valid format
- Password minimum 8 characters
- All fields required

---

### `POST /auth/login`
Login as a student.

**Request Body:**
```json
{
  "nisn": "1234567890",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "siswa": {
    "id_siswa": "S-abc123d4",
    "nama_lengkap": "John Doe",
    "nisn": "1234567890",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- `401` - Invalid NISN or password
- `429` - Too many login attempts (5 attempts per 15 minutes per IP)

---

### `POST /auth/admin-login`
Login as an admin.

**Request Body:**
```json
{
  "username": "admin",
  "password": "adminPassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id_admin": "A-001",
    "username": "admin",
    "id_role": "R001"
  }
}
```

**Errors:**
- `401` - Invalid credentials
- `429` - Rate limited

---

## 📋 Pendaftaran (Registration) Routes

### `GET /pendaftaran/opsi`
Get registration options (jalur, sekolah, periode).

**Auth:** Required (student token)

**Response (200):**
```json
{
  "success": true,
  "jalur": [
    {
      "id_jalur": "J-001",
      "nama_jalur": "Jalur Prestasi",
      "persentase_kuota": 30
    }
  ],
  "sekolah": [
    {
      "id_sekolah": "ST-001",
      "nama_sekolah": "SMA Negeri 1",
      "jenjang": "SMA",
      "kuota": 100,
      "alamat_sekolah": "Jl. Merdeka No. 1"
    }
  ],
  "periode": {
    "tahun_ajaran": "2024-2025",
    "tanggal_mulai": "2024-01-01",
    "tanggal_selesai": "2024-02-28"
  }
}
```

---

### `GET /pendaftaran/admin`
List all student registrations (admin only).

**Auth:** Required (admin token)

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response (200):**
```json
[
  {
    "id_pendaftaran": "P-001",
    "id_siswa": "S-abc123d4",
    "nama_lengkap": "John Doe",
    "nisn": "1234567890",
    "email": "john@example.com",
    "status_pendaftaran": "TERVERIFIKASI",
    "tanggal_daftar": "2024-01-10"
  }
]
```

---

## 📄 Dokumen (Documents) Routes

### `GET /dokumen`
Get student's document status.

**Auth:** Required (student token)

**Response (200):**
```json
[
  {
    "id_dokumen": "D-001",
    "id_jenis_dokumen": "JD-001",
    "nama_dokumen": "Kartu Pelajar",
    "sifat_dokumen": "WAJIB",
    "status_dokumen": "TERUPLOAD",
    "file_path": "/uploads/S-abc123d4_1704897600000.pdf"
  }
]
```

---

### `POST /dokumen/upload`
Upload or update a document.

**Auth:** Required (student token)

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` (File): PDF, JPG, or PNG (max 2MB)
- `id_jenis_dokumen` (string): Document type ID

**Response (200):**
```json
{
  "success": true,
  "status_dokumen": "TERUPLOAD",
  "file_path": "/uploads/S-abc123d4_1704897600000.pdf",
  "message": "Dokumen berhasil diupload."
}
```

**Error Responses:**
- `400` - File or document type missing, or format not allowed
- `413` - File size exceeds 2MB limit

---

## 🏆 Hasil Seleksi (Selection Results) Routes

### `GET /hasil-seleksi`
Get student's selection result.

**Auth:** Required (student token)

**Response (200):**
```json
{
  "id_hasil": "H-001",
  "status_hasil": "LULUS",
  "peringkat": 1,
  "tanggal_pengumuman": "15 February 2024",
  "nama_sekolah": "SMA Negeri 1",
  "nama_jalur": "Jalur Prestasi"
}
```

Returns `null` if no result available yet.

---

### `GET /hasil-seleksi/admin`
List all selection results (admin only).

**Auth:** Required (admin token)

**Response (200):**
```json
[
  {
    "id_hasil": "H-001",
    "id_siswa": "S-abc123d4",
    "id_sekolah": "ST-001",
    "id_jalur": "J-001",
    "status_hasil": "LULUS",
    "peringkat": 1,
    "tanggal_pengumuman": "15 February 2024",
    "nama_lengkap": "John Doe",
    "nisn": "1234567890",
    "nama_sekolah": "SMA Negeri 1",
    "nama_jalur": "Jalur Prestasi"
  }
]
```

---

### `POST /hasil-seleksi`
Input or update selection result (admin only).

**Auth:** Required (admin token)  
**Authorization:** Requires "hasil_seleksi:create" permission (Operator Hasil role or higher)

**Request Body:**
```json
{
  "id_siswa": "S-abc123d4",
  "id_sekolah": "ST-001",
  "id_jalur": "J-001",
  "status_hasil": "LULUS",
  "peringkat": 1,
  "tanggal_pengumuman": "2024-02-15"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Hasil seleksi berhasil disimpan."
}
```

---

## 🏫 Master Data Routes

### `GET /master/sekolah`
List all schools.

**Auth:** Required (admin token)

**Response (200):**
```json
[
  {
    "id": "ST-001",
    "npsn": "12345678",
    "nama": "SMA Negeri 1",
    "jenjang": "SMA",
    "kuota": 100,
    "alamat": "Jl. Merdeka No. 1"
  }
]
```

---

### `POST /master/sekolah`
Create a school (admin only).

**Auth:** Required (admin token)  
**Authorization:** Requires "sekolah:manage" permission (Operator Master role or higher)

**Request Body:**
```json
{
  "npsn": "12345678",
  "nama_sekolah": "SMA Negeri 1",
  "jenjang": "SMA",
  "kuota": 100,
  "alamat_sekolah": "Jl. Merdeka No. 1"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id_sekolah": "ST-002",
    "npsn": "12345678",
    "nama_sekolah": "SMA Negeri 1",
    "jenjang": "SMA",
    "kuota": 100,
    "alamat_sekolah": "Jl. Merdeka No. 1"
  }
}
```

---

### `PUT /master/sekolah/:id`
Update a school (admin only).

**Auth:** Required (admin token)  
**Authorization:** Requires "sekolah:manage" permission

**Request Body:** Same as POST

**Response (200):**
```json
{
  "success": true,
  "message": "Sekolah berhasil diperbarui."
}
```

---

### `DELETE /master/sekolah/:id`
Delete a school (admin only).

**Auth:** Required (admin token)  
**Authorization:** Requires "sekolah:manage" permission

**Response (200):**
```json
{
  "success": true,
  "message": "Sekolah berhasil dihapus."
}
```

**Error Response:**
- `400` - School is still used in selection results

---

### `GET /master/jalur`
List all jalur (selection tracks).

**Auth:** Required (admin token)

**Response (200):**
```json
[
  {
    "id": "J-001",
    "nama": "Jalur Prestasi",
    "kuota": 30
  }
]
```

---

### `POST /master/jalur`
Create a jalur (admin only).

**Auth:** Required (admin token)  
**Authorization:** Requires "jalur:manage" permission

**Request Body:**
```json
{
  "nama_jalur": "Jalur Prestasi",
  "persentase_kuota": 30
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id_jalur": "J-002",
    "nama_jalur": "Jalur Prestasi",
    "persentase_kuota": 30
  }
}
```

---

### `PUT /master/jalur/:id`
Update a jalur (admin only).

**Auth:** Required (admin token)  
**Authorization:** Requires "jalur:manage" permission

---

### `DELETE /master/jalur/:id`
Delete a jalur (admin only).

**Auth:** Required (admin token)  
**Authorization:** Requires "jalur:manage" permission

**Error Response:**
- `400` - Jalur is still used in schools or selection results

---

## ⚕️ Health Check

### `GET /health`
System health status (no auth required).

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

---

## 🔒 Error Responses

### 400 Bad Request
```json
{
  "message": "Validation error details",
  "field": "email",
  "code": "invalid_format"
}
```

### 401 Unauthorized
```json
{
  "message": "Token tidak valid atau kadaluarsa."
}
```

### 403 Forbidden
```json
{
  "message": "Anda tidak memiliki akses untuk create sekolah."
}
```

### 409 Conflict
```json
{
  "message": "Email sudah terdaftar."
}
```

### 413 Payload Too Large
```json
{
  "message": "File terlalu besar (max 2MB)."
}
```

### 429 Too Many Requests
```json
{
  "message": "Terlalu banyak percobaan login. Coba lagi nanti."
}
```

### 500 Internal Server Error
```json
{
  "message": "Terjadi kesalahan server."
}
```

---

## 🔄 Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET/PUT request |
| 201 | Created | Successful POST request |
| 400 | Bad Request | Validation errors |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Permission denied |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate entry (email, NISN) |
| 413 | Payload Too Large | File too large |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- Pagination uses `page` and `limit` query parameters
- File uploads require `multipart/form-data` content type
- All JSON responses use UTF-8 encoding
- CORS is configured to allow `http://localhost:5173` (frontend) in development

