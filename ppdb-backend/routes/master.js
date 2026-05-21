const express = require("express");
const db = require("../config/database");
const requireAdmin = require("../middleware/requireAdmin");
const { authorize } = require("../middleware/authorize");
const { generateId } = require("../utils/idGenerator");
const { masterSchemas, validateRequest } = require("../schemas/validation");

const router = express.Router();


// getNextId moved to utils/idGenerator.js


async function getDefaultRefs() {
  const [siswaRows] = await db.query("SELECT id_siswa FROM siswa ORDER BY id_siswa ASC LIMIT 1");
  const [syaratRows] = await db.query("SELECT id_syarat FROM syarat ORDER BY id_syarat ASC LIMIT 1");
  const [jalurRows] = await db.query("SELECT id_jalur FROM jalur_ppdb ORDER BY id_jalur ASC LIMIT 1");

  return {
    id_siswa: siswaRows[0]?.id_siswa || null,
    id_syarat: syaratRows[0]?.id_syarat || null,
    id_jalur: jalurRows[0]?.id_jalur || null,
  };
}

function mapSekolah(row) {
  return {
    id: row.id_sekolah,
    id_sekolah: row.id_sekolah,
    npsn: row.npsn,
    nama: row.nama_sekolah,
    nama_sekolah: row.nama_sekolah,
    jenjang: row.jenjang,
    kuota: row.kuota,
    alamat: row.alamat_sekolah,
    alamat_sekolah: row.alamat_sekolah,
  };
}

function mapJalur(row) {
  return {
    id: row.id_jalur,
    id_jalur: row.id_jalur,
    id_syarat: row.id_syarat,
    id_siswa: row.id_siswa,
    nama: row.nama_jalur,
    nama_jalur: row.nama_jalur,
    kuota: row.persentase_kuota,
    persentase_kuota: row.persentase_kuota,
  };
}

router.use(requireAdmin);

router.get("/sekolah", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id_sekolah, id_siswa, npsn, nama_sekolah, jenjang, kuota, alamat_sekolah
       FROM sekolah_tujuan
       ORDER BY id_sekolah ASC`
    );
    res.json(rows.map(mapSekolah));
  } catch (err) {
    console.error("Get sekolah error:", err);
    next(err);
  }
});

router.post("/sekolah", authorize("sekolah", "manage"), async (req, res, next) => {
  try {
    // Validate input with Zod schema
    const validation = validateRequest(req.body, masterSchemas.sekolah);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Data tidak valid",
        errors: validation.errors,
      });
    }

    const { npsn, nama_sekolah, jenjang, kuota, alamat_sekolah } = validation.data;
    const { id_siswa } = req.body; // Optional field not in schema

    const refs = await getDefaultRefs();
    const id_sekolah = generateId("ST");

    await db.query(
      `INSERT INTO sekolah_tujuan
        (id_sekolah, id_siswa, npsn, nama_sekolah, jenjang, kuota, alamat_sekolah)
       VALUES (?, ?, ?, ?, ?, ?, ?)` ,
      [
        id_sekolah,
        id_siswa || refs.id_siswa,
        npsn,
        nama_sekolah,
        jenjang,
        kuota,
        alamat_sekolah,
      ]
    );

    res.status(201).json({ success: true, data: { id_sekolah, npsn, nama_sekolah, jenjang, kuota, alamat_sekolah } });
  } catch (err) {
    console.error("Create sekolah error:", err);
    next(err);
  }
});

router.put("/sekolah/:id", authorize("sekolah", "manage"), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate input with Zod schema
    const validation = validateRequest(req.body, masterSchemas.sekolah);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Data tidak valid",
        errors: validation.errors,
      });
    }

    const { npsn, nama_sekolah, jenjang, kuota, alamat_sekolah } = validation.data;
    const { id_siswa } = req.body; // Optional field not in schema

    const [current] = await db.query(
      "SELECT id_siswa FROM sekolah_tujuan WHERE id_sekolah = ?",
      [id]
    );
    if (current.length === 0) {
      return res.status(404).json({ message: "Sekolah tidak ditemukan." });
    }

    await db.query(
      `UPDATE sekolah_tujuan
       SET npsn = ?, nama_sekolah = ?, jenjang = ?, kuota = ?, alamat_sekolah = ?, id_siswa = ?
       WHERE id_sekolah = ?`,
      [
        npsn,
        nama_sekolah,
        jenjang,
        kuota,
        alamat_sekolah,
        id_siswa || current[0].id_siswa,
        id,
      ]
    );

    res.json({ success: true, message: "Sekolah berhasil diperbarui." });
  } catch (err) {
    console.error("Update sekolah error:", err);
    next(err);
  }
});

router.delete("/sekolah/:id", authorize("sekolah", "manage"), async (req, res) => {
  try {
    const [used] = await db.query(
      "SELECT id_sekolah FROM hasil_seleksi WHERE id_sekolah = ? LIMIT 1",
      [req.params.id]
    );
    if (used.length > 0) {
      return res.status(400).json({ message: "Sekolah masih digunakan pada hasil seleksi." });
    }

    const [result] = await db.query("DELETE FROM sekolah_tujuan WHERE id_sekolah = ?", [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Sekolah tidak ditemukan." });
    }

    res.json({ success: true, message: "Sekolah berhasil dihapus." });
  } catch (err) {
    console.error("Delete sekolah error:", err);
    next(err);
  }
});

router.get("/jalur", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id_jalur, id_siswa, id_syarat, nama_jalur, persentase_kuota
       FROM jalur_ppdb
       ORDER BY id_jalur ASC`
    );
    res.json(rows.map(mapJalur));
  } catch (err) {
    console.error("Get jalur error:", err);
    next(err);
  }
});

