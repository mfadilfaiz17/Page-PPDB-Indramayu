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
         p.id_sekolah,
         p.nama_jalur_custom,
         p.nama_sekolah_custom,
         p.tahun_ajaran,
         DATE_FORMAT(p.tanggal_daftar, '%d %M %Y') AS tanggal_daftar,
         jp.nama_jalur,
         st.nama_sekolah
       FROM pendaftaran p
       LEFT JOIN jalur_ppdb jp     ON jp.id_jalur = p.id_jalur
       LEFT JOIN sekolah_tujuan st ON st.id_sekolah = p.id_sekolah
       WHERE p.id_siswa = ?
       LIMIT 1`,
      [id_siswa]
    );

    // 2. Status dokumen
    const [dokumen] = await db.query(
      `SELECT d.id_dokumen, d.id_jenis_dokumen, d.status_dokumen, d.file_path, jd.nama_dokumen, jd.sifat_dokumen
       FROM dokumen d
       JOIN jenis_dokumen jd ON jd.id_jenis_dokumen = d.id_jenis_dokumen
       WHERE d.id_siswa = ?`,
      [id_siswa]
    );

    // 3. Hasil seleksi
    const [hasil] = await db.query(
      `SELECT hs.id_hasil, hs.status_hasil, hs.peringkat, DATE_FORMAT(hs.tanggal_pengumuman, '%d %M %Y') AS tanggal_pengumuman,
              st.nama_sekolah, jp.nama_jalur
        FROM hasil_seleksi hs
        JOIN sekolah_tujuan st ON st.id_sekolah = hs.id_sekolah
        JOIN jalur_ppdb jp   ON jp.id_jalur   = hs.id_jalur
       WHERE hs.id_siswa = ?
       LIMIT 1`,
      [id_siswa]
    );

    // Format response pendaftaran
    let pendaftaranData = null;
    if (pendaftaran.length > 0 && pendaftaran[0].id_pendaftaran) {
      const p = pendaftaran[0];
      pendaftaranData = {
        id_pendaftaran: p.id_pendaftaran,
        id_jalur: p.id_jalur || null,
        id_sekolah: p.id_sekolah || null,
        nama_jalur: p.nama_jalur_custom || p.nama_jalur || null,
        nama_sekolah: p.nama_sekolah_custom || p.nama_sekolah || null,
        tahun_ajaran: p.tahun_ajaran,
        tanggal_daftar: p.tanggal_daftar,
      };
    }

    res.json({
      success: true,
      pendaftaran: pendaftaranData,
      dokumen: dokumen.map((row) => ({
        id_dokumen: row.id_dokumen,
        id_jenis_dokumen: row.id_jenis_dokumen,
        nama_dokumen: row.nama_dokumen,
        sifat_dokumen: row.sifat_dokumen,
        status_dokumen: row.status_dokumen,
        file_path: row.file_path,
      })),
      hasil: hasil.length > 0 ? hasil[0] : null,
    });

  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
});

module.exports = router;
