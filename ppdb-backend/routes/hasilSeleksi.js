const express = require("express");
const db      = require("../config/database");
const auth    = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

async function getNextId(prefix, tabel, kolom) {
  const q = `SELECT MAX(CAST(SUBSTRING(${kolom}, 2) AS UNSIGNED)) AS maxnum FROM ${tabel}`;
  const [rows] = await db.query(q);
  const maxNum = rows[0].maxnum || 0;
  const next = Number(maxNum) + 1;
  return `${prefix}${String(next).padStart(2, "0")}`;
}

// ─────────────────────────────────────────────
//  GET /api/hasil-seleksi
//  Ambil hasil seleksi siswa yang sedang login
// ─────────────────────────────────────────────
router.get("/", auth, async (req, res) => {
  const { id_siswa } = req.siswa;

  try {
    const [rows] = await db.query(
      `SELECT
         hs.id_hasil,
         hs.status_hasil,
         hs.peringkat,
         DATE_FORMAT(hs.tanggal_pengumuman, '%d %M %Y') AS tanggal_pengumuman,
         st.nama_sekolah,
         jp.nama_jalur
       FROM hasil_seleksi hs
       JOIN sekolah_tujuan st ON st.id_sekolah = hs.id_sekolah
       JOIN jalur_ppdb jp ON jp.id_jalur = hs.id_jalur
       WHERE hs.id_siswa = ?
       LIMIT 1`,
      [id_siswa]
    );

    res.json(rows[0] || null);

  } catch (err) {
    console.error("Hasil seleksi error:", err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
});

// ─────────────────────────────────────────────
//  GET /api/hasil-seleksi/admin
//  Ambil semua hasil seleksi untuk admin
// ─────────────────────────────────────────────
router.get("/admin", requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
         hs.id_hasil,
         hs.id_siswa,
         hs.id_sekolah,
         hs.id_jalur,
         hs.status_hasil,
         hs.peringkat,
         DATE_FORMAT(hs.tanggal_pengumuman, '%d %M %Y') AS tanggal_pengumuman,
         s.nama_lengkap,
         s.nisn,
         st.nama_sekolah,
         jp.nama_jalur
       FROM hasil_seleksi hs
       JOIN siswa s ON s.id_siswa = hs.id_siswa
       JOIN sekolah_tujuan st ON st.id_sekolah = hs.id_sekolah
       JOIN jalur_ppdb jp ON jp.id_jalur = hs.id_jalur
       ORDER BY hs.peringkat ASC, hs.tanggal_pengumuman DESC`
    );

    res.json(rows || []);

  } catch (err) {
    console.error("Admin hasil seleksi error:", err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
});

// ─────────────────────────────────────────────
//  POST /api/hasil-seleksi
//  Admin input hasil seleksi siswa
// ─────────────────────────────────────────────
router.post("/", requireAdmin, async (req, res) => {
  const { id_siswa, id_sekolah, id_jalur, status_hasil, peringkat, tanggal_pengumuman } = req.body;

  if (!id_siswa || !id_sekolah || !id_jalur || !status_hasil || !peringkat) {
    return res.status(400).json({ message: "Semua field wajib diisi." });
  }

  try {
    // Cek apakah hasil sudah ada
    const [existing] = await db.query(
      "SELECT id_hasil FROM hasil_seleksi WHERE id_siswa = ? AND id_sekolah = ? AND id_jalur = ?",
      [id_siswa, id_sekolah, id_jalur]
    );

    if (existing.length > 0) {
      // Update
      await db.query(
        `UPDATE hasil_seleksi
         SET status_hasil = ?, peringkat = ?, tanggal_pengumuman = ?
         WHERE id_hasil = ?`,
        [status_hasil, peringkat, tanggal_pengumuman || new Date().toISOString().split('T')[0], existing[0].id_hasil]
      );
    } else {
      // Insert baru
      const id_hasil = await getNextId("H", "hasil_seleksi", "id_hasil");
      await db.query(
        `INSERT INTO hasil_seleksi (id_hasil, id_siswa, id_sekolah, id_jalur, status_hasil, peringkat, tanggal_pengumuman)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id_hasil, id_siswa, id_sekolah, id_jalur, status_hasil, peringkat, tanggal_pengumuman || new Date().toISOString().split('T')[0]]
      );
    }

    res.json({
      success: true,
      message: "Hasil seleksi berhasil disimpan.",
    });

  } catch (err) {
    console.error("Input hasil seleksi error:", err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
});

module.exports = router;