router.post("/jalur", authorize("jalur", "manage"), async (req, res, next) => {
  try {
    // Validate input with Zod schema
    const validation = validateRequest(req.body, masterSchemas.jalur);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Data tidak valid",
        errors: validation.errors,
      });
    }

    const { nama_jalur, persentase_kuota, id_syarat } = validation.data;
    const { id_siswa } = req.body; // Optional field not in schema

    const refs = await getDefaultRefs();
    const id_jalur = generateId("J");

    await db.query(
      `INSERT INTO jalur_ppdb
        (id_jalur, id_syarat, id_siswa, nama_jalur, persentase_kuota)
       VALUES (?, ?, ?, ?, ?)` ,
      [
        id_jalur,
        id_syarat || refs.id_syarat,
        id_siswa || refs.id_siswa,
        nama_jalur,
        persentase_kuota,
      ]
    );

    res.status(201).json({ success: true, data: { id_jalur, nama_jalur, persentase_kuota } });
  } catch (err) {
    console.error("Create jalur error:", err);
    next(err);
  }
});

router.put("/jalur/:id", authorize("jalur", "manage"), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate input with Zod schema
    const validation = validateRequest(req.body, masterSchemas.jalur);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Data tidak valid",
        errors: validation.errors,
      });
    }

    const { nama_jalur, persentase_kuota, id_syarat } = validation.data;
    const { id_siswa } = req.body; // Optional field not in schema

    const [current] = await db.query(
      "SELECT id_siswa, id_syarat FROM jalur_ppdb WHERE id_jalur = ?",
      [id]
    );
    if (current.length === 0) {
      return res.status(404).json({ message: "Jalur tidak ditemukan." });
    }

    await db.query(
      `UPDATE jalur_ppdb
       SET nama_jalur = ?, persentase_kuota = ?, id_siswa = ?, id_syarat = ?
       WHERE id_jalur = ?`,
      [
        nama_jalur,
        persentase_kuota,
        id_siswa || current[0].id_siswa,
        id_syarat || current[0].id_syarat,
        id,
      ]
    );

    res.json({ success: true, message: "Jalur berhasil diperbarui." });
  } catch (err) {
    console.error("Update jalur error:", err);
    next(err);
  }
});

router.delete("/jalur/:id", authorize("jalur", "manage"), async (req, res) => {
  try {
    const [usedSekolah] = await db.query(
      "SELECT id_jalur FROM sekolah_tujuan WHERE id_jalur = ? LIMIT 1",
      [req.params.id]
    );
    if (usedSekolah.length > 0) {
      return res.status(400).json({ message: "Jalur masih digunakan pada sekolah tujuan." });
    }

    const [usedHasil] = await db.query(
      "SELECT id_jalur FROM hasil_seleksi WHERE id_jalur = ? LIMIT 1",
      [req.params.id]
    );
    if (usedHasil.length > 0) {
      return res.status(400).json({ message: "Jalur masih digunakan pada hasil seleksi." });
    }

    const [result] = await db.query("DELETE FROM jalur_ppdb WHERE id_jalur = ?", [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Jalur tidak ditemukan." });
    }

    res.json({ success: true, message: "Jalur berhasil dihapus." });
  } catch (err) {
    console.error("Delete jalur error:", err);
    next(err);
  }
});

module.exports = router;