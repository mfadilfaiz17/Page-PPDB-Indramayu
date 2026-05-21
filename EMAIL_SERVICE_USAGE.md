# Email Service - Panduan Penggunaan

## Overview
Email service untuk sistem PPDB Indramayu dengan fitur lengkap untuk verifikasi email, reset password, notifikasi hasil seleksi, dan update status dokumen.

## Features

### ✅ Fitur yang Sudah Diimplementasi

1. **Email Verification** - Kirim email verifikasi saat registrasi
2. **Password Reset** - Kirim link reset password
3. **Announcement Email** - Notifikasi hasil seleksi
4. **Document Status Email** - Update status dokumen
5. **Bulk Email Sending** - Kirim email massal dengan batching
6. **Retry Logic** - Otomatis retry jika gagal (max 3x)
7. **Email Logging** - Audit trail untuk semua email
8. **Rate Limiting** - Mencegah spam email
9. **Email Validation** - Validasi format email
10. **Test Email** - Untuk testing konfigurasi

---

## Setup & Configuration

### 1. Install Dependencies
```bash
npm install nodemailer
```

### 2. Environment Variables
Tambahkan ke file `.env`:

```env
# Gmail SMTP Configuration
GMAIL_USER=your_email@gmail.com
GMAIL_PASSWORD=your_app_specific_password

# Email Settings
EMAIL_FROM_NAME=PPDB Indramayu
FRONTEND_URL=http://localhost:5173
```

### 3. Generate Gmail App Password
1. Buka Google Account Settings
2. Security → 2-Step Verification (aktifkan jika belum)
3. App passwords → Generate new app password
4. Copy password dan masukkan ke `GMAIL_PASSWORD`

⚠️ **PENTING:** Jangan gunakan password Gmail biasa, harus App-specific password!

---

## Usage Examples

### Import Email Service
```javascript
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAnnouncementEmail,
  sendDocumentStatusEmail,
  sendBulkEmails,
  sendTestEmail,
  getEmailLogs,
  isValidEmail,
  sanitizeEmail,
} = require('./services/emailService');
```

### 1. Send Verification Email
```javascript
// Saat user register
const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

const result = await sendVerificationEmail(
  email,           // Email tujuan
  nama,            // Nama siswa
  verificationLink // Link verifikasi lengkap
);

if (result.success) {
  console.log('Email terkirim:', result.messageId);
} else {
  console.error('Gagal kirim email:', result.error);
}
```

### 2. Send Password Reset Email
```javascript
// Saat user forgot password
const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

const result = await sendPasswordResetEmail(
  email,     // Email tujuan
  resetLink  // Link reset password
);
```

### 3. Send Announcement Email
```javascript
// Saat admin mengumumkan hasil seleksi
const hasil = {
  status_hasil: 'Lulus',           // 'Lulus', 'Cadangan', 'Tidak Lulus'
  nama_sekolah: 'SMAN 1 Indramayu',
  nama_jalur: 'Zonasi',
  peringkat: 15,
  tanggal_pengumuman: new Date()
};

const result = await sendAnnouncementEmail(
  email,  // Email siswa
  nama,   // Nama siswa
  hasil   // Object hasil seleksi
);
```

### 4. Send Document Status Email
```javascript
// Saat admin update status dokumen
const dokumenStatus = {
  nama_dokumen: 'Kartu Keluarga',
  status: 'DITERIMA',              // 'TERUPLOAD', 'PROSES', 'DITERIMA', 'DITOLAK'
  feedback: 'Dokumen valid'        // Optional, untuk komentar admin
};

const result = await sendDocumentStatusEmail(
  email,          // Email siswa
  nama,           // Nama siswa
  dokumenStatus   // Object status dokumen
);
```

### 5. Send Bulk Emails (Announcement Massal)
```javascript
// Kirim email ke banyak siswa sekaligus
const recipients = [
  { email: 'siswa1@email.com', nama: 'Siswa 1', hasil: {...} },
  { email: 'siswa2@email.com', nama: 'Siswa 2', hasil: {...} },
  // ... dst
];

const results = await sendBulkEmails(recipients, async (recipient) => {
  return await sendAnnouncementEmail(
    recipient.email,
    recipient.nama,
    recipient.hasil
  );
});

console.log(`Berhasil: ${results.success}, Gagal: ${results.failed}`);
console.log('Errors:', results.errors);
```

