/**
 * Centralized Error Handler Middleware
 * Place this as the LAST middleware in server.js after all routes
 * 
 * Usage: app.use(errorHandler);
 */

const errorHandler = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  const path = req.path;
  const method = req.method;

  // Log error details for debugging
  console.error(`
❌ ERROR [${timestamp}]
   Path: ${method} ${path}
   Status: ${err.statusCode || err.status || 500}
   Message: ${err.message}
   ${err.details ? `Details: ${JSON.stringify(err.details)}` : ''}
  `);

  // Validation error (Zod)
  if (err.name === "ZodError" || err.details?.type === "validation") {
    return res.status(400).json({
      success: false,
      message: "Data tidak valid",
      errors: err.details?.errors || err.errors,
    });
  }

  // Database error
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      success: false,
      message: "Data sudah ada (duplicate entry)",
    });
  }

  if (err.code?.startsWith("ER_")) {
    return res.status(400).json({
      success: false,
      message: "Database error: " + (err.sqlMessage || err.message),
    });
  }

  // Authentication/Authorization error
  if (err.statusCode === 401 || err.name === "UnauthorizedError") {
    return res.status(401).json({
      success: false,
      message: err.message || "Authentikasi gagal",
    });
  }

  if (err.statusCode === 403 || err.name === "ForbiddenError") {
    return res.status(403).json({
      success: false,
      message: err.message || "Akses ditolak",
    });
  }

  // File upload error
  if (err.name === "MulterError") {
    if (err.code === "FILE_TOO_LARGE") {
      return res.status(413).json({
        success: false,
        message: "File terlalu besar (max 2MB)",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Terlalu banyak file",
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Generic error response
  const status = err.statusCode || err.status || 500;
  const isProduction = process.env.NODE_ENV === "production";

  res.status(status).json({
    success: false,
    message: err.message || "Terjadi kesalahan server",
    ...(isProduction === false && {
      // Include stack trace only in development
      stack: err.stack,
      code: err.code,
    }),
  });
};

module.exports = errorHandler;
