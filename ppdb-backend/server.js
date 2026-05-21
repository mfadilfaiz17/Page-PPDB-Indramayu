const express    = require("express");
const cors       = require("cors");
const helmet     = require("helmet");
const path       = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const { initializeRBAC } = require("./services/rbacService");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// ─────────────────────────────────────────────
//  SECURITY MIDDLEWARE
// ─────────────────────────────────────────────

// Add security headers (CSP, XFO, HSTS, etc)
app.use(helmet());

// ─────────────────────────────────────────────
//  MIDDLEWARE GLOBAL
// ─────────────────────────────────────────────

// Izinkan request dari React — configurable via .env
const CORS_ORIGIN = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));

// Parse JSON body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sajikan folder uploads sebagai file statis
// Akses: http://localhost:5000/uploads/namafile.pdf
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─────────────────────────────────────────────
//  ROUTES
// ─────────────────────────────────────────────
app.use("/health",            require("./routes/health"));
app.use("/api/auth",          require("./routes/auth"));
app.use("/api/dashboard",     require("./routes/dashboard"));
app.use("/api/pendaftaran",   require("./routes/pendaftaran"));
app.use("/api/master",        require("./routes/master"));
app.use("/api/dokumen",       require("./routes/dokumen"));
app.use("/api/hasil-seleksi", require("./routes/hasilSeleksi"));

// Route default — cek server jalan
app.get("/", (req, res) => {
  res.json({
    message: "✅ Server PPDB Indramayu berjalan!",
    versi:   "1.0.0",
    health_check: "GET /health",
    endpoints: [
      "GET  /health",
      "POST /api/auth/register",
      "POST /api/auth/login",
      "POST /api/auth/admin-login",
      "GET  /api/dashboard",
      "POST /api/pendaftaran",
      "GET/POST/PUT/DELETE /api/master/sekolah",
      "GET/POST/PUT/DELETE /api/master/jalur",
      "GET  /api/dokumen",
      "POST /api/dokumen/upload",
      "GET  /api/hasil-seleksi",
    ],
  });
});

// Handler error global (centralized)
app.use(errorHandler);

// ─────────────────────────────────────────────
//  JALANKAN SERVER
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  try {
    await initializeRBAC();
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    console.log(`📁 Uploads tersimpan di folder: uploads/`);
  } catch (err) {
    console.error("❌ Server startup failed:", err.message);
    process.exit(1);
  }
});