### 6. Send Test Email
```javascript
// Untuk testing konfigurasi email
const result = await sendTestEmail('test@example.com');
```

### 7. Email Validation
```javascript
// Validasi format email
if (!isValidEmail(email)) {
  return res.status(400).json({ error: 'Format email tidak valid' });
}

// Sanitize email (lowercase, trim)
const cleanEmail = sanitizeEmail(email);
```

### 8. Get Email Logs
```javascript
// Ambil log email untuk monitoring
const logs = getEmailLogs(50); // Last 50 logs

logs.forEach(log => {
  console.log(`[${log.timestamp}] ${log.type} to ${log.to}: ${log.success ? 'SUCCESS' : 'FAILED'}`);
});
```

---

## Rate Limiting

### Import Rate Limiter
```javascript
const {
  verificationEmailRateLimit,
  forgotPasswordRateLimit,
  generalEmailRateLimit,
  getRateLimitStatus,
  clearRateLimit,
} = require('./middleware/emailRateLimit');
```

### Apply to Routes
```javascript
// Verification email resend - 1 per 5 minutes
router.post('/resend-verification', verificationEmailRateLimit, async (req, res) => {
  // ... send verification email
});

// Forgot password - 1 per 10 minutes
router.post('/forgot-password', forgotPasswordRateLimit, async (req, res) => {
  // ... send reset password email
});

// General emails - 5 per minute
router.post('/send-notification', generalEmailRateLimit, async (req, res) => {
  // ... send notification email
});
```

### Check Rate Limit Status
```javascript
const status = getRateLimitStatus('user@email.com', 'verify');

if (status.limited) {
  console.log(`Rate limited. Retry after ${status.remainingTime} seconds`);
}
```

### Clear Rate Limit (Admin Override)
```javascript
// Clear specific type
clearRateLimit('user@email.com', 'verify');

// Clear all types
clearRateLimit('user@email.com');
```

---

## Error Handling

### Retry Logic
Email service otomatis retry hingga 3x jika gagal:
- Attempt 1: Immediate
- Attempt 2: After 2 seconds
- Attempt 3: After 4 seconds

### Handle Errors
```javascript
const result = await sendVerificationEmail(email, nama, link);

if (!result.success) {
  // Log error
  console.error('Email failed:', result.error);
  
  // Notify user
  return res.status(500).json({
    error: 'Gagal mengirim email',
    message: 'Silakan coba lagi nanti atau hubungi admin'
  });
}
```

---

## Best Practices

### 1. Always Validate Email
```javascript
const email = sanitizeEmail(req.body.email);

if (!isValidEmail(email)) {
  return res.status(400).json({ error: 'Email tidak valid' });
}
```

### 2. Use Environment Variables
```javascript
// ❌ BAD
const link = `http://localhost:5173/verify?token=${token}`;

// ✅ GOOD
const link = `${process.env.FRONTEND_URL}/verify?token=${token}`;
```

### 3. Handle Async Properly
```javascript
// ❌ BAD - Blocking
const result = await sendVerificationEmail(...);
res.json({ message: 'Email sent' });

// ✅ GOOD - Non-blocking untuk non-critical emails
sendDocumentStatusEmail(...).catch(err => console.error(err));
res.json({ message: 'Status updated' });
```

### 4. Log All Email Activities
```javascript
// Email service sudah otomatis log
// Untuk production, simpan logs ke database

const logs = getEmailLogs();
// Save to database for audit trail
```

### 5. Use Bulk Sending for Mass Emails
```javascript
// ❌ BAD - Sequential
for (const siswa of siswaList) {
  await sendAnnouncementEmail(siswa.email, siswa.nama, siswa.hasil);
}

