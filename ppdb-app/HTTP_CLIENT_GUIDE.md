# Frontend HTTP Client Usage Guide

**Location:** `src/services/httpClient.js`

The HTTP client provides a centralized way to make API calls with automatic authentication and error handling.

---

## Basic Setup

Import the API client in your component:

```javascript
import apiClient from '../services/httpClient';
```

---

## API Methods

### GET Request

```javascript
// Simple GET
const data = await apiClient.get('/pendaftaran/admin');

// With query parameters (pass in headers or construct URL)
const data = await apiClient.get('/pendaftaran/admin?page=1&limit=20');
```

**Returns:** Promise that resolves to response JSON

**Errors:** Throws object with `{ status, message, ... }`

---

### POST Request

```javascript
// Create new school
const response = await apiClient.post('/master/sekolah', {
  npsn: "12345678",
  nama_sekolah: "SMA Negeri 1",
  jenjang: "SMA",
  kuota: 100,
  alamat_sekolah: "Jl. Merdeka No. 1"
});

console.log(response.success); // true
console.log(response.data.id_sekolah); // "ST-002"
```

**Parameters:**
- `endpoint` (string): API path (e.g., '/master/sekolah')
- `data` (object): Request body
- `options` (object, optional): Additional fetch options

**Returns:** Promise that resolves to response JSON

---

### PUT Request

```javascript
// Update a school
const response = await apiClient.put('/master/sekolah/ST-001', {
  nama_sekolah: "SMA Negeri 1 Updated",
  kuota: 120
});
```

---

### DELETE Request

```javascript
// Delete a school
const response = await apiClient.delete('/master/sekolah/ST-001');

console.log(response.message); // "Sekolah berhasil dihapus."
```

---

### File Upload (FormData)

```javascript
// Upload a document
const formData = new FormData();
formData.append('file', fileInputElement.files[0]);
formData.append('id_jenis_dokumen', 'JD-001');

const response = await apiClient.postFormData('/dokumen/upload', formData);

console.log(response.file_path); // "/uploads/S-abc123d4_1704897600000.pdf"
```

**Parameters:**
- `endpoint` (string): API path
- `formData` (FormData): Form data with file
- `options` (object, optional): Additional fetch options

---

## Automatic Features

### 1. Authorization Header

The client automatically injects the JWT token from localStorage:

```javascript
// Token is added automatically to all requests
// Authorization: Bearer {token}

// Tries student token first, then admin token
const token = localStorage.getItem('ppdb_token') || localStorage.getItem('ppdb_admin_token');
```

---

### 2. Content-Type Header

JSON requests automatically set:
```
Content-Type: application/json
```

---

### 3. Error Handling

The client handles errors consistently:

```javascript
try {
  const data = await apiClient.get('/some-endpoint');
} catch (error) {
  console.error(error.status); // HTTP status code (400, 401, 500, etc)
  console.error(error.message); // Error message
  
  // Handle specific errors
  if (error.status === 401) {
    // Token invalid - redirect to login
    window.location.href = '/';
  }
  if (error.status === 403) {
    // Permission denied
    alert('Anda tidak memiliki akses ke fitur ini');
  }
}
```

---

### 4. 401 Auto-Logout

If the server returns 401 (Unauthorized):

1. All auth tokens are cleared from localStorage
2. User is redirected to home page (login)

```javascript
// This happens automatically in httpClient.js
if (response.status === 401) {
  localStorage.removeItem('ppdb_token');
  localStorage.removeItem('ppdb_siswa');
  localStorage.removeItem('ppdb_admin_token');
  localStorage.removeItem('ppdb_admin');
  window.location.href = '/';
}
```

---

## Real-World Examples

### Student Login

```javascript
import apiClient from '../services/httpClient';

async function login(nisn, password) {
  try {
    const response = await apiClient.post('/auth/login', {
      nisn,
      password
    });
    
    // Save token and user data
    localStorage.setItem('ppdb_token', response.token);
    localStorage.setItem('ppdb_siswa', JSON.stringify(response.siswa));
    
    // Redirect to dashboard
    window.location.href = '/dashboard';
  } catch (error) {
    alert(`Login gagal: ${error.message}`);
  }
}
```

