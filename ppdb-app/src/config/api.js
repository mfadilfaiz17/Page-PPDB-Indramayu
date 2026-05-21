/**
 * API Configuration
 * Centralized API base URL configuration
 */

// Get API URL from environment variable with fallback
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// App configuration
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'PPDB Indramayu';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  ADMIN_LOGIN: `${API_BASE_URL}/auth/admin-login`,
  
  // Email Auth
  RESEND_VERIFICATION: `${API_BASE_URL}/email-auth/resend-verification`,
  VERIFY_EMAIL: `${API_BASE_URL}/email-auth/verify-email`,
  FORGOT_PASSWORD: `${API_BASE_URL}/email-auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/email-auth/reset-password`,
  CHECK_TOKEN: `${API_BASE_URL}/email-auth/check-token`,
  
  // Dashboard
  DASHBOARD: `${API_BASE_URL}/dashboard`,
  
  // Pendaftaran
  PENDAFTARAN: `${API_BASE_URL}/pendaftaran`,
  PENDAFTARAN_OPSI: `${API_BASE_URL}/pendaftaran/opsi`,
  
  // Master
  MASTER_SEKOLAH: `${API_BASE_URL}/master/sekolah`,
  MASTER_JALUR: `${API_BASE_URL}/master/jalur`,
  
  // Dokumen
  DOKUMEN: `${API_BASE_URL}/dokumen`,
  DOKUMEN_UPLOAD: `${API_BASE_URL}/dokumen/upload`,
  
  // Hasil Seleksi
  HASIL_SELEKSI: `${API_BASE_URL}/hasil-seleksi`,
};

export default {
  API_BASE_URL,
  APP_NAME,
  APP_VERSION,
  API_ENDPOINTS,
};
