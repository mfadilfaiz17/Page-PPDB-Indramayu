const express = require("express");
const db      = require("../config/database");
const auth    = require("../middleware/auth");

const router = express.Router();

// ─────────────────────────────────────────────
//  GET /api/dashboard
//  Ambil ringkasan data siswa yang sedang login
// ─────────────────────────────────────────────
router.get("/", auth, async (req, res) => {
  const { id_siswa } = req.siswa;

  try {
    // 1. Data pendaftaran (jalur & sekolah yang dipilih)
    const [pendaftaran] = await db.query(
      `SELECT
         p.id_pendaftaran,
         p.id_jalur,
         jp.nama_jalur,
         p.id_sekolah,
         st.nama_sekolah,
         p.tahun_ajaran,
         DATE_FORMAT(p.tanggal_daftar, '%d %M %Y') AS tanggal_daftar
       FROM siswa s
       LEFT JOIN pendaftaran p     ON p.id_siswa = s.id_siswa
       LEFT JOIN jalur_ppdb jp     ON jp.id_jalur = p.id_jalur
       LEFT JOIN sekolah_tujuan st ON st.id_sekolah = p.id_sekolah
       WHERE s.id_siswa = ?
       LIMIT 1`,
      [id_siswa]
    );

    // 2. Status dokumen
    const [dokumen] = await db.query(
      `SELECT jd.nama_dokumen, d.status
       FROM dokumen d
       JOIN jenis_dokumen jd ON jd.id_jenis_dokumen = d.id_jenis_dokumen
       WHERE d.id_siswa = ?`,
      [id_siswa]
    );

    // 3. Hasil seleksi
    const [hasil] = await db.query(
      `SELECT hs.status_hasil, hs.peringkat, hs.tanggal_pengumuman,
              st.nama_sekolah, jd.nama_jalur
        FROM hasil_seleksi hs
        JOIN sekolah_tujuan st ON st.id_sekolah = hs.id_sekolah
        JOIN jalur_ppdb jd   ON jd.id_jalur   = hs.id_jalur
       WHERE hs.id_siswa = ?
       LIMIT 1`,
      [id_siswa]
    );

    res.json({
      pendaftaran: (pendaftaran[0] && pendaftaran[0].id_pendaftaran) ? pendaftaran[0] : null,
      dokumen: dokumen.map((row) => ({
        ...row,
        status_dokumen: row.status,
      })),
      hasil: hasil[0] || null,
    });

  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
});

module.exports = router;
