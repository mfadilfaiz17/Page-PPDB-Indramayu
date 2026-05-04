const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware ini dipasang di route yang butuh login
// Cara pakai: router.get("/dashboard", authMiddleware, handler)

module.exports = function authMiddleware(req, res, next) {
  // Ambil token dari header Authorization: Bearer <token>
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token tidak ditemukan. Silakan login." });
  }

  try {
    // Verifikasi token — kalau palsu atau expired akan throw error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.siswa = decoded; // { id_akun, id_siswa, email }
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token tidak valid atau sudah expired." });
  }
};
