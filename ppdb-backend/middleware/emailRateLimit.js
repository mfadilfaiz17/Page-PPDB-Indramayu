/**
 * Email Rate Limiting Middleware
 * Mencegah spam email dengan membatasi frekuensi pengiriman per email address
 */

// In-memory storage untuk rate limiting (untuk production gunakan Redis)
const emailAttempts = new Map();

/**
 * Rate limiter untuk email verification resend
 * Limit: 1 email per 5 menit per email address
 */
function verificationEmailRateLimit(req, res, next) {
  const email = req.body.email?.toLowerCase().trim();
  
  if (!email) {
    return res.status(400).json({ error: "Email diperlukan" });
  }

  const now = Date.now();
  const key = `verify_${email}`;
  const attempt = emailAttempts.get(key);

  // Check if email was sent recently
  if (attempt && now - attempt.timestamp < 5 * 60 * 1000) {
    const remainingTime = Math.ceil((5 * 60 * 1000 - (now - attempt.timestamp)) / 1000);
    return res.status(429).json({
      error: "Terlalu banyak permintaan",
      message: `Silakan tunggu ${remainingTime} detik sebelum mengirim ulang email verifikasi`,
      retryAfter: remainingTime,
    });
  }

  // Record this attempt
  emailAttempts.set(key, {
    timestamp: now,
    count: (attempt?.count || 0) + 1,
  });

  // Clean up old entries (older than 1 hour)
  cleanupOldAttempts();

  next();
}

/**
 * Rate limiter untuk forgot password
 * Limit: 1 email per 10 menit per email address
 */
function forgotPasswordRateLimit(req, res, next) {
  const email = req.body.email?.toLowerCase().trim();
  
  if (!email) {
    return res.status(400).json({ error: "Email diperlukan" });
  }

  const now = Date.now();
  const key = `reset_${email}`;
  const attempt = emailAttempts.get(key);

  // Check if email was sent recently
  if (attempt && now - attempt.timestamp < 10 * 60 * 1000) {
    const remainingTime = Math.ceil((10 * 60 * 1000 - (now - attempt.timestamp)) / 1000);
    return res.status(429).json({
      error: "Terlalu banyak permintaan",
      message: `Silakan tunggu ${remainingTime} detik sebelum mengirim ulang email reset password`,
      retryAfter: remainingTime,
    });
  }

  // Record this attempt
  emailAttempts.set(key, {
    timestamp: now,
    count: (attempt?.count || 0) + 1,
  });

  // Clean up old entries
  cleanupOldAttempts();

  next();
}

/**
 * Rate limiter untuk general email (document status, announcement)
 * Limit: 5 email per menit per email address
 */
function generalEmailRateLimit(req, res, next) {
  const email = req.body.email?.toLowerCase().trim();
  
  if (!email) {
    return res.status(400).json({ error: "Email diperlukan" });
  }

  const now = Date.now();
  const key = `general_${email}`;
  const attempt = emailAttempts.get(key);

  // Check if exceeded rate limit (5 emails per minute)
  if (attempt && now - attempt.timestamp < 60 * 1000) {
    if (attempt.count >= 5) {
      const remainingTime = Math.ceil((60 * 1000 - (now - attempt.timestamp)) / 1000);
      return res.status(429).json({
        error: "Terlalu banyak permintaan",
        message: `Batas pengiriman email tercapai. Silakan tunggu ${remainingTime} detik`,
        retryAfter: remainingTime,
      });
    }
    
    // Increment count
    attempt.count++;
  } else {
    // Reset counter after 1 minute
    emailAttempts.set(key, {
      timestamp: now,
      count: 1,
    });
  }

  // Clean up old entries
  cleanupOldAttempts();

  next();
}

/**
 * Cleanup old rate limit entries (older than 1 hour)
 */
function cleanupOldAttempts() {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  for (const [key, attempt] of emailAttempts.entries()) {
    if (attempt.timestamp < oneHourAgo) {
      emailAttempts.delete(key);
    }
  }
}

/**
 * Get rate limit status for an email
 * @param {string} email - Email address
 * @param {string} type - Type of rate limit (verify, reset, general)
 */
function getRateLimitStatus(email, type = "general") {
  const key = `${type}_${email.toLowerCase().trim()}`;
  const attempt = emailAttempts.get(key);
  
  if (!attempt) {
    return { limited: false, remainingTime: 0 };
  }

  const now = Date.now();
  let timeLimit;
  let maxCount;

  switch (type) {
    case "verify":
      timeLimit = 5 * 60 * 1000; // 5 minutes
      maxCount = 1;
      break;
    case "reset":
      timeLimit = 10 * 60 * 1000; // 10 minutes
      maxCount = 1;
      break;
    case "general":
      timeLimit = 60 * 1000; // 1 minute
      maxCount = 5;
      break;
    default:
      timeLimit = 60 * 1000;
      maxCount = 5;
  }

  const timeSinceLastAttempt = now - attempt.timestamp;
  
  if (timeSinceLastAttempt < timeLimit && attempt.count >= maxCount) {
    return {
      limited: true,
      remainingTime: Math.ceil((timeLimit - timeSinceLastAttempt) / 1000),
    };
  }

  return { limited: false, remainingTime: 0 };
}

/**
 * Clear rate limit for specific email (admin override)
 * @param {string} email - Email address
 * @param {string} type - Type of rate limit to clear
 */
function clearRateLimit(email, type = null) {
  const emailLower = email.toLowerCase().trim();
  
  if (type) {
    const key = `${type}_${emailLower}`;
    emailAttempts.delete(key);
  } else {
    // Clear all types for this email
    const types = ["verify", "reset", "general"];
    types.forEach(t => {
      const key = `${t}_${emailLower}`;
      emailAttempts.delete(key);
    });
  }
}

module.exports = {
  verificationEmailRateLimit,
  forgotPasswordRateLimit,
  generalEmailRateLimit,
  getRateLimitStatus,
  clearRateLimit,
};
