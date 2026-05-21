const db = require("../config/database");

/**
 * Audit logging service
 * Tracks all admin and student actions for compliance & transparency
 */

async function ensureAuditTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_type VARCHAR(20),
        user_id VARCHAR(50),
        username VARCHAR(100),
        action VARCHAR(100),
        resource VARCHAR(100),
        method VARCHAR(10),
        path VARCHAR(255),
        old_value LONGTEXT,
        new_value LONGTEXT,
        ip_address VARCHAR(45),
        status_code INT,
        error_message TEXT,
        INDEX idx_timestamp (timestamp),
        INDEX idx_user_id (user_id),
        INDEX idx_action (action)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  } catch (err) {
    console.error("Error creating audit_logs table:", err);
  }
}

async function logAction(logData) {
  try {
    await ensureAuditTable();
    
    const {
      user_type,    // "admin" or "student"
      user_id,      // id_admin or id_siswa
      username,     // username or email
      action,       // e.g. "login", "verify_dokumen", "input_hasil_seleksi"
      resource,     // e.g. "pendaftaran", "dokumen", "hasil_seleksi"
      method,       // HTTP method
      path,         // request path
      old_value,    // previous value (for updates)
      new_value,    // new value (for updates)
      ip_address,
      status_code,
      error_message,
    } = logData;

    await db.query(
      `INSERT INTO audit_logs (
        user_type, user_id, username, action, resource, 
        method, path, old_value, new_value, 
        ip_address, status_code, error_message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_type,
        user_id,
        username,
        action,
        resource,
        method,
        path,
        old_value ? JSON.stringify(old_value) : null,
        new_value ? JSON.stringify(new_value) : null,
        ip_address,
        status_code,
        error_message,
      ]
    );
  } catch (err) {
    console.error("Error logging action:", err);
  }
}

/**
 * Middleware to extract client IP from request
 */
function getClientIP(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.connection.remoteAddress ||
    req.ip ||
    "unknown"
  );
}

module.exports = { logAction, ensureAuditTable, getClientIP };
