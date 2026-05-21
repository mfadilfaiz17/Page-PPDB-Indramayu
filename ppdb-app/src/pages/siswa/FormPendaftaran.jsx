import { useEffect, useMemo, useState } from "react";
import NoticeBox from "../../components/NoticeBox";
import { API_BASE_URL } from "../../config/api";

// ─────────────────────────────────────────────
//  DATA STATIS (dari ERD: Sekolah_Tujuan & Jalur_Daftar)
// ─────────────────────────────────────────────
const SEKOLAH_FALLBACK = [
  { value: "ST01", label: "SMA Negeri 1 Indramayu — Kuota: 200 siswa" },
  { value: "ST02", label: "SMA Negeri 2 Indramayu — Kuota: 180 siswa" },
  { value: "ST03", label: "SMK Negeri 1 Indramayu — Kuota: 220 siswa" },
  { value: "ST04", label: "SMK Negeri 2 Indramayu — Kuota: 210 siswa" },
];

const JALUR_FALLBACK = [
  { value: "J01", label: "Zonasi", kuota: "50%" },
  { value: "J02", label: "Prestasi", kuota: "30%" },
  { value: "J03", label: "Afirmasi", kuota: "10%" },
  { value: "J04", label: "Perpindahan Orang Tua", kuota: "10%" },
];

const DOKUMEN_LIST = [
  { key: "kk",       label: "Kartu Keluarga (KK)",          wajib: true },
  { key: "akta",     label: "Akta Kelahiran",                wajib: true },
  { key: "ijazah",   label: "Ijazah / SKL",                  wajib: true },
  { key: "domisili", label: "Surat Keterangan Domisili",     wajib: true },
  { key: "sertif",   label: "Sertifikat Prestasi",           wajib: false },
];

// ─────────────────────────────────────────────
//  HELPER: Input & Label
// ─────────────────────────────────────────────
function Field({ label, required, hint, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12.5, fontWeight: 600, color: "#1c2e4a" }}>
        {label} {required && <span style={{ color: "#e53e3e" }}>*</span>}
      </label>
      {children}
      {hint && (
        <span style={{ fontSize: 11.5, color: "#7a8fa8" }}>{hint}</span>
      )}
    </div>
  );
}

const inputStyle = {
  border: "1.5px solid #dde6f4",
  borderRadius: 9,
  padding: "10px 13px",
  fontSize: 13.5,
  fontFamily: "inherit",
  color: "#1c2e4a",
  outline: "none",
  background: "#fff",
  transition: "border-color .2s, box-shadow .2s",
  width: "100%",
};

