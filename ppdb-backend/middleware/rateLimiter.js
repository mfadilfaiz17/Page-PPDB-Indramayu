/**
 * Rate Limiting Middleware
 * Mencegah brute force attacks pada auth endpoints
 */

const rateLimit = require('express-rate-limit');

/**
 * Rate limiter untuk login endpoints
 * Limit: 5 attempts per 15 minutes per IP
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 requests per windowMs
  message: {
    error: 'Terlalu banyak percobaan login',
    message: 'Silakan coba lagi setelah 15 menit',
    retryAfter: 15 * 60, // seconds
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  // Skip successful requests
  skipSuccessfulRequests: false,
  // Skip failed requests (optional - set to true to only count successful logins)
  skipFailedRequests: false,
});

// Alias for backward compatibility
const authLimiter = loginLimiter;

/**
 * Rate limiter untuk register endpoints
 * Limit: 3 attempts per hour per IP
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Max 3 registrations per hour
  message: {
    error: 'Terlalu banyak percobaan registrasi',
    message: 'Silakan coba lagi setelah 1 jam',
    retryAfter: 60 * 60, // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter untuk general API endpoints
 * Limit: 100 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per windowMs
  message: {
    error: 'Terlalu banyak permintaan',
    message: 'Silakan coba lagi nanti',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter untuk sensitive operations
 * Limit: 10 requests per 15 minutes per IP
 */
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    error: 'Terlalu banyak permintaan',
    message: 'Operasi ini dibatasi. Silakan coba lagi setelah 15 menit',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  loginLimiter,
  authLimiter, // Alias for loginLimiter
  registerLimiter,
  apiLimiter,
  strictLimiter,
};
