const nodemailer = require("nodemailer");
require("dotenv").config();

// Konfigurasi transporter Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD, // App-specific password, bukan password Gmail biasa
  },
  pool: true, // Use pooled connections
  maxConnections: 5, // Max concurrent connections
  maxMessages: 100, // Max messages per connection
  rateDelta: 1000, // Rate limiting: 1 second
  rateLimit: 5, // Max 5 emails per rateDelta
});

// Test koneksi
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ Email service error:", err.message);
  } else if (success) {
    console.log("✅ Email service siap");
  }
});

// Email log storage (in-memory, untuk production gunakan database)
const emailLogs = [];

/**
 * Log email activity untuk audit trail
 * @param {string} type - Tipe email (verification, reset, announcement, document)
 * @param {string} to - Email tujuan
 * @param {boolean} success - Status pengiriman
 * @param {string} error - Error message jika gagal
 */
function logEmail(type, to, success, error = null) {
  const log = {
    timestamp: new Date().toISOString(),
    type,
    to,
    success,
    error,
  };
  emailLogs.push(log);
  
  // Keep only last 1000 logs in memory
  if (emailLogs.length > 1000) {
    emailLogs.shift();
  }
  
  // Log to console
  if (success) {
    console.log(`✅ [${type}] Email sent to ${to}`);
  } else {
    console.error(`❌ [${type}] Failed to send email to ${to}: ${error}`);
  }
}

/**
 * Retry logic untuk pengiriman email
 * @param {Function} sendFunction - Fungsi pengiriman email
 * @param {number} maxRetries - Maksimal retry (default 3)
 * @param {number} delay - Delay antar retry dalam ms (default 2000)
 */