---

### Fetch Registration Options

```javascript
async function loadOptions() {
  try {
    const options = await apiClient.get('/pendaftaran/opsi');
    
    setJalurList(options.jalur);
    setSekolahList(options.sekolah);
    setPeriode(options.periode);
  } catch (error) {
    console.error('Gagal memuat opsi:', error.message);
  }
}
```

---

### Upload Document

```javascript
async function uploadDocument(file, docTypeId) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('id_jenis_dokumen', docTypeId);
    
    const response = await apiClient.postFormData('/dokumen/upload', formData);
    
    alert('Dokumen berhasil diupload!');
    return response;
  } catch (error) {
    if (error.status === 413) {
      alert('File terlalu besar (max 2MB)');
    } else {
      alert(`Upload gagal: ${error.message}`);
    }
  }
}
```

---

### Admin: Create Master Data

```javascript
async function createSchool(schoolData) {
  try {
    const response = await apiClient.post('/master/sekolah', schoolData);
    
    alert('Sekolah berhasil ditambahkan!');
    return response.data;
  } catch (error) {
    if (error.status === 403) {
      alert('Anda tidak memiliki izin untuk menambah sekolah');
    } else {
      alert(`Gagal: ${error.message}`);
    }
  }
}
```

---

### Admin: List All Registrations

```javascript
async function loadRegistrations(page = 1) {
  try {
    const response = await apiClient.get(`/pendaftaran/admin?page=${page}&limit=20`);
    
    setPendaftaranList(response);
  } catch (error) {
    console.error('Gagal memuat pendaftaran:', error);
  }
}
```

---

## Error Handling Best Practices

### 1. Display User-Friendly Messages

```javascript
try {
  await apiClient.post('/auth/register', formData);
} catch (error) {
  // Map error codes to user messages
  const messages = {
    400: 'Data tidak valid. Periksa kembali.',
    409: 'Email atau NISN sudah terdaftar.',
    429: 'Terlalu banyak percobaan. Coba lagi nanti.',
    500: 'Server bermasalah. Coba lagi nanti.'
  };
  
  alert(messages[error.status] || error.message);
}
```

---

### 2. Check Token Before API Call

```javascript
async function protectedAction() {
  const token = localStorage.getItem('ppdb_token');
  
  if (!token) {
    alert('Silakan login terlebih dahulu');
    window.location.href = '/';
    return;
  }
  
  // Token exists, safe to proceed
  await apiClient.post('/some-endpoint', {...});
}
```

---

### 3. Handle Rate Limiting

```javascript
try {
  await apiClient.post('/auth/login', credentials);
} catch (error) {
  if (error.status === 429) {
    alert('Terlalu banyak percobaan. Coba lagi dalam beberapa menit.');
    // Disable login button temporarily
    disableLoginButton(true);
    setTimeout(() => disableLoginButton(false), 900000); // 15 minutes
  }
}
```

---

## Integration with Components

### React Example

```javascript
import { useState, useEffect } from 'react';
import apiClient from '../services/httpClient';

export default function Dashboard() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const data = await apiClient.get('/pendaftaran/admin');
      setRegistrations(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {registrations.map(reg => (
        <div key={reg.id_pendaftaran}>{reg.nama_lengkap}</div>
      ))}
    </div>
  );
}
```

---

## Debugging

Enable detailed logging by checking browser DevTools console:

```javascript
// The httpClient logs all errors with ❌ prefix
// Example: "❌ API Error (401): { message: "Token tidak valid..." }"

// For development, you can also log requests:
const originalGet = apiClient.get;
apiClient.get = async (endpoint, options) => {
  console.log(`→ GET ${endpoint}`);
  const response = await originalGet(endpoint, options);
  console.log(`← GET ${endpoint}`, response);
  return response;
};
```

---

## Notes

- All API calls are asynchronous (return Promises)
- Always use try/catch for error handling
- The client handles all authentication internally
- File uploads use `multipart/form-data` automatically
- JSON responses are automatically parsed
- CORS errors will appear in browser console with origin mismatch details

