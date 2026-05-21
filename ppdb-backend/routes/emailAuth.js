/**
 * Email Authentication Routes
 * Routes untuk email verification, password reset, dan resend email
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  isValidEmail,
  sanitizeEmail,
} = require('../services/emailService');
const {
  verificationEmailRateLimit,
  forgotPasswordRateLimit,
} = require('../middleware/emailRateLimit');
const {
  generateEmailToken,
  isTokenExpired,
  verifyToken,
} = require('../utils/tokenGenerator');

/**
 * POST /api/email-auth/resend-verification
 * Kirim ulang email verifikasi
 */
router.post('/resend-verification', verificationEmailRateLimit, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email diperlukan' });
    }

    const cleanEmail = sanitizeEmail(email);

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ error: 'Format email tidak valid' });
    }

    // Check if account exists
    const [accounts] = await db.query(
      'SELECT id_akun, nama_lengkap, is_email_verified FROM akun_ppdb WHERE email = ?',
      [cleanEmail]
    );

    if (accounts.length === 0) {
      return res.status(404).json({ error: 'Akun tidak ditemukan' });
    }

    const account = accounts[0];

    // Check if already verified
    if (account.is_email_verified) {
      return res.status(400).json({ error: 'Email sudah terverifikasi' });
    }

    // Delete old unused tokens
    await db.query(
      'DELETE FROM email_tokens WHERE id_akun = ? AND type = "VERIFY" AND is_used = FALSE',
      [account.id_akun]
    );

    // Generate new token
    const tokenData = generateEmailToken(account.id_akun, 'VERIFY');

    // Save token to database
    await db.query(
      'INSERT INTO email_tokens (id_token, id_akun, token, type, expires_at) VALUES (?, ?, ?, ?, ?)',
      [tokenData.id_token, tokenData.id_akun, tokenData.hashedToken, tokenData.type, tokenData.expiresAt]
    );

    // Send verification email
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${tokenData.token}`;
    const emailResult = await sendVerificationEmail(cleanEmail, account.nama_lengkap, verificationLink);

    if (!emailResult.success) {
      return res.status(500).json({ error: 'Gagal mengirim email', details: emailResult.error });
    }

    res.json({
      message: 'Email verifikasi telah dikirim',
      email: cleanEmail,
    });
  } catch (error) {
    console.error('Error resend verification:', error);
    next(error);
  }
});

/**
 * POST /api/email-auth/verify-email
 * Verifikasi email dengan token
 */
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token diperlukan' });
    }

    // Find token in database (check all tokens, we'll verify hash later)
    const [tokens] = await db.query(
      `SELECT et.*, a.email, a.nama_lengkap 
       FROM email_tokens et
       JOIN akun_ppdb a ON et.id_akun = a.id_akun
       WHERE et.type = "VERIFY" AND et.is_used = FALSE`,
      []
    );

    // Find matching token by verifying hash
    let matchedToken = null;
    for (const dbToken of tokens) {
      if (verifyToken(token, dbToken.token)) {
        matchedToken = dbToken;
        break;
      }
    }

    if (!matchedToken) {
      return res.status(400).json({ error: 'Token tidak valid atau sudah digunakan' });
    }

    // Check if token expired
    if (isTokenExpired(matchedToken.expires_at)) {
      return res.status(400).json({ error: 'Token sudah kadaluarsa', expired: true });
    }

    // Mark token as used
    await db.query('UPDATE email_tokens SET is_used = TRUE WHERE id_token = ?', [matchedToken.id_token]);

    // Update account as verified
    await db.query(
      'UPDATE akun_ppdb SET is_email_verified = TRUE, email_verified_at = NOW() WHERE id_akun = ?',
      [matchedToken.id_akun]
    );

    res.json({
      message: 'Email berhasil diverifikasi',
      email: matchedToken.email,
      nama: matchedToken.nama_lengkap,
    });
  } catch (error) {
    console.error('Error verify email:', error);
    next(error);
  }
});

/**
 * POST /api/email-auth/forgot-password
 * Request password reset
 */
router.post('/forgot-password', forgotPasswordRateLimit, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email diperlukan' });
    }

    const cleanEmail = sanitizeEmail(email);

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ error: 'Format email tidak valid' });
    }

    // Check if account exists
    const [accounts] = await db.query('SELECT id_akun, nama_lengkap FROM akun_ppdb WHERE email = ?', [cleanEmail]);

    // Always return success untuk security (prevent email enumeration)
    if (accounts.length === 0) {
      return res.json({
        message: 'Jika email terdaftar, link reset password akan dikirim',
      });
    }

    const account = accounts[0];

    // Delete old unused reset tokens
    await db.query(
      'DELETE FROM email_tokens WHERE id_akun = ? AND type = "RESET" AND is_used = FALSE',
      [account.id_akun]
    );

    // Generate reset token
    const tokenData = generateEmailToken(account.id_akun, 'RESET', '1h');

    // Save token to database
    await db.query(
      'INSERT INTO email_tokens (id_token, id_akun, token, type, expires_at) VALUES (?, ?, ?, ?, ?)',
      [tokenData.id_token, tokenData.id_akun, tokenData.hashedToken, tokenData.type, tokenData.expiresAt]
    );

    // Send reset email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${tokenData.token}`;
    const emailResult = await sendPasswordResetEmail(cleanEmail, resetLink);

    if (!emailResult.success) {
      console.error('Failed to send reset email:', emailResult.error);
      // Don't expose error to user
    }

    res.json({
      message: 'Jika email terdaftar, link reset password akan dikirim',
    });
  } catch (error) {
    console.error('Error forgot password:', error);
    next(error);
  }
});