function Input({ onFocus, onBlur, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      style={{
        ...inputStyle,
        borderColor: focused ? "#3a7bd5" : "#dde6f4",
        boxShadow: focused ? "0 0 0 3px rgba(58,123,213,.12)" : "none",
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      {...props}
    />
  );
}

function Select({ children, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      style={{
        ...inputStyle,
        borderColor: focused ? "#3a7bd5" : "#dde6f4",
        boxShadow: focused ? "0 0 0 3px rgba(58,123,213,.12)" : "none",
        cursor: "pointer",
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      {...props}
    >
      {children}
    </select>
  );
}

// ─────────────────────────────────────────────
//  LANGKAH 1: Data Diri & Akun
// ─────────────────────────────────────────────
function LangkahSatu({ data, onChange }) {
  return (
    <div>
      <SectionTitle title="Data Diri Siswa" />
      <div style={{ marginBottom: 16, fontSize: 12.5, color: "#7a8fa8", lineHeight: 1.6 }}>
        Data di bawah ini diambil dari akun siswa yang sedang login dan tetap bisa diedit bila ada koreksi.
      </div>

      <SectionTitle title="Data Pribadi Siswa" style={{ marginTop: 24 }} />
      <div style={gridStyle}>
        <Field label="NISN" required hint="10 digit Nomor Induk Siswa Nasional">
          <Input
            type="text"
            placeholder="Contoh: 0012345678"
            maxLength={10}
            value={data.nisn}
            onChange={(e) => onChange("nisn", e.target.value.replace(/\D/g, ""))}
          />
        </Field>
        <Field label="NIK" required hint="16 digit sesuai KTP/KK">
          <Input
            type="text"
            placeholder="Contoh: 3208010101080001"
            maxLength={16}
            value={data.nik}
            onChange={(e) => onChange("nik", e.target.value.replace(/\D/g, ""))}
          />
        </Field>
      </div>

      <div style={{ ...gridStyle, gridTemplateColumns: "1fr" }}>
        <Field label="Nama Lengkap" required hint="Sesuai ijazah / akta kelahiran">
          <Input
            type="text"
            placeholder="Nama lengkap tanpa singkatan"
            value={data.nama_lengkap}
            onChange={(e) => onChange("nama_lengkap", e.target.value)}
          />
        </Field>
      </div>

      <div style={gridStyle}>
        <Field label="Jenis Kelamin" required>
          <Select
            value={data.jenis_kelamin}
            onChange={(e) => onChange("jenis_kelamin", e.target.value)}
          >
            <option value="">-- Pilih --</option>
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </Select>
        </Field>
        <Field label="Tanggal Lahir" required>
          <Input
            type="date"
            value={data.tanggal_lahir}
            onChange={(e) => onChange("tanggal_lahir", e.target.value)}
          />
        </Field>
      </div>

      <div style={gridStyle}>
        <Field label="Desa" required>
          <Input
            type="text"
            placeholder="Nama desa tempat tinggal"
            value={data.desa}
            onChange={(e) => onChange("desa", e.target.value)}
          />
        </Field>
        <Field label="Kecamatan" required>
          <Input
            type="text"
            placeholder="Nama kecamatan"
            value={data.kecamatan}
            onChange={(e) => onChange("kecamatan", e.target.value)}
          />
        </Field>
      </div>

      <div style={{ ...gridStyle, gridTemplateColumns: "1fr" }}>
        <Field
          label="Alamat Lengkap"
          required
          hint="Harus sesuai Kartu Keluarga - penting untuk jalur Zonasi"
        >
          <Input
            type="text"
            placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kabupaten"
            value={data.alamat_siswa}
            onChange={(e) => onChange("alamat_siswa", e.target.value)}
          />
        </Field>
      </div>

      <div style={gridStyle}>
        <Field label="Nomor HP Aktif" required>
          <Input
            type="tel"
            placeholder="08xxxxxxxxxx"
            value={data.no_hp}
            onChange={(e) => onChange("no_hp", e.target.value.replace(/\D/g, ""))}
          />
        </Field>
        <Field label="Asal Sekolah (SMP/MTs)" required>
          <Input
            type="text"
            placeholder="Nama lengkap sekolah asal"
            value={data.asal_sekolah}
            onChange={(e) => onChange("asal_sekolah", e.target.value)}
          />
        </Field>
        <Field label="Nilai Rata-rata Rapor" required hint="Rata-rata nilai rapor semester 1–5">
          <Input
            type="number"
            placeholder="Contoh: 88.5"
            min="0"
            max="100"
            step="0.1"
            value={data.nilai_rata}
            onChange={(e) => onChange("nilai_rata", e.target.value)}
          />
        </Field>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  LANGKAH 2: Jalur & Sekolah Tujuan
// ─────────────────────────────────────────────
function LangkahDua({ data, onChange, jalurList, sekolahList, periodeText, loadingOpsi }) {
  // Tampilkan semua jalur ketika sekolah dipilih
  // Setiap sekolah memiliki akses ke 4 jalur yang sama
  const jalurUntukSekolahDipilih = useMemo(() => {
    if (!data.sekolah) return [];
    return jalurList; // Tampilkan semua 4 jalur standar untuk setiap sekolah
  }, [data.sekolah, jalurList]);

  const isCustom = !!data.jalur_custom || !!data.sekolah_custom;

  return (
    <div>
      <SectionTitle title="Pilih Sekolah Tujuan Terlebih Dahulu" />
      {loadingOpsi && (
        <div style={{ marginBottom: 12, fontSize: 12.5, color: "#7a8fa8" }}>
          Memuat opsi pendaftaran dari server...
        </div>
      )}

      {!isCustom && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {sekolahList.map((s) => {
            const active = data.sekolah === s.id_sekolah;
            return (
              <div key={s.id_sekolah}>
                <div
                  onClick={() => onChange("sekolah", s.id_sekolah)}
                  style={{
                    border: `2px solid ${active ? "#3a7bd5" : "#dde6f4"}`,
                    borderRadius: 10,
                    padding: "13px 16px",
                    cursor: "pointer",
                    background: active ? "#eff6ff" : "#fff",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    transition: "all .2s",
                    userSelect: "none",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: active ? "#3a7bd5" : "#0d2240",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    {s.id_sekolah.replace("ST", "")}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13.5, fontWeight: active ? 700 : 500, color: "#1c2e4a", display: "block" }}>
                      {s.nama_sekolah} ({s.jenjang})
                    </span>
                    <span style={{ fontSize: 12, color: "#7a8fa8" }}>
                      Kuota: {s.kuota} siswa
                    </span>
                  </div>
                  {active && (
                    <span
                      style={{
                        background: "#dbeafe",
                        color: "#1e40af",
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "2px 10px",
                        borderRadius: 20,
                      }}
                    >
                      Dipilih
                    </span>
                  )}
                </div>

                {/* Tampilkan jalur yang tersedia untuk sekolah ini jika sekolah dipilih */}
                {active && jalurUntukSekolahDipilih.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginTop: 10, marginLeft: 8, marginBottom: 12, paddingLeft: 12, borderLeft: "3px solid #dbeafe" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#6a7d9b", alignSelf: "center", gridColumn: "1 / -1" }}>
                      Jalur yang tersedia untuk sekolah ini:
                    </div>
                    {jalurUntukSekolahDipilih.map((j) => {
                      const jalurActive = data.jalur === j.id_jalur;
                      return (
                        <div
                          key={j.id_jalur}
                          onClick={() => onChange("jalur", j.id_jalur)}
                          style={{
                            border: `2px solid ${jalurActive ? "#3a7bd5" : "#dde6f4"}`,
                            borderRadius: 8,
                            padding: "10px 12px",
                            cursor: "pointer",
                            background: jalurActive ? "#eff6ff" : "#fff",
                            transition: "all .2s",
                            userSelect: "none",
                            textAlign: "center",
                          }}
                        >
                          <div style={{ fontWeight: 700, fontSize: 12, color: "#1c2e4a", marginBottom: 3 }}>
                            {j.nama_jalur}
                          </div>
                          <div style={{ fontSize: 10, color: "#7a8fa8" }}>
                            Kuota {j.persentase_kuota}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {active && jalurUntukSekolahDipilih.length === 0 && (
                  <div style={{ marginTop: 8, marginLeft: 8, fontSize: 12, color: "#92400e", padding: "8px 12px", background: "#fffbeb", borderRadius: 8, border: "1px solid #fde68a" }}>
                    ⚠️ Tidak ada jalur yang tersedia untuk sekolah ini
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <button
          type="button"
          onClick={() => {
            if (!isCustom) {
              onChange("jalur_custom", "");
              onChange("sekolah_custom", "");
              onChange("sekolah", "");
              onChange("jalur", "");
            } else {
              onChange("jalur_custom", "");
              onChange("sekolah_custom", "");
            }
          }}
          style={{
            background: isCustom ? "#fef3c7" : "#eef2ff",
            border: "1px solid #e6e9f2",
            color: "#0d2240",
            padding: "8px 12px",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          {isCustom ? "Gunakan opsi daftar" : "Isi jalur/sekolah sendiri"}
        </button>
      </div>

      {isCustom && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginBottom: 24 }}>
          <Field label="Nama Sekolah Tujuan (tuliskan sendiri)" required>
            <Input
              type="text"
              placeholder="Contoh: SMA Swasta Harapan Bangsa"
              value={data.sekolah_custom || ''}
              onChange={(e) => onChange('sekolah_custom', e.target.value)}
            />
          </Field>
          <Field label="Nama Jalur (tuliskan sendiri)" required>
            <Input
              type="text"
              placeholder="Contoh: Jalur Prestasi Lokal"
              value={data.jalur_custom || ''}
              onChange={(e) => onChange('jalur_custom', e.target.value)}
            />
          </Field>
        </div>
      )}

      <div
        style={{
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: 10,
          padding: "13px 16px",
          fontSize: 13,
          color: "#1e40af",
          lineHeight: 1.65,
        }}
      >
        Periode Pendaftaran: <strong>{periodeText}</strong>.
        Pastikan sekolah dan jalur yang dipilih sesuai dengan dokumen yang akan diunggah.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  LANGKAH 3: Upload Dokumen
// ─────────────────────────────────────────────
function LangkahTiga({ files, onFileChange }) {
  return (
    <div>
      <SectionTitle title="Unggah Dokumen Persyaratan" />
      <p style={{ fontSize: 13.5, color: "#7a8fa8", marginBottom: 20, lineHeight: 1.65 }}>
        Format yang diterima: PDF, JPG, PNG. Ukuran maksimal <strong>2 MB</strong> per file.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {DOKUMEN_LIST.map((dok) => {
          const uploaded = !!files[dok.key];
          return (
            <div
              key={dok.key}
              style={{
                border: `1.5px solid ${uploaded ? "#86efac" : "#dde6f4"}`,
                borderRadius: 12,
                padding: "16px 18px",
                background: uploaded ? "#f0fdf4" : "#fff",
                transition: "all .2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: 13.5, color: "#1c2e4a" }}>
                    {dok.label}
                  </span>
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "1px 8px",
                      borderRadius: 20,
                      background: dok.wajib ? "#fee2e2" : "#f0fdf4",
                      color: dok.wajib ? "#b91c1c" : "#15803d",
                    }}
                  >
                    {dok.wajib ? "Wajib" : "Opsional"}
                  </span>
                </div>
                {uploaded && (
                  <span style={{ fontSize: 12, color: "#15803d", fontWeight: 600 }}>
                    Terupload
                  </span>
                )}
              </div>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => onFileChange(dok.key, e.target.files[0])}
                style={{
                  fontSize: 13,
                  color: "#4a5568",
                  cursor: "pointer",
                  width: "100%",
                }}
              />
              {uploaded && (
                <div style={{ marginTop: 6, fontSize: 12, color: "#15803d" }}>
                  File: {files[dok.key].name} ({(files[dok.key].size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 20,
          background: "#fffbeb",
          border: "1px solid #fde68a",
          borderRadius: 10,
          padding: "13px 16px",
          fontSize: 13,
          color: "#92400e",
          lineHeight: 1.65,
        }}
      >
        Pastikan semua dokumen <strong>wajib</strong> sudah diunggah sebelum mengirim pendaftaran.
        Dokumen yang tidak lengkap akan menyebabkan pendaftaran tidak diproses.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  LANGKAH 4: Sukses
// ─────────────────────────────────────────────
function Sukses({ nomorPendaftaran, onSelesai }) {
  return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#1a9e5a", marginBottom: 16 }}>Pendaftaran Terkirim</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1c2e4a", marginBottom: 8 }}>
        Pendaftaran Berhasil Dikirim!
      </h2>
      <p style={{ fontSize: 14, color: "#7a8fa8", marginBottom: 24, lineHeight: 1.7 }}>
        Data Anda telah tersimpan di sistem PPDB. Pantau status pendaftaran
        secara berkala melalui menu <strong>Cek Status</strong>.
      </p>
      <div
        style={{
          display: "inline-block",
          background: "#f0f4fa",
          borderRadius: 12,
          padding: "16px 32px",
          marginBottom: 24,
        }}
      >
        <div style={{ fontSize: 12, color: "#7a8fa8", marginBottom: 4 }}>Nomor Pendaftaran Anda</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#0d2240", letterSpacing: 2 }}>
          {nomorPendaftaran}
        </div>
      </div>
      <p style={{ fontSize: 13, color: "#7a8fa8" }}>
        Simpan nomor ini dan cek email Anda untuk konfirmasi pendaftaran.
      </p>
      <button
        onClick={() => onSelesai?.()}
        style={{
          marginTop: 24,
          background: "#0d2240",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          padding: "12px 28px",
          fontWeight: 700,
          fontSize: 14,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        Daftar Akun Lain
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
//  HELPER KOMPONEN KECIL
// ─────────────────────────────────────────────
function SectionTitle({ title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
      <span style={{ fontWeight: 700, fontSize: 14, color: "#1c2e4a" }}>{title}</span>
    </div>
  );
}

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 14,
  marginBottom: 14,
};

// ─────────────────────────────────────────────
//  INDIKATOR LANGKAH (Step Indicator)
// ─────────────────────────────────────────────
const LANGKAH_LIST = [
  { no: 1, label: "Data Diri & Akun" },
  { no: 2, label: "Jalur & Sekolah" },
  { no: 3, label: "Upload Dokumen" },
];

function StepIndicator({ langkah }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "20px 28px",
        borderBottom: "1px solid #dde6f4",
        background: "#f8fafd",
        gap: 0,
      }}
    >
      {LANGKAH_LIST.map((s, i) => (
        <div key={s.no} style={{ display: "flex", alignItems: "center", flex: i < LANGKAH_LIST.length - 1 ? 1 : 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 13,
                background:
                  langkah > s.no ? "#1a9e5a" :
                  langkah === s.no ? "#0d2240" : "#dde6f4",
                color:
                  langkah >= s.no ? "#fff" : "#7a8fa8",
                transition: "all .3s",
              }}
            >
              {langkah > s.no ? "✓" : s.no}
            </div>
            <span
              style={{
                fontSize: 12.5,
                fontWeight: langkah === s.no ? 700 : 500,
                color: langkah === s.no ? "#0d2240" : langkah > s.no ? "#1a9e5a" : "#7a8fa8",
                whiteSpace: "nowrap",
              }}
            >
              {s.label}
            </span>
          </div>
          {i < LANGKAH_LIST.length - 1 && (
            <div
              style={{
                flex: 1,
                height: 2,
                margin: "0 12px",
                background: langkah > s.no ? "#1a9e5a" : "#dde6f4",
                borderRadius: 2,
                transition: "background .3s",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
//  VALIDASI PER LANGKAH
// ─────────────────────────────────────────────
function validasiLangkah(langkah, dataDiri, dataPilihan) {
  if (langkah === 1) {
    const { nisn, nik, nama_lengkap, jenis_kelamin,
            tanggal_lahir, desa, kecamatan, alamat_siswa, no_hp,
            asal_sekolah, nilai_rata } = dataDiri;
    if (!nisn || !nik || !nama_lengkap ||
        !jenis_kelamin || !tanggal_lahir || !desa || !kecamatan ||
        !alamat_siswa || !no_hp || !asal_sekolah || !nilai_rata)
      return "Harap lengkapi semua field yang wajib diisi.";
    if (nisn.length !== 10) return "NISN harus 10 digit.";
    if (nik.length !== 16) return "NIK harus 16 digit.";
  }
  if (langkah === 2) {
    // Harus pilih sekolah dan jalur
    if ((!dataPilihan.sekolah || !dataPilihan.jalur) && (!dataPilihan.sekolah_custom || !dataPilihan.jalur_custom)) {
      return "Pilih sekolah terlebih dahulu, maka jalur akan muncul otomatis. Atau isi sendiri nama sekolah dan jalur.";
    }
  }
  return null;
}

// ─────────────────────────────────────────────
//  KIRIM DATA KE API EXPRESS
//  POST /api/pendaftaran dengan FormData
// ─────────────────────────────────────────────
async function kirimPendaftaran(dataDiri, dataPilihan, files) {
  const formData = new FormData();

  // Data dari tabel Siswa
  formData.append("nisn",          dataDiri.nisn);
  formData.append("nik",           dataDiri.nik);
  formData.append("nama_lengkap",  dataDiri.nama_lengkap);
  formData.append("jenis_kelamin", dataDiri.jenis_kelamin);
  formData.append("tanggal_lahir", dataDiri.tanggal_lahir);
  formData.append("desa",          dataDiri.desa);
  formData.append("kecamatan",     dataDiri.kecamatan);
  formData.append("alamat_siswa",  dataDiri.alamat_siswa);
  formData.append("no_hp",         dataDiri.no_hp);
  formData.append("asal_sekolah",  dataDiri.asal_sekolah);
  formData.append("nilai_rata",    dataDiri.nilai_rata);

  // Data dari tabel Jalur_Daftar & Sekolah_Tujuan
  if (dataPilihan.jalur_custom && dataPilihan.sekolah_custom) {
    formData.append("nama_jalur_custom", dataPilihan.jalur_custom);
    formData.append("nama_sekolah_custom", dataPilihan.sekolah_custom);
  } else {
    formData.append("id_jalur",   dataPilihan.jalur);
    formData.append("id_sekolah", dataPilihan.sekolah);
  }

  // File dokumen (tabel Dokumen)
  DOKUMEN_LIST.forEach((dok) => {
    if (files[dok.key]) {
      formData.append(dok.key, files[dok.key]);
    }
  });

  const token = localStorage.getItem("ppdb_token") || "";

  const res = await fetch(`${API_BASE_URL}/pendaftaran`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
    // Jangan set Content-Type — browser otomatis isi boundary untuk FormData
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Terjadi kesalahan pada server.");
  }

  return await res.json();
  // Response yang diharapkan dari Express:
  // { success: true, nomorPendaftaran: "PPDB-2025-0001", id_siswa: "S..." }
}

// ─────────────────────────────────────────────
//  KOMPONEN UTAMA: FormPendaftaran
// ─────────────────────────────────────────────
function getSiswaLokal() {
  try { return JSON.parse(localStorage.getItem("ppdb_siswa")) || null; }
  catch { return null; }
}

function formatDateForInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export default function FormPendaftaran({ onKembali, onSelesai }) {
  const [langkah, setLangkah] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [nomorPendaftaran, setNomorPendaftaran] = useState("");
  const [loadingOpsi, setLoadingOpsi] = useState(true);

  const [opsiJalur, setOpsiJalur] = useState(
    JALUR_FALLBACK.map((j) => ({
      id_jalur: j.value,
      nama_jalur: j.label,
      persentase_kuota: Number(String(j.kuota).replace("%", "")) || 0,
    }))
  );

  const [opsiSekolah, setOpsiSekolah] = useState(
    SEKOLAH_FALLBACK.map((s, idx) => ({
      id_sekolah: s.value,
      nama_sekolah: s.label.split(" — ")[0],
      jenjang: s.label.includes("SMK") ? "SMK" : "SMA",
      kuota: Number((s.label.match(/Kuota:\s*(\d+)/)?.[1]) || 0),
    }))
  );

  const [periodeText, setPeriodeText] = useState("1 Juni - 30 Juni 2025 (Tahun Ajaran 2025/2026)");

  // State: Langkah 1 — data diri & akun
  const [dataDiri, setDataDiri] = useState({
    nisn: "", nik: "", nama_lengkap: "",
    jenis_kelamin: "", tanggal_lahir: "", desa: "", kecamatan: "",
    alamat_siswa: "", no_hp: "", asal_sekolah: "", nilai_rata: "",
  });

  // State: Langkah 2 — sekolah & jalur (sebaliknya: sekolah dulu, jalur follow)
  const [dataPilihan, setDataPilihan] = useState({ sekolah: "", jalur: "" });

  // State: Langkah 3 — file dokumen
  const [files, setFiles] = useState({
    kk: null, akta: null, ijazah: null, domisili: null, sertif: null,
  });

  const handleDiri = (key, val) => {
    setDataDiri((prev) => ({ ...prev, [key]: val }));
    setError("");
  };

  const handlePilihan = (key, val) => {
    setDataPilihan((prev) => ({ ...prev, [key]: val }));
    setError("");
  };

  const handleFile = (key, file) => {
    if (file && file.size > 2 * 1024 * 1024) {
      setError(`File ${file.name} melebihi batas 2 MB.`);
      return;
    }
    setFiles((prev) => ({ ...prev, [key]: file }));
    setError("");
  };

  const handleLanjut = () => {
    const err = validasiLangkah(langkah, dataDiri, dataPilihan);
    if (err) { setError(err); return; }
    setError("");
    setLangkah((l) => l + 1);
  };

  const handleKirim = async () => {
    // Cek dokumen wajib
    const kurang = DOKUMEN_LIST.filter((d) => d.wajib && !files[d.key]);
    if (kurang.length > 0) {
      setError(`Dokumen wajib belum diunggah: ${kurang.map((d) => d.label).join(", ")}`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await kirimPendaftaran(dataDiri, dataPilihan, files);
      setNomorPendaftaran(result.nomorPendaftaran || "PPDB-2025-XXXX");
      setLangkah(4); // Tampilkan halaman sukses
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-fill form dari akun siswa yang login
    const siswa = getSiswaLokal();
    if (siswa) {
      setDataDiri((prev) => ({
        ...prev,
        nisn: siswa.nisn || "",
        nik: siswa.nik || "",
        nama_lengkap: siswa.nama_lengkap || "",
        jenis_kelamin: siswa.jenis_kelamin || "",
        tanggal_lahir: formatDateForInput(siswa.tanggal_lahir),
        desa: siswa.desa || "",
        kecamatan: siswa.kecamatan || "",
        alamat_siswa: siswa.alamat_siswa || "",
        no_hp: siswa.no_hp || "",
        asal_sekolah: siswa.asal_sekolah || "",
        nilai_rata: siswa.nilai_rata || "",
      }));
    }

    // Fetch opsi jalur & sekolah dari server
    const fetchOpsi = async () => {
      try {
        const token = localStorage.getItem("ppdb_token") || "";
        const res = await fetch(`${API_BASE_URL}/pendaftaran/opsi`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Gagal mengambil opsi pendaftaran.");

        const json = await res.json();
        if (Array.isArray(json.jalur) && json.jalur.length > 0) {
          setOpsiJalur(json.jalur);
        }
        if (Array.isArray(json.sekolah) && json.sekolah.length > 0) {
          setOpsiSekolah(json.sekolah);
        }

        if (json.periode) {
          const rawMulai = json.periode.tanggal_mulai;
          const rawSelesai = json.periode.tanggal_selesai;
          const mulai = rawMulai ? new Date(rawMulai).toLocaleDateString("id-ID") : "-";
          const selesai = rawSelesai ? new Date(rawSelesai).toLocaleDateString("id-ID") : "-";
          setPeriodeText(`${mulai} - ${selesai} (Tahun Ajaran ${json.periode.tahun_ajaran || "-"})`);
        }
      } catch {
        // Tetap gunakan fallback agar form tetap bisa dipakai.
      } finally {
        setLoadingOpsi(false);
      }
    };

    fetchOpsi();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0f4fa",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "40px 16px",
        fontFamily: "'Sora', 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 700,
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 8px 40px rgba(13,34,64,.12)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #0d2240 0%, #1e4d8c 100%)",
            padding: "24px 28px",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "rgba(255,255,255,.55)", textTransform: "uppercase", marginBottom: 6 }}>
            PPDB Online Indramayu 2025/2026
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: 0 }}>
            Formulir Pendaftaran Peserta Didik Baru
          </h1>
        </div>

        {/* Step Indicator (hanya tampil di langkah 1–3) */}
        {langkah <= 3 && <StepIndicator langkah={langkah} />}

        {/* Konten Form */}
        <div style={{ padding: "28px 32px" }}>

          {/* Pesan Error */}
          {error && (
            <NoticeBox
              type="error"
              title="Terjadi kesalahan pada pendaftaran"
              message={error}
              className="mb-5"
            />
          )}

          {/* Konten per langkah */}
          {langkah === 1 && <LangkahSatu data={dataDiri} onChange={handleDiri} />}
          {langkah === 2 && (
            <LangkahDua
              data={dataPilihan}
              onChange={handlePilihan}
              jalurList={opsiJalur}
              sekolahList={opsiSekolah}
              periodeText={periodeText}
              loadingOpsi={loadingOpsi}
            />
          )}
          {langkah === 3 && <LangkahTiga files={files} onFileChange={handleFile} />}
          {langkah === 4 && <Sukses nomorPendaftaran={nomorPendaftaran} onSelesai={onSelesai} />}

          {/* Tombol Navigasi (hanya langkah 1–3) */}
          {langkah <= 3 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 28,
                paddingTop: 20,
                borderTop: "1px solid #dde6f4",
              }}
            >
              {langkah > 1 ? (
                <button
                  onClick={() => { setLangkah((l) => l - 1); setError(""); }}
                  style={{
                    background: "#f0f4fa",
                    color: "#1c2e4a",
                    border: "1.5px solid #dde6f4",
                    borderRadius: 10,
                    padding: "11px 24px",
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "background .2s",
                  }}
                >
                  Kembali
                </button>
              ) : (
                <button
                  onClick={() => onKembali?.()}
                  style={{
                    background: "#f0f4fa",
                    color: "#1c2e4a",
                    border: "1.5px solid #dde6f4",
                    borderRadius: 10,
                    padding: "11px 24px",
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "background .2s",
                  }}
                >
                  Kembali ke Dashboard
                </button>
              )}

              {langkah < 3 ? (
                <button
                  onClick={handleLanjut}
                  style={{
                    background: "#0d2240",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    padding: "11px 28px",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "background .2s",
                  }}
                >
                  Lanjut
                </button>
              ) : (
                <button
                  onClick={handleKirim}
                  disabled={loading}
                  style={{
                    background: loading ? "#7a8fa8" : "#1a9e5a",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    padding: "11px 28px",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                    transition: "background .2s",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                    {loading ? "Mengirim..." : "Kirim Pendaftaran"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
