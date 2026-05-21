/**
 * Token Generator Utilities
 * Generate secure tokens untuk email verification dan password reset
 */

const crypto = require('crypto');

/**
 * Generate random ID dengan format custom
 * @param {string} prefix - Prefix untuk ID (e.g., 'ET' untuk Email Token)
 * @param {number} length - Panjang random part (default 4)
 * @returns {string} - ID dengan format PREFIX + random numbers
 */
function generateId(prefix = 'ET', length = 4) {
  const randomNum = Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, '0');
  return `${prefix}${randomNum}`;
}

/**
 * Generate secure random token untuk email verification/reset
 * @param {number} bytes - Jumlah bytes (default 32)
 * @returns {string} - Hex string token
 */
function generateSecureToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Generate URL-safe token
 * @param {number} bytes - Jumlah bytes (default 32)
 * @returns {string} - Base64 URL-safe token
 */
function generateUrlSafeToken(bytes = 32) {
  return crypto
    .randomBytes(bytes)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Hash token untuk disimpan di database
 * @param {string} token - Token yang akan di-hash
 * @returns {string} - Hashed token
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generate token expiration time
 * @param {string} duration - Duration string (e.g., '24h', '1h', '30m')
 * @returns {Date} - Expiration date
 */
function generateExpirationTime(duration = '24h') {
  const now = new Date();
  const match = duration.match(/^(\d+)([hmd])$/);

  if (!match) {
    throw new Error('Invalid duration format. Use format like "24h", "1h", "30m"');
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 'h': // hours
      now.setHours(now.getHours() + value);
      break;
    case 'm': // minutes
      now.setMinutes(now.getMinutes() + value);
      break;
    case 'd': // days
      now.setDate(now.getDate() + value);
      break;
    default:
      throw new Error('Invalid duration unit. Use h (hours), m (minutes), or d (days)');
  }

  return now;
}

/**
 * Check if token is expired
 * @param {Date} expiresAt - Expiration date
 * @returns {boolean} - True if expired
 */
function isTokenExpired(expiresAt) {
  return new Date() > new Date(expiresAt);
}

/**
 * Generate complete email token object
 * @param {string} idAkun - ID akun
 * @param {string} type - Token type ('VERIFY' or 'RESET')
 * @param {string} duration - Duration string (default '24h' for verify, '1h' for reset)
 * @returns {Object} - Token object with id, token, hashedToken, expiresAt
 */
function generateEmailToken(idAkun, type = 'VERIFY', duration = null) {
  // Set default duration based on type
  if (!duration) {
    duration = type === 'VERIFY' ? '24h' : '1h';
  }

  const id = generateId('ET');
  const token = generateSecureToken();
  const hashedToken = hashToken(token);
  const expiresAt = generateExpirationTime(duration);

  return {
    id_token: id,
    id_akun: idAkun,
    token: token,           // Plain token (kirim ke email)
    hashedToken: hashedToken, // Hashed token (simpan di DB)
    type: type,
    expiresAt: expiresAt,
  };
}

/**
 * Generate numeric OTP code
 * @param {number} length - Length of OTP (default 6)
 * @returns {string} - Numeric OTP
 */
function generateOTP(length = 6) {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, digits.length);
    otp += digits[randomIndex];
  }
  
  return otp;
}

/**
 * Verify token matches hashed token
 * @param {string} token - Plain token
 * @param {string} hashedToken - Hashed token from database
 * @returns {boolean} - True if match
 */
function verifyToken(token, hashedToken) {
  const hash = hashToken(token);
  return hash === hashedToken;
}

module.exports = {
  generateId,
  generateSecureToken,
  generateUrlSafeToken,
  hashToken,
  generateExpirationTime,
  isTokenExpired,
  generateEmailToken,
  generateOTP,
  verifyToken,
};
