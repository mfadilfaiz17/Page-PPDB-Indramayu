import { useState, useEffect } from "react";
import NoticeBox from "../../components/NoticeBox";

const BASE_URL = "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("ppdb_token") || "";
}
function getSiswa() {
  try { return JSON.parse(localStorage.getItem("ppdb_siswa")) || {}; }
  catch { return {}; }
}

// ─────────────────────────────────────────────
//  HELPER: kartu info
// ─────────────────────────────────────────────
function InfoCard({ label, value, sub, color = "#1c2e4a", bg = "#f8fafd" }) {
  return (
    <div style={{
      background: bg, borderRadius: 12,
      padding: "18px 22px",
      border: "1.5px solid #dde6f4",
    }}>
      <div style={{ fontSize: 12, color: "#7a8fa8", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1.2 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#7a8fa8", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────
//  HELPER: status besar di tengah
// ─────────────────────────────────────────────
function StatusBanner({ status }) {
  const map = {
    "Lulus": {
      bg: "#f0fdf4", border: "#86efac", color: "#166534",
      judul: "Selamat! Anda Dinyatakan Lulus",
      sub: "Segera lakukan daftar ulang sesuai jadwal yang ditentukan.",
    },
    "Cadangan": {
      bg: "#fffbeb", border: "#fde68a", color: "#92400e",
      judul: "Status Anda: Cadangan",
      sub: "Anda masuk daftar cadangan. Pantau terus pengumuman resmi.",
    },
    "Tidak Lulus": {
      bg: "#fff5f5", border: "#fecaca", color: "#9b1c1c",
      judul: "Maaf, Anda Tidak Lolos Seleksi",
      sub: "Jangan menyerah! Anda dapat mencoba jalur atau sekolah lain.",
    },
    "Belum": {
      bg: "#f0f4fa", border: "#dde6f4", color: "#4a5568",
      judul: "Hasil Seleksi Belum Diumumkan",
      sub: "Pengumuman dijadwalkan pada 7 Juli 2025. Pantau halaman ini secara berkala.",
    },
  };
  const s = map[status] || map["Belum"];
  return (
    <div style={{
      background: s.bg, border: `2px solid ${s.border}`,
      borderRadius: 16, padding: "28px 32px",
      textAlign: "center", marginBottom: 28,
    }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: s.color, marginBottom: 8 }}>
        {s.judul}
      </h2>
      <p style={{ fontSize: 13.5, color: "#7a8fa8", lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}>
        {s.sub}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
//  KOMPONEN UTAMA: HasilSeleksi
// ─────────────────────────────────────────────
export default function HasilSeleksi({ onKembali }) {
  const siswa = getSiswa();
  const [hasil, setHasil]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const fetchHasil = async () => {
      try {
        // GET /api/hasil-seleksi
        // Header: Authorization: Bearer <token>
        // Response: {
        //   status_hasil: "Lulus" | "Cadangan" | "Tidak Lulus" | null,
        //   peringkat: 5,
        //   tanggal_pengumuman: "7 Juli 2025",
        //   nama_sekolah: "SMA Negeri 1 Indramayu",
        //   nama_jalur: "Zonasi"
        // }
        const res = await fetch(`${API_BASE_URL}/hasil-seleksi`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) throw new Error("Gagal memuat hasil seleksi.");
        const data = await res.json();
        setHasil(data);
      } catch (err) {
        setError(err.message);
        // Data dummy — ganti status_hasil untuk melihat tampilan berbeda:
        // "Lulus" | "Cadangan" | "Tidak Lulus" | null
        setHasil({
          status_hasil:        "Lulus",
          peringkat:           5,
          tanggal_pengumuman:  "7 Juli 2025",
          nama_sekolah:        "SMA Negeri 1 Indramayu",
          nama_jalur:          "Zonasi",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchHasil();
  }, []);

  const statusTampil = hasil?.status_hasil || "Belum";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f0f4fa",
      fontFamily: "'Sora', 'Segoe UI', sans-serif",
    }}>

      {/* Navbar */}
      <nav style={{
        background: "#0d2240", padding: "0 32px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => onKembali?.()}
            style={{
              background: "rgba(255,255,255,.1)",
              border: "1px solid rgba(255,255,255,.2)",
              color: "#fff", borderRadius: 8,
              padding: "6px 14px", fontSize: 13,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >Kembali</button>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginLeft: 8 }}>
            Hasil Seleksi
          </span>
        </div>
      </nav>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px" }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1c2e4a", marginBottom: 4 }}>
            Hasil Seleksi PPDB 2025/2026
          </h1>
          <p style={{ fontSize: 13.5, color: "#7a8fa8" }}>
            Hasil seleksi resmi berdasarkan jalur dan nilai yang Anda daftarkan.
          </p>
        </div>

        {error && (
          <NoticeBox
            type="warning"
            title="Menggunakan data contoh"
            message={error}
            className="mb-5"
          />
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "#7a8fa8" }}>
            Memuat hasil seleksi...
          </div>
        ) : (
          <>
            {/* Banner status besar */}
            <StatusBanner status={statusTampil} />

            {/* Detail hasil (hanya tampil kalau sudah ada hasil) */}
            {hasil?.status_hasil && (
              <>
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 14, marginBottom: 24,
                }}>
                  <InfoCard
                    label="Status Akhir"
                    value={hasil.status_hasil}
                    color={
                      hasil.status_hasil === "Lulus"       ? "#166534" :
                      hasil.status_hasil === "Cadangan"    ? "#92400e" : "#9b1c1c"
                    }
                    bg={
                      hasil.status_hasil === "Lulus"       ? "#f0fdf4" :
                      hasil.status_hasil === "Cadangan"    ? "#fffbeb" : "#fff5f5"
                    }
                  />
                  <InfoCard
                    label="Peringkat"
                    value={`#${hasil.peringkat}`}
                    sub="Di jalur yang dipilih"
                  />
                  <InfoCard
                    label="Tanggal Pengumuman"
                    value={hasil.tanggal_pengumuman}
                    sub="Hasil resmi"
                  />
                </div>

                {/* Detail pendaftaran */}
                <div style={{
                  background: "#fff", borderRadius: 16,
                  padding: "22px 24px", marginBottom: 20,
                  boxShadow: "0 2px 16px rgba(13,34,64,.08)",
                }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1c2e4a", marginBottom: 16 }}>
                    Detail Pendaftaran
                  </div>
                  {[
                    { label: "Nama Siswa",     value: siswa.nama_lengkap },
                    { label: "NISN",           value: siswa.nisn },
                    { label: "Sekolah Tujuan", value: hasil.nama_sekolah },
                    { label: "Jalur",          value: hasil.nama_jalur },
                    { label: "Nilai Rata-rata",value: siswa.nilai_rata },
                  ].map((r, i, arr) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between",
                      alignItems: "center", padding: "10px 0",
                      borderBottom: i < arr.length - 1 ? "1px solid #f0f4fa" : "none",
                      fontSize: 13.5,
                    }}>
                      <span style={{ color: "#7a8fa8" }}>{r.label}</span>
                      <span style={{ fontWeight: 600, color: "#1c2e4a" }}>{r.value || "—"}</span>
                    </div>
                  ))}
                </div>

                {/* Info daftar ulang (hanya kalau Lulus) */}
                {hasil.status_hasil === "Lulus" && (
                  <div style={{
                    background: "#f0fdf4", border: "1px solid #86efac",
                    borderRadius: 12, padding: "16px 20px",
                    fontSize: 13.5, color: "#166534", lineHeight: 1.8,
                  }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Langkah Selanjutnya</div>
                    <ol style={{ margin: 0, paddingLeft: 18 }}>
                      <li>Datang ke sekolah tujuan pada jadwal daftar ulang</li>
                      <li>Bawa dokumen asli beserta fotokopi</li>
                      <li>Lakukan pembayaran administrasi jika diperlukan</li>
                      <li>Ikuti orientasi siswa baru sesuai jadwal</li>
                    </ol>
                  </div>
                )}
              </>
            )}

            {/* Belum ada hasil */}
            {!hasil?.status_hasil && (
              <div style={{
                background: "#fff", borderRadius: 16,
                padding: "32px", textAlign: "center",
                boxShadow: "0 2px 16px rgba(13,34,64,.08)",
              }}>
                <div style={{ fontSize: 13.5, color: "#7a8fa8", lineHeight: 1.8 }}>
                  Pastikan Anda telah menyelesaikan pendaftaran dan melengkapi<br />
                  semua dokumen wajib sebelum batas waktu.
                </div>
                <button
                  onClick={() => onKembali?.()}
                  style={{
                    marginTop: 20,
                    background: "#0d2240", color: "#fff",
                    border: "none", borderRadius: 10,
                    padding: "11px 28px", fontWeight: 700,
                    fontSize: 14, cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Kembali ke Dashboard
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
