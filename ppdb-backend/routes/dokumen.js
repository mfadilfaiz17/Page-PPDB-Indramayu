const express = require("express");
const db      = require("../config/database");
const auth    = require("../middleware/auth");
const { generateId } = require("../utils/idGenerator");
const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");

const router = express.Router();

// Konfigurasi multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.siswa.id_siswa}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [".pdf", ".jpg", ".jpeg", ".png"];
    if (allowed.includes(path.extname(file.originalname).toLowerCase()))
      cb(null, true);
    else cb(new Error("Format tidak didukung."));
  },
});

// getNextId moved to utils/idGenerator.js


// ─────────────────────────────────────────────
//  GET /api/dokumen
//  Ambil status semua dokumen milik siswa
// ─────────────────────────────────────────────
router.get("/", auth, async (req, res) => {
  const { id_siswa } = req.siswa;
  try {
    const [rows] = await db.query(
      `SELECT d.id_dokumen, d.id_jenis_dokumen, d.status_dokumen, d.file_path, jd.nama_dokumen, jd.sifat_dokumen
       FROM dokumen d
       JOIN jenis_dokumen jd ON jd.id_jenis_dokumen = d.id_jenis_dokumen
       WHERE d.id_siswa = ?`,
      [id_siswa]
    );
    res.json(rows.map((row) => ({
      id_dokumen: row.id_dokumen,
      id_jenis_dokumen: row.id_jenis_dokumen,
      nama_dokumen: row.nama_dokumen,
      sifat_dokumen: row.sifat_dokumen,
      status_dokumen: row.status_dokumen,
      file_path: row.file_path,
    })));
  } catch (err) {
    console.error("Get dokumen error:", err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
});

// ─────────────────────────────────────────────
//  POST /api/dokumen/upload
//  Upload atau ganti satu dokumen
// ─────────────────────────────────────────────
router.post("/upload", auth, upload.single("file"), async (req, res) => {
  const { id_siswa }       = req.siswa;
  const { id_jenis_dokumen } = req.body;

  if (!req.file || !id_jenis_dokumen) {
    return res.status(400).json({ message: "File dan jenis dokumen wajib diisi." });
  }

  try {
    // Simpan file_path (relative path dari folder uploads)
    const file_path = `/uploads/${req.file.filename}`;

    // Cek apakah dokumen jenis ini sudah pernah diupload
    const [existing] = await db.query(
      "SELECT id_dokumen FROM dokumen WHERE id_siswa = ? AND id_jenis_dokumen = ?",
      [id_siswa, id_jenis_dokumen]
    );

    if (existing.length > 0) {
      // Update record yang ada
      await db.query(
        "UPDATE dokumen SET status_dokumen = 'TERUPLOAD', file_path = ? WHERE id_dokumen = ?",
        [file_path, existing[0].id_dokumen]
      );
    } else {
      // Insert baru
      const id_dok = generateId("D");
      await db.query(
        `INSERT INTO dokumen (id_dokumen, id_siswa, id_jenis_dokumen, status_dokumen, file_path)
         VALUES (?, ?, ?, 'TERUPLOAD', ?)`,
        [id_dok, id_siswa, id_jenis_dokumen, file_path]
      );
    }

    res.json({
      success: true,
      status_dokumen: "TERUPLOAD",
      file_path,
      message: "Dokumen berhasil diupload.",
    });

  } catch (err) {
    console.error("Upload dokumen error:", err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
});

module.exports = router;
