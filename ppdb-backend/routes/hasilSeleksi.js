const express = require("express");
const db      = require("../config/database");
const auth    = require("../middleware/auth");

const router = express.Router();

// ─────────────────────────────────────────────
//  GET /api/hasil-seleksi
//  Ambil hasil seleksi siswa yang sedang login
// ─────────────────────────────────────────────
router.get("/", auth, async (req, res) => {
  const { id_siswa } = req.siswa;

  try {
    const [rows] = await db.query(
      `SELECT
         hs.status_hasil,
         hs.peringkat,
         DATE_FORMAT(hs.tanggal_pengumuman, '%d %M %Y') AS tanggal_pengumuman,
         st.nama_sekolah,
         jd.nama_jalur
       FROM hasil_seleksi hs
       JOIN sekolah_tujuan st ON st.id_sekolah = hs.id_sekolah
       JOIN jalur_ppdb   jd ON jd.id_jalur   = hs.id_jalur
       WHERE hs.id_siswa = ?
       LIMIT 1`,
      [id_siswa]
    );

    // Kalau belum ada hasil, kembalikan null
    res.json(rows[0] || null);

  } catch (err) {
    console.error("Hasil seleksi error:", err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
});

module.exports = router;
