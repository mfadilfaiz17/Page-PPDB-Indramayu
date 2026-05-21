const jwt = require("jsonwebtoken");
require("dotenv").config();

// Admin middleware: verify JWT token
// Assumes admin login already issued JWT token via auth/admin-login
// Usage: router.get("/admin-only", requireAdmin, handler)

module.exports = function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  if (!token) {
    return res.status(401).json({ message: "Token admin tidak ditemukan." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if decoded has admin role/id_admin
    if (!decoded.id_admin) {
      return res.status(403).json({ message: "Token bukan admin." });
    }
    
    req.admin = decoded; // { id_admin, username, role }
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token admin tidak valid atau sudah expired." });
  }
};