/**
 * POST /api/email-auth/reset-password
 * Reset password dengan token
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token dan password baru diperlukan' });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password minimal 6 karakter' });
    }

    // Find token in database
    const [tokens] = await db.query(
      `SELECT et.*, a.email 
       FROM email_tokens et
       JOIN akun_ppdb a ON et.id_akun = a.id_akun
       WHERE et.type = "RESET" AND et.is_used = FALSE`,
      []
    );

    // Find matching token by verifying hash
    let matchedToken = null;
    for (const dbToken of tokens) {
      if (verifyToken(token, dbToken.token)) {
        matchedToken = dbToken;
        break;
      }
    }

    if (!matchedToken) {
      return res.status(400).json({ error: 'Token tidak valid atau sudah digunakan' });
    }

    // Check if token expired
    if (isTokenExpired(matchedToken.expires_at)) {
      return res.status(400).json({ error: 'Token sudah kadaluarsa', expired: true });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.query('UPDATE akun_ppdb SET password = ? WHERE id_akun = ?', [hashedPassword, matchedToken.id_akun]);

    // Mark token as used
    await db.query('UPDATE email_tokens SET is_used = TRUE WHERE id_token = ?', [matchedToken.id_token]);

    res.json({
      message: 'Password berhasil direset',
      email: matchedToken.email,
    });
  } catch (error) {
    console.error('Error reset password:', error);
    next(error);
  }
});

/**
 * GET /api/email-auth/check-token
 * Check if token is valid (untuk frontend validation)
 */
router.get('/check-token', async (req, res) => {
  try {
    const { token, type } = req.query;

    if (!token || !type) {
      return res.status(400).json({ error: 'Token dan type diperlukan' });
    }

    // Find token in database
    const [tokens] = await db.query(
      'SELECT * FROM email_tokens WHERE type = ? AND is_used = FALSE',
      [type.toUpperCase()]
    );

    // Find matching token
    let matchedToken = null;
    for (const dbToken of tokens) {
      if (verifyToken(token, dbToken.token)) {
        matchedToken = dbToken;
        break;
      }
    }

    if (!matchedToken) {
      return res.json({ valid: false, reason: 'Token tidak valid atau sudah digunakan' });
    }

    // Check if expired
    if (isTokenExpired(matchedToken.expires_at)) {
      return res.json({ valid: false, reason: 'Token sudah kadaluarsa', expired: true });
    }

    res.json({ valid: true });
  } catch (error) {
    console.error('Error check token:', error);
    next(error);
  }
});

module.exports = router;
