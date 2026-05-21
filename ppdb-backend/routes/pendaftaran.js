const express = require("express");
const db      = require("../config/database");
const auth    = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");
const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");

const router = express.Router();

// ─────────────────────────────────────────────
//  GET /api/pendaftaran/opsi
//  Ambil data master jalur, sekolah, dan periode dari SQL
// ─────────────────────────────────────────────
router.get("/opsi", auth, async (req, res) => {
  try {
    const [jalurRows] = await db.query(
      `SELECT id_jalur, nama_jalur, persentase_kuota
       FROM jalur_ppdb
       ORDER BY id_jalur ASC`
    );

    const [sekolahRows] = await db.query(
      `SELECT id_sekolah, nama_sekolah, jenjang, kuota, alamat_sekolah
       FROM sekolah_tujuan
       ORDER BY id_sekolah ASC`
    );

    const [periodeRows] = await db.query(
      `SELECT tahun_ajaran, tanggal_mulai, tanggal_selesai
       FROM periode_ppdb
       ORDER BY id_periode DESC
       LIMIT 1`
    );

    res.json({
      success: true,
      jalur: jalurRows,
      sekolah: sekolahRows,
      periode: periodeRows[0] || null,
    });
  } catch (err) {
    console.error("Opsi pendaftaran error:", err);
    res.status(500).json({ message: "Gagal memuat opsi pendaftaran." });
  }
});