async function retryEmail(sendFunction, maxRetries = 3, delay = 2000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await sendFunction();
      return result;
    } catch (error) {
      console.warn(`⚠️ Email attempt ${attempt}/${maxRetries} failed: ${error.message}`);
      
      if (attempt === maxRetries) {
        throw error; // Throw error on last attempt
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
}

/**
 * Get email logs (untuk debugging/monitoring)
 * @param {number} limit - Jumlah log yang diambil
 */
function getEmailLogs(limit = 100) {
  return emailLogs.slice(-limit).reverse();
}

/**
 * Kirim email verifikasi
 * @param {string} email - Email tujuan
 * @param {string} nama - Nama penerima
 * @param {string} verificationLink - Link verifikasi lengkap
 */
async function sendVerificationEmail(email, nama, verificationLink) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0d2240 0%, #1e4d8c 100%); color: white; padding: 20px; border-radius: 5px; text-align: center; }
        .content { padding: 20px; background: #f8fafd; border: 1px solid #dde6f4; border-radius: 5px; margin: 20px 0; }
        .button { display: inline-block; background: #0d2240; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { font-size: 12px; color: #7a8fa8; text-align: center; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verifikasi Email PPDB Indramayu</h1>
        </div>
        <div class="content">
          <p>Halo ${nama},</p>
          <p>Terima kasih telah mendaftar di PPDB Online Indramayu 2025/2026!</p>
          <p>Untuk menyelesaikan pendaftaran Anda, silakan verifikasi email dengan klik tombol di bawah:</p>
          <center>
            <a href="${verificationLink}" class="button">Verifikasi Email Saya</a>
          </center>
          <p><strong>Atau copy-paste link ini ke browser:</strong></p>
          <p style="word-break: break-all;">${verificationLink}</p>
          <p style="font-size: 12px; color: #7a8fa8;">Link ini berlaku selama 24 jam.</p>
          <p style="font-size: 12px; color: #7a8fa8;">Jika Anda tidak melakukan pendaftaran, abaikan email ini.</p>
        </div>
        <div class="footer">
          <p>© 2025 PPDB Indramayu | Tahun Ajaran 2025/2026</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const result = await retryEmail(async () => {
      return await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || "PPDB Indramayu"}" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "Verifikasi Email - PPDB Indramayu 2025/2026",
        html: htmlContent,
      });
    });
    
    logEmail("verification", email, true);
    return { success: true, messageId: result.messageId };
  } catch (err) {
    logEmail("verification", email, false, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Kirim email reset password
 * @param {string} email - Email tujuan
 * @param {string} resetLink - Link reset password lengkap
 */
async function sendPasswordResetEmail(email, resetLink) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0d2240 0%, #1e4d8c 100%); color: white; padding: 20px; border-radius: 5px; text-align: center; }
        .content { padding: 20px; background: #f8fafd; border: 1px solid #dde6f4; border-radius: 5px; margin: 20px 0; }
        .button { display: inline-block; background: #0d2240; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { font-size: 12px; color: #7a8fa8; text-align: center; margin-top: 20px; }
        .warning { background: #fffbeb; border: 1px solid #fde68a; padding: 10px; border-radius: 5px; color: #92400e; font-size: 12px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reset Password PPDB Indramayu</h1>
        </div>
        <div class="content">
          <p>Kami menerima permintaan untuk mereset password akun Anda.</p>
          <p>Silakan klik tombol di bawah untuk membuat password baru:</p>
          <center>
            <a href="${resetLink}" class="button">Reset Password</a>
          </center>
          <p><strong>Atau copy-paste link ini ke browser:</strong></p>
          <p style="word-break: break-all;">${resetLink}</p>
          <div class="warning">
            ⚠️ <strong>Penting:</strong> Link ini hanya berlaku selama 1 jam. Setelah itu, Anda perlu membuat permintaan reset password baru.
          </div>
          <p style="font-size: 12px; color: #7a8fa8;">Jika Anda tidak meminta reset password, abaikan email ini atau hubungi kami.</p>
        </div>
        <div class="footer">
          <p>© 2025 PPDB Indramayu | Tahun Ajaran 2025/2026</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const result = await retryEmail(async () => {
      return await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || "PPDB Indramayu"}" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "Reset Password - PPDB Indramayu",
        html: htmlContent,
      });
    });
    
    logEmail("reset", email, true);
    return { success: true, messageId: result.messageId };
  } catch (err) {
    logEmail("reset", email, false, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Kirim email pengumuman hasil seleksi
 * @param {string} email - Email tujuan
 * @param {string} nama - Nama siswa
 * @param {Object} hasil - Object hasil seleksi
 */
async function sendAnnouncementEmail(email, nama, hasil) {
  const statusBadge = {
    Lulus: { color: "#1a9e5a", text: "✅ LULUS" },
    Cadangan: { color: "#f59e0b", text: "⏳ CADANGAN" },
    "Tidak Lulus": { color: "#dc2626", text: "❌ TIDAK LULUS" },
  };

  const badge = statusBadge[hasil.status_hasil] || statusBadge["Tidak Lulus"];

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0d2240 0%, #1e4d8c 100%); color: white; padding: 20px; border-radius: 5px; text-align: center; }
        .content { padding: 20px; background: #f8fafd; border: 1px solid #dde6f4; border-radius: 5px; margin: 20px 0; }
        .result-box { border: 2px solid ${badge.color}; padding: 15px; border-radius: 5px; margin: 20px 0; background: rgba(0,0,0,0.02); }
        .result-status { font-size: 24px; font-weight: bold; color: ${badge.color}; text-align: center; margin: 10px 0; }
        .result-info { margin: 10px 0; }
        .result-label { font-weight: bold; color: #0d2240; }
        .button { display: inline-block; background: #0d2240; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px auto; text-align: center; }
        .footer { font-size: 12px; color: #7a8fa8; text-align: center; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Pengumuman Hasil Seleksi PPDB Indramayu</h1>
        </div>
        <div class="content">
          <p>Halo ${nama},</p>
          <p>Hasil seleksi PPDB Indramayu Tahun Ajaran 2025/2026 telah diumumkan!</p>

          <div class="result-box">
            <div class="result-status">${badge.text}</div>
            <div class="result-info">
              <p><span class="result-label">Sekolah Tujuan:</span> ${hasil.nama_sekolah}</p>
              <p><span class="result-label">Jalur Pendaftaran:</span> ${hasil.nama_jalur}</p>
              <p><span class="result-label">Peringkat:</span> ${hasil.peringkat}</p>
              <p><span class="result-label">Tanggal Pengumuman:</span> ${new Date(hasil.tanggal_pengumuman).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
          </div>

          <p>Silakan login ke portal PPDB untuk melihat detail lengkap hasil seleksi Anda:</p>
          <center>
            <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/dashboard" class="button">Lihat Dashboard</a>
          </center>

          <p style="font-size: 12px; color: #7a8fa8; margin-top: 20px;">
            Jika Anda memiliki pertanyaan atau keberatan atas hasil ini, silakan hubungi panitia PPDB.
          </p>
        </div>
        <div class="footer">
          <p>© 2025 PPDB Indramayu | Tahun Ajaran 2025/2026</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const result = await retryEmail(async () => {
      return await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || "PPDB Indramayu"}" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: `Pengumuman Hasil Seleksi - PPDB Indramayu (${hasil.status_hasil})`,
        html: htmlContent,
      });
    });
    
    logEmail("announcement", email, true);
    return { success: true, messageId: result.messageId };
  } catch (err) {
    logEmail("announcement", email, false, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Kirim email notifikasi status dokumen
 * @param {string} email - Email tujuan
 * @param {string} nama - Nama siswa
 * @param {Object} dokumenStatus - Object status dokumen
 */
async function sendDocumentStatusEmail(email, nama, dokumenStatus) {
  const statusColor = {
    TERUPLOAD: "#3b82f6",
    PROSES: "#f59e0b",
    DITERIMA: "#1a9e5a",
    DITOLAK: "#dc2626",
  };

  const statusText = {
    TERUPLOAD: "✓ Sudah diunggah",
    PROSES: "⏳ Sedang diproses",
    DITERIMA: "✅ Diterima",
    DITOLAK: "❌ Ditolak",
  };

  const color = statusColor[dokumenStatus.status] || "#7a8fa8";
  const text = statusText[dokumenStatus.status] || "Tidak diketahui";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0d2240 0%, #1e4d8c 100%); color: white; padding: 20px; border-radius: 5px; text-align: center; }
        .content { padding: 20px; background: #f8fafd; border: 1px solid #dde6f4; border-radius: 5px; margin: 20px 0; }
        .status-box { border-left: 4px solid ${color}; padding: 15px; background: rgba(0,0,0,0.02); margin: 20px 0; }
        .status-label { font-weight: bold; color: ${color}; font-size: 16px; }
        .button { display: inline-block; background: #0d2240; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px auto; text-align: center; }
        .footer { font-size: 12px; color: #7a8fa8; text-align: center; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Update Status Dokumen PPDB</h1>
        </div>
        <div class="content">
          <p>Halo ${nama},</p>
          <p>Status dokumen Anda telah diupdate:</p>

          <div class="status-box">
            <p><strong>Dokumen:</strong> ${dokumenStatus.nama_dokumen}</p>
            <p><span class="status-label">${text}</span></p>
            ${dokumenStatus.feedback ? `<p><strong>Catatan:</strong> ${dokumenStatus.feedback}</p>` : ""}
          </div>

          <p>Silakan login ke portal untuk melihat status lengkap semua dokumen Anda:</p>
          <center>
            <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/dashboard" class="button">Lihat Status Dokumen</a>
          </center>

          <p style="font-size: 12px; color: #7a8fa8; margin-top: 20px;">
            Jika Anda memiliki pertanyaan, silakan hubungi panitia PPDB.
          </p>
        </div>
        <div class="footer">
          <p>© 2025 PPDB Indramayu | Tahun Ajaran 2025/2026</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const result = await retryEmail(async () => {
      return await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || "PPDB Indramayu"}" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: `Update Status Dokumen - ${dokumenStatus.nama_dokumen}`,
        html: htmlContent,
      });
    });
    
    logEmail("document", email, true);
    return { success: true, messageId: result.messageId };
  } catch (err) {
    logEmail("document", email, false, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Kirim email secara bulk (untuk announcement massal)
 * @param {Array} recipients - Array of {email, nama, hasil}
 * @param {Function} emailFunction - Fungsi email yang akan digunakan
 * @returns {Object} - Summary hasil pengiriman
 */
async function sendBulkEmails(recipients, emailFunction) {
  const results = {
    total: recipients.length,
    success: 0,
    failed: 0,
    errors: [],
  };

  console.log(`📧 Memulai bulk email ke ${recipients.length} penerima...`);

  // Process in batches to avoid overwhelming the server
  const batchSize = 10;
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    
    // Send batch concurrently
    const promises = batch.map(async (recipient) => {
      try {
        const result = await emailFunction(recipient);
        if (result.success) {
          results.success++;
        } else {
          results.failed++;
          results.errors.push({ email: recipient.email, error: result.error });
        }
      } catch (error) {
        results.failed++;
        results.errors.push({ email: recipient.email, error: error.message });
      }
    });

    await Promise.all(promises);
    
    // Small delay between batches to respect rate limits
    if (i + batchSize < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log(`✅ Bulk email selesai: ${results.success} berhasil, ${results.failed} gagal`);
  return results;
}

/**
 * Kirim test email (untuk debugging)
 * @param {string} email - Email tujuan
 */
async function sendTestEmail(email) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0d2240 0%, #1e4d8c 100%); color: white; padding: 20px; border-radius: 5px; text-align: center; }
        .content { padding: 20px; background: #f8fafd; border: 1px solid #dde6f4; border-radius: 5px; margin: 20px 0; }
        .footer { font-size: 12px; color: #7a8fa8; text-align: center; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Test Email - PPDB Indramayu</h1>
        </div>
        <div class="content">
          <p>Ini adalah test email dari sistem PPDB Indramayu.</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString("id-ID")}</p>
          <p>Jika Anda menerima email ini, berarti konfigurasi email service sudah bekerja dengan baik! ✅</p>
        </div>
        <div class="footer">
          <p>© 2025 PPDB Indramayu | Email Service Test</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const result = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || "PPDB Indramayu"}" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Test Email - PPDB Indramayu",
      html: htmlContent,
    });
    
    logEmail("test", email, true);
    console.log("✅ Test email berhasil dikirim ke", email);
    return { success: true, messageId: result.messageId };
  } catch (err) {
    logEmail("test", email, false, err.message);
    console.error("❌ Gagal kirim test email:", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Validasi email format
 * @param {string} email - Email yang akan divalidasi
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize email address (lowercase, trim)
 * @param {string} email - Email yang akan disanitize
 */
function sanitizeEmail(email) {
  return email.toLowerCase().trim();
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAnnouncementEmail,
  sendDocumentStatusEmail,
  sendBulkEmails,
  sendTestEmail,
  getEmailLogs,
  isValidEmail,
  sanitizeEmail,
};
