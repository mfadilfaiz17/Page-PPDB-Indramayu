const rateLimit = require("express-rate-limit");

// Rate limiting untuk auth routes
// 5 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting if JWT_SECRET undefined (development mode)
    return !process.env.JWT_SECRET;
  },
});

module.exports = { authLimiter };
