const express = require("express");
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const db      = require("../config/database");
require("dotenv").config();

const router = express.Router();

function hitungUsia(tanggalLahir) {
  const lahir = new Date(tanggalLahir);
  const sekarang = new Date();
  let usia = sekarang.getFullYear() - lahir.getFullYear();
  const bulan = sekarang.getMonth() - lahir.getMonth();
  if (bulan < 0 || (bulan === 0 && sekarang.getDate() < lahir.getDate())) {
    usia -= 1;
  }
  return usia;
}

// ─────────────────────────────────────────────
//  Helper: generate ID otomatis
//  Contoh: getNextId("A", "Akun_PPDB", "id_akun") → "A06"
// ─────────────────────────────────────────────
async function getNextId(prefix, tabel, kolom) {
  // Ambil nilai numerik tertinggi dari kolom yang berformat PREFIXNN
  const q = `SELECT MAX(CAST(SUBSTRING(${kolom}, 2) AS UNSIGNED)) AS maxnum FROM ${tabel}`;
  const [rows] = await db.query(q);
  const maxNum = rows[0].maxnum || 0;
  const next = Number(maxNum) + 1;
  return `${prefix}${String(next).padStart(2, "0")}`;
}

async function ensureAdminTable() {
  await db.query(`CREATE TABLE IF NOT EXISTS admin_ppdb (
    id_admin varchar(6) NOT NULL,
    username varchar(50) NOT NULL,
    password varchar(255) NOT NULL,
    nama_admin varchar(100) DEFAULT NULL,
    PRIMARY KEY (id_admin),
    UNIQUE KEY uq_admin_username (username)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

  const [rows] = await db.query(
    "SELECT id_admin FROM admin_ppdb WHERE username = ? LIMIT 1",
    ["admin"]
  );

  if (rows.length === 0) {
    const hashed = await bcrypt.hash("admin123", 10);
    await db.query(
      "INSERT INTO admin_ppdb (id_admin, username, password, nama_admin) VALUES (?, ?, ?, ?)",
      ["AD01", "admin", hashed, "Administrator PPDB"]
    );
  }
}

// ─────────────────────────────────────────────
//  POST /api/auth/register
//  Membuat akun baru + data siswa
// ─────────────────────────────────────────────
router.post("/register", async (req, res) => {
  const {
    // Akun_PPDB
    email, password,
    // Siswa
    nisn, nik, nama_lengkap, jenis_kelamin, tanggal_lahir,
    desa, kecamatan, alamat_siswa, no_hp, asal_sekolah, nilai_rata,
  } = req.body;

  // Trim email dan password untuk hilangkan whitespace tersembunyi
  const trimmedEmail = email?.trim() || "";
  const trimmedPassword = password?.trim() || "";

  // Validasi field wajib
  if (!trimmedEmail || !trimmedPassword || !nisn || !nik || !nama_lengkap ||
      !jenis_kelamin || !tanggal_lahir || !alamat_siswa ||
      !no_hp || !asal_sekolah || !nilai_rata) {
    return res.status(400).json({ message: "Semua field wajib diisi." });
  }

  try {
    // Cek email sudah terdaftar
    const [cekEmail] = await db.query(
      "SELECT id_akun FROM akun_ppdb WHERE email = ?", [trimmedEmail]
    );
    if (cekEmail.length > 0) {
      return res.status(400).json({ message: "Email sudah terdaftar." });
    }

    // Cek NISN sudah terdaftar
    const [cekNisn] = await db.query(
      "SELECT id_siswa FROM siswa WHERE nisn = ?", [nisn]
    );
    if (cekNisn.length > 0) {
      return res.status(400).json({ message: "NISN sudah terdaftar." });
    }

    // Hash password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    // Generate ID
    const id_akun  = await getNextId("A",  "akun_ppdb", "id_akun");
    const id_siswa = await getNextId("S",  "siswa",     "id_siswa");
    const alamatLengkap = [alamat_siswa, desa, kecamatan].filter(Boolean).join(", ");
    const usia = hitungUsia(tanggal_lahir);

    // Simpan ke tabel Akun_PPDB
    await db.query(
      "INSERT INTO akun_ppdb (id_akun, email, password) VALUES (?, ?, ?)",
      [id_akun, trimmedEmail, hashedPassword]
    );

    // Simpan ke tabel Siswa
    await db.query(
      `INSERT INTO siswa
        (id_siswa, id_akun, nisn, nama_lengkap, nik, jenis_kelamin, tanggal_lahir,
         usia, alamat_siswa, no_hp, asal_sekolah, nilai_rata)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
      [id_siswa, id_akun, nisn, nama_lengkap, nik, jenis_kelamin, tanggal_lahir,
       usia, alamatLengkap, no_hp, asal_sekolah, nilai_rata]
    );

    // Ambil data siswa yang baru dibuat
    const [siswaRows] = await db.query(
      "SELECT * FROM siswa WHERE id_siswa = ?", [id_siswa]
    );

    // Buat token JWT dan kembalikan juga data siswa agar frontend bisa auto-login
    const token = jwt.sign(
      {
        id_akun: id_akun,
        id_siswa: id_siswa,
        email: trimmedEmail,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: "Akun berhasil dibuat! sedang login otomatis.",
      id_akun,
      token,
      siswa: siswaRows[0],
    });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
});