// ─────────────────────────────────────────────
//  GET /api/pendaftaran/admin
//  Daftar seluruh pendaftaran untuk admin
// ─────────────────────────────────────────────
router.get("/admin", requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
         p.id_pendaftaran,
         p.id_siswa,
         s.nama_lengkap,
         s.nisn,
         s.asal_sekolah,
         p.tahun_ajaran,
         DATE_FORMAT(p.tanggal_daftar, '%d %M %Y') AS tanggal_daftar,
         COALESCE(jp.nama_jalur, p.nama_jalur_custom) AS nama_jalur,
         COALESCE(st.nama_sekolah, p.nama_sekolah_custom) AS nama_sekolah,
         s.nilai_rata,
         COALESCE(hs.status_hasil, 'Menunggu') AS status
       FROM pendaftaran p
       JOIN siswa s ON s.id_siswa = p.id_siswa
       LEFT JOIN jalur_ppdb jp ON jp.id_jalur = p.id_jalur
       LEFT JOIN sekolah_tujuan st ON st.id_sekolah = p.id_sekolah
       LEFT JOIN hasil_seleksi hs ON hs.id_siswa = p.id_siswa
       ORDER BY p.tanggal_daftar DESC, p.id_pendaftaran DESC`
    );

    res.json(rows);
  } catch (err) {
    console.error("Admin pendaftaran error:", err);
    res.status(500).json({ message: "Gagal memuat data pendaftaran." });
  }
});

// ─────────────────────────────────────────────
//  Konfigurasi Multer (upload file dokumen)
// ─────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Format nama file: idSiswa_idJenis_timestamp.ext
    const ext = path.extname(file.originalname);
    cb(null, `${req.siswa.id_siswa}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Maks 2 MB
  fileFilter: (req, file, cb) => {
    const allowed = [".pdf", ".jpg", ".jpeg", ".png"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Format file tidak didukung. Gunakan PDF, JPG, atau PNG."));
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
//  POST /api/pendaftaran
//  Submit pendaftaran lengkap (jalur + sekolah + dokumen)
// ─────────────────────────────────────────────
const JENIS_DOKUMEN = {
  kk:       "JD01",
  akta:     "JD02",
  ijazah:   "JD03",
  sertif:   "JD04",
  domisili: "JD05",
};

router.post(
  "/",
  auth,
  upload.fields(Object.keys(JENIS_DOKUMEN).map((k) => ({ name: k, maxCount: 1 }))),
  async (req, res) => {
    const { id_siswa } = req.siswa;
    const { id_jalur, id_sekolah, nama_jalur_custom, nama_sekolah_custom } = req.body;

      // Accept either master id pair OR custom names (both required when using custom)
      if ((!id_jalur || !id_sekolah) && (!nama_jalur_custom || !nama_sekolah_custom)) {
        return res.status(400).json({ message: "Jalur dan sekolah wajib dipilih atau diisi sendiri." });
      }

    try {
      const [periodeRows] = await db.query(
        `SELECT tahun_ajaran, tanggal_selesai
         FROM periode_ppdb
         ORDER BY id_periode DESC
         LIMIT 1`
      );
      const periodeAktif = periodeRows[0] || {
        tahun_ajaran: "2025/2026",
        tanggal_selesai: new Date().toISOString().slice(0, 10),
      };

      const [existingPendaftaran] = await db.query(
        "SELECT id_pendaftaran FROM pendaftaran WHERE id_siswa = ? LIMIT 1",
        [id_siswa]
      );

      const id_pendaftaran = existingPendaftaran[0]?.id_pendaftaran || await getNextId("R", "pendaftaran", "id_pendaftaran");

      if (id_jalur && id_sekolah) {
        await db.query(
          "UPDATE jalur_ppdb SET id_siswa = ? WHERE id_jalur = ?",
          [id_siswa, id_jalur]
        );

        await db.query(
          "UPDATE sekolah_tujuan SET id_siswa = ? WHERE id_sekolah = ?",
          [id_siswa, id_sekolah]
        );
      }

      // Simpan setiap file dokumen yang diupload
      const files = req.files || {};
      for (const [key, idJenis] of Object.entries(JENIS_DOKUMEN)) {
        if (files[key] && files[key][0]) {
          const file      = files[key][0];
          const id_dok    = await getNextId("D", "dokumen", "id_dokumen");
          const file_path = `/uploads/${file.filename}`;
          await db.query(
            `INSERT INTO dokumen (id_dokumen, id_siswa, id_jenis_dokumen, status_dokumen, file_path)
             VALUES (?, ?, ?, 'TERUPLOAD', ?)`,
            [id_dok, id_siswa, idJenis, file_path]
          );
        }
      }

      const [periodeExisting] = await db.query(
        "SELECT id_periode FROM periode_ppdb WHERE id_siswa = ? LIMIT 1",
        [id_siswa]
      );

      if (periodeExisting.length > 0) {
        await db.query(
          `UPDATE periode_ppdb
           SET tahun_ajaran = ?, tanggal_mulai = CURDATE(), tanggal_selesai = ?
           WHERE id_siswa = ?`,
          [periodeAktif.tahun_ajaran, periodeAktif.tanggal_selesai, id_siswa]
        );
      } else {
        const id_periode = await getNextId("P", "periode_ppdb", "id_periode");
        await db.query(
          `INSERT INTO periode_ppdb
            (id_periode, id_siswa, tahun_ajaran, tanggal_mulai, tanggal_selesai)
           VALUES (?, ?, ?, CURDATE(), ?)` ,
          [id_periode, id_siswa, periodeAktif.tahun_ajaran, periodeAktif.tanggal_selesai]
        );
      }

      if (existingPendaftaran.length > 0) {
        await db.query(
          `UPDATE pendaftaran
           SET id_jalur = ?, id_sekolah = ?, nama_jalur_custom = ?, nama_sekolah_custom = ?, tahun_ajaran = ?, tanggal_daftar = CURDATE()
           WHERE id_siswa = ?`,
          [id_jalur || null, id_sekolah || null, nama_jalur_custom || null, nama_sekolah_custom || null, periodeAktif.tahun_ajaran, id_siswa]
        );
      } else {
        await db.query(
          `INSERT INTO pendaftaran
            (id_pendaftaran, id_siswa, id_jalur, id_sekolah, nama_jalur_custom, nama_sekolah_custom, tahun_ajaran, tanggal_daftar)
           VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())` ,
          [id_pendaftaran, id_siswa, id_jalur || null, id_sekolah || null, nama_jalur_custom || null, nama_sekolah_custom || null, periodeAktif.tahun_ajaran]
        );
      }

      // Buat nomor pendaftaran
      const nomorPendaftaran = `PPDB-2025-${id_siswa}`;

      res.status(201).json({
        success: true,
        nomorPendaftaran,
        message: "Pendaftaran berhasil dikirim!",
      });

    } catch (err) {
      console.error("Pendaftaran error:", err);
      res.status(500).json({ message: "Terjadi kesalahan server." });
    }
  }
);

module.exports = router;