// ✅ GOOD - Batched
await sendBulkEmails(siswaList, async (siswa) => {
  return await sendAnnouncementEmail(siswa.email, siswa.nama, siswa.hasil);
});
```

---

## Monitoring & Debugging

### Check Email Service Status
```javascript
// Email service otomatis verify connection saat startup
// Check console untuk:
// ✅ Email service siap
// atau
// ❌ Email service error: [error message]
```

### Monitor Email Logs
```javascript
// Get recent logs
const logs = getEmailLogs(100);

// Filter by type
const verificationLogs = logs.filter(log => log.type === 'verification');

// Count success/failure
const successCount = logs.filter(log => log.success).length;
const failureCount = logs.filter(log => !log.success).length;

console.log(`Success: ${successCount}, Failed: ${failureCount}`);
```

### Test Email Configuration
```javascript
// Send test email untuk verify setup
const result = await sendTestEmail('admin@example.com');

if (result.success) {
  console.log('✅ Email configuration is working!');
} else {
  console.error('❌ Email configuration error:', result.error);
}
```

---

## Troubleshooting

### Problem: Email tidak terkirim
**Solution:**
1. Check `.env` file - pastikan `GMAIL_USER` dan `GMAIL_PASSWORD` benar
2. Pastikan menggunakan App-specific password, bukan password Gmail biasa
3. Check console untuk error message
4. Test dengan `sendTestEmail()`

### Problem: "Invalid login" error
**Solution:**
1. Generate new App-specific password di Google Account
2. Enable 2-Step Verification di Google Account
3. Update `GMAIL_PASSWORD` di `.env`

### Problem: Rate limit error
**Solution:**
1. Check rate limit status: `getRateLimitStatus(email, type)`
2. Wait for cooldown period
3. Admin dapat clear rate limit: `clearRateLimit(email)`

### Problem: Email masuk spam
**Solution:**
1. Gunakan domain email yang verified
2. Setup SPF, DKIM, DMARC records (untuk production)
3. Avoid spam trigger words di subject/body
4. Maintain good sender reputation

---

## Production Considerations

### 1. Use Email Queue (Recommended)
Untuk production dengan traffic tinggi, gunakan job queue:
```bash
npm install bull redis
```

### 2. Database Logging
Simpan email logs ke database untuk audit trail:
```sql
CREATE TABLE email_logs (
  id_log VARCHAR(6) PRIMARY KEY,
  type VARCHAR(50),
  recipient VARCHAR(255),
  subject VARCHAR(255),
  success BOOLEAN,
  error TEXT,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Use Professional Email Service
Untuk production, pertimbangkan:
- SendGrid
- AWS SES
- Mailgun
- Postmark

### 4. Monitor Email Metrics
Track:
- Delivery rate
- Open rate (jika ada tracking)
- Bounce rate
- Spam complaints

---

## API Endpoints (Recommended)

### Create these routes in your backend:

```javascript
// Auth routes
POST /api/auth/register              → Send verification email
POST /api/auth/verify-email          → Verify token
POST /api/auth/resend-verification   → Resend verification (rate limited)
POST /api/auth/forgot-password       → Send reset email (rate limited)
POST /api/auth/reset-password        → Reset password with token

// Notification routes (Admin only)
POST /api/notifications/announce-results     → Bulk send announcement
POST /api/notifications/document-status      → Send document status update
GET  /api/notifications/email-logs           → Get email logs (admin)
POST /api/notifications/test-email           → Send test email (admin)
```

---

## Security Notes

1. **Never expose email credentials** - Use environment variables
2. **Use App-specific passwords** - Not main Gmail password
3. **Implement rate limiting** - Prevent spam/abuse
4. **Validate email addresses** - Prevent injection attacks
5. **Log all activities** - For audit trail
6. **Use HTTPS** - For email links (verification, reset)
7. **Token expiration** - Verification (24h), Reset (1h)
8. **One-time tokens** - Mark as used after verification

---

## Support

Jika ada masalah atau pertanyaan:
1. Check console logs untuk error messages
2. Test dengan `sendTestEmail()`
3. Review email logs dengan `getEmailLogs()`
4. Check Gmail account settings & App passwords
5. Verify environment variables

---

**Last Updated:** May 2026  
**Version:** 1.0.0  
**Status:** Production Ready ✅