// ─────────────────────────────────────────────
//  POST /api/auth/login
//  Login siswa dan kembalikan token JWT
// ─────────────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Trim email dan password
  const trimmedEmail = email?.trim() || "";
  const trimmedPassword = password?.trim() || "";

  if (!trimmedEmail || !trimmedPassword) {
    return res.status(400).json({ message: "Email dan password wajib diisi." });
  }

  try {
    // Cari akun berdasarkan email
    const [akun] = await db.query(
      "SELECT id_akun, email, `password` FROM akun_ppdb WHERE email = ?", [trimmedEmail]
    );
    if (akun.length === 0) {
      return res.status(401).json({ message: "Email tidak terdaftar." });
    }

    // Cek password
    const passwordCocok = await bcrypt.compare(trimmedPassword, akun[0].password);
    if (!passwordCocok) {
      return res.status(401).json({ message: "Password salah." });
    }

    // Ambil data siswa
    const [siswa] = await db.query(
      "SELECT * FROM siswa WHERE id_akun = ?", [akun[0].id_akun]
    );
    if (siswa.length === 0) {
      return res.status(404).json({ message: "Data siswa tidak ditemukan." });
    }

    // Buat token JWT
    const token = jwt.sign(
      {
        id_akun:  akun[0].id_akun,
        id_siswa: siswa[0].id_siswa,
        email:    akun[0].email,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      token,
      siswa: {
        ...siswa[0],
        email: akun[0].email,
      },
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
});

// ─────────────────────────────────────────────
//  POST /api/auth/admin-login
//  Login admin dari tabel admin_ppdb
// ─────────────────────────────────────────────
router.post("/admin-login", async (req, res) => {
  const { username, password } = req.body;

  const trimmedUsername = username?.trim() || "";
  const trimmedPassword = password?.trim() || "";

  if (!trimmedUsername || !trimmedPassword) {
    return res.status(400).json({ message: "Username dan password wajib diisi." });
  }

  try {
    await ensureAdminTable();

    const [rows] = await db.query(
      "SELECT id_admin, username, `password`, nama_admin FROM admin_ppdb WHERE username = ? LIMIT 1",
      [trimmedUsername]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Username atau password salah." });
    }

    const admin = rows[0];
    const isHashed = typeof admin.password === "string" && admin.password.startsWith("$2");
    const passwordCocok = isHashed
      ? await bcrypt.compare(trimmedPassword, admin.password)
      : admin.password === trimmedPassword;

    if (!passwordCocok) {
      return res.status(401).json({ message: "Username atau password salah." });
    }

    res.json({
      success: true,
      token: "admin-token-2025",
      admin: {
        id_admin: admin.id_admin,
        username: admin.username,
        nama_admin: admin.nama_admin,
        role: "admin",
      },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
});

module.exports = router;
