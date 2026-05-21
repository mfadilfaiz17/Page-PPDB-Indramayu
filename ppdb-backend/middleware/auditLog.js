const { logAction, getClientIP } = require("../services/auditLogger");

/**
 * Middleware to log authentication attempts
 * Should be placed AFTER auth routes handle success/failure
 */

function auditAuthAttempt(user_type) {
  return (req, res, next) => {
    // Store original res.json to intercept responses
    const originalJson = res.json.bind(res);

    res.json = function(data) {
      // Log the attempt after response is sent
      const ip = getClientIP(req);
      const username = req.body?.email || req.body?.username || "unknown";
      const is_success = res.statusCode < 400;

      logAction({
        user_type,
        user_id: is_success ? (data?.siswa?.id_siswa || data?.admin?.id_admin) : null,
        username,
        action: "login_attempt",
        resource: "auth",
        method: req.method,
        path: req.path,
        ip_address: ip,
        status_code: res.statusCode,
        error_message: is_success ? null : data?.message,
      }).catch(err => console.error("Audit log error:", err));

      return originalJson(data);
    };

    next();
  };
}

module.exports = { auditAuthAttempt };
