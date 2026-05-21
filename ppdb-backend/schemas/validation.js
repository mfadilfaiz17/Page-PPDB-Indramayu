const { z } = require("zod");

/**
 * Auth Validation Schemas
 */
const authSchemas = {
  register: z.object({
    email: z.string().email("Email harus valid").trim(),
    password: z.string().min(8, "Password minimal 8 karakter").trim(),
    nisn: z.string().regex(/^\d{10}$/, "NISN harus 10 digit"),
    nik: z.string().regex(/^\d{16}$/, "NIK harus 16 digit"),
    nama_lengkap: z.string().min(3, "Nama minimal 3 karakter").trim(),
    jenis_kelamin: z.enum(["L", "P"], "Jenis kelamin harus L atau P"),
    tanggal_lahir: z.string().refine((date) => !isNaN(Date.parse(date)), "Format tanggal tidak valid"),
    desa: z.string().optional().default(""),
    kecamatan: z.string().optional().default(""),
    alamat_siswa: z.string().min(5, "Alamat minimal 5 karakter").trim(),
    no_hp: z.string().regex(/^08\d{8,11}$/, "No HP harus valid (08...)").trim(),
    asal_sekolah: z.string().min(3, "Nama sekolah minimal 3 karakter").trim(),
    nilai_rata: z.coerce.number().min(0).max(100, "Nilai rata harus 0-100"),
  }),

  login: z.object({
    email: z.string().email("Email harus valid").trim(),
    password: z.string().min(1, "Password wajib diisi").trim(),
  }),

  adminLogin: z.object({
    username: z.string().min(3, "Username minimal 3 karakter").trim(),
    password: z.string().min(1, "Password wajib diisi").trim(),
  }),
};

/**
 * Pendaftaran Validation Schemas
 */
const pendaftaranSchemas = {
  submit: z.object({
    id_jalur: z.string().optional(),
    id_sekolah: z.string().optional(),
    nama_jalur_custom: z.string().optional(),
    nama_sekolah_custom: z.string().optional(),
  }),
};

/**
 * Master Data Validation Schemas
 */
const masterSchemas = {
  sekolah: z.object({
    npsn: z.coerce.number().positive("NPSN harus angka positif"),
    nama_sekolah: z.string().min(5, "Nama sekolah minimal 5 karakter").trim(),
    jenjang: z.enum(["SD", "SMP", "SMA", "SMK"], "Jenjang tidak valid"),
    kuota: z.coerce.number().positive("Kuota harus angka positif"),
    alamat_sekolah: z.string().min(5, "Alamat minimal 5 karakter").trim(),
  }),

  jalur: z.object({
    id_syarat: z.string().min(1, "Syarat wajib dipilih"),
    nama_jalur: z.string().min(3, "Nama jalur minimal 3 karakter").trim(),
    persentase_kuota: z.coerce.number().min(1).max(100, "Persentase 1-100"),
  }),

  periode: z.object({
    tahun_ajaran: z.string().regex(/^\d{4}\/\d{4}$/, "Format: YYYY/YYYY"),
    tanggal_mulai: z.string().refine((date) => !isNaN(Date.parse(date)), "Format tanggal tidak valid"),
    tanggal_selesai: z.string().refine((date) => !isNaN(Date.parse(date)), "Format tanggal tidak valid"),
  }),
};

/**
 * Hasil Seleksi Validation Schemas
 */
const hasilSeleksiSchemas = {
  create: z.object({
    id_siswa: z.string().min(1, "Siswa wajib dipilih"),
    id_jalur: z.string().min(1, "Jalur wajib dipilih"),
    id_sekolah: z.string().min(1, "Sekolah wajib dipilih"),
    status_hasil: z.enum(["Lulus", "Cadangan", "Tidak Lulus"], "Status tidak valid"),
    peringkat: z.coerce.number().positive("Peringkat harus angka positif"),
    tanggal_pengumuman: z.string().refine((date) => !isNaN(Date.parse(date)), "Format tanggal tidak valid"),
  }),
};

/**
 * Validate request body against a Zod schema
 * Returns: { isValid, errors } or throws error on validation failure
 */
function validateRequest(data, schema) {
  try {
    const validated = schema.parse(data);
    return { isValid: true, data: validated, errors: null };
  } catch (err) {
    if (err instanceof z.ZodError) {
      const errors = err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return { isValid: false, data: null, errors };
    }
    throw err;
  }
}

module.exports = {
  authSchemas,
  pendaftaranSchemas,
  masterSchemas,
  hasilSeleksiSchemas,
  validateRequest,
};
