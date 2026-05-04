const express = require("express");
const db      = require("../config/database");
const auth    = require("../middleware/auth");
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

// Helper: generate ID
async function getNextId(prefix, tabel, kolom) {
  const q = `SELECT MAX(CAST(SUBSTRING(${kolom}, 2) AS UNSIGNED)) AS maxnum FROM ${tabel}`;
  const [rows] = await db.query(q);
  const maxNum = rows[0].maxnum || 0;
  const next = Number(maxNum) + 1;
  return `${prefix}${String(next).padStart(2, "0")}`;
}

// ─────────────────────────────────────────────
//  GET /api/dokumen
//  Ambil status semua dokumen milik siswa
// ─────────────────────────────────────────────
router.get("/", auth, async (req, res) => {
  const { id_siswa } = req.siswa;
  try {
    const [rows] = await db.query(
      `SELECT d.id_jenis_dokumen, d.status, jd.nama_dokumen, jd.sifat_dokumen
       FROM dokumen d
       JOIN jenis_dokumen jd ON jd.id_jenis_dokumen = d.id_jenis_dokumen
       WHERE d.id_siswa = ?`,
      [id_siswa]
    );
    res.json(rows.map((row) => ({
      ...row,
      status_dokumen: row.status,
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
    // Cek apakah dokumen jenis ini sudah pernah diupload
    const [existing] = await db.query(
      "SELECT id_dokumen FROM dokumen WHERE id_siswa = ? AND id_jenis_dokumen = ?",
      [id_siswa, id_jenis_dokumen]
    );

    if (existing.length > 0) {
      // Update record yang ada
      await db.query(
        "UPDATE dokumen SET status = 'TERUPLOAD' WHERE id_dokumen = ?",
        [existing[0].id_dokumen]
      );
    } else {
      // Insert baru
      const id_dok = await getNextId("D", "dokumen", "id_dokumen");
      await db.query(
        `INSERT INTO dokumen (id_dokumen, id_siswa, id_jenis_dokumen, status)
         VALUES (?, ?, ?, 'TERUPLOAD')`,
        [id_dok, id_siswa, id_jenis_dokumen]
      );
    }

    res.json({
      success: true,
      status_dokumen: "TERUPLOAD",
      message: "Dokumen berhasil diupload.",
    });

  } catch (err) {
    console.error("Upload dokumen error:", err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
});

module.exports = router;
