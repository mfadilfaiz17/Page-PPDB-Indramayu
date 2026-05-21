/**
 * Middleware: Check role-based permissions
 * Usage: router.post("/admin-action", requireAdmin, authorize("admin", "create"), handler)
 * 
 * Requires:
 * - requireAdmin middleware (JWT verification) to have set req.admin with id_role
 * - roles & permissions tables in database
 */

const db = require("../config/database");

/**
 * Authorize middleware factory
 * @param {string} resource - Resource name (e.g., 'admin', 'dokumen', 'hasil_seleksi')
 * @param {string} action - Action type (e.g., 'create', 'read', 'update', 'delete', 'verify', 'manage')
 * @returns {Function} Express middleware
 */
function authorize(resource, action) {
  return async (req, res, next) => {
    try {
      if (!req.admin || !req.admin.id_role) {
        return res.status(401).json({ message: "Admin tidak terautentikasi." });
      }

      const { id_role } = req.admin;

      // Check if role has permission for this resource:action
      const [rows] = await db.query(`
        SELECT rp.id_role
        FROM role_permissions rp
        JOIN permissions p ON rp.id_permission = p.id_permission
        WHERE rp.id_role = ? AND p.resource = ? AND p.action = ?
        LIMIT 1
      `, [id_role, resource, action]);

      if (rows.length === 0) {
        return res.status(403).json({
          message: `Anda tidak memiliki akses untuk ${action} ${resource}.`
        });
      }

      // Permission granted, continue
      next();
    } catch (err) {
      console.error("Authorize error:", err);
      res.status(500).json({ message: "Gagal memeriksa otorisasi." });
    }
  };
}

module.exports = { authorize };
