import { useState, useEffect } from "react";

// ─────────────────────────────────────────────
//  KONFIGURASI API
// ─────────────────────────────────────────────
const BASE_URL = "http://localhost:5000/api";

// ─────────────────────────────────────────────
//  HELPER: ambil token & data siswa dari localStorage
// ─────────────────────────────────────────────
function getSiswa() {
  try {
    return JSON.parse(localStorage.getItem("ppdb_siswa")) || null;
  } catch {
    return null;
  }
}

function getToken() {
  return localStorage.getItem("ppdb_token") || "";
}

// ─────────────────────────────────────────────
//  HELPER: komponen kartu statistik
// ─────────────────────────────────────────────
function StatCard({ label, value, sub, color = "#0e7490" }) {
  return (
    <div style={{
      background: "#ffffff",
      borderRadius: 14,
      padding: "20px 22px",
      boxShadow: "0 8px 24px rgba(2, 8, 23, 0.08)",
      borderLeft: `4px solid ${color}`,
    }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0f172a", marginTop: 6 }}>
        {label}
      </div>
      {sub && (
        <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>{sub}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  HELPER: badge status
// ─────────────────────────────────────────────
function Badge({ status }) {
  const map = {
    "Lulus":        { bg: "#d1fae5", color: "#065f46", label: "Lulus" },
    "Cadangan":     { bg: "#cffafe", color: "#155e75", label: "Cadangan" },
    "Tidak Lulus":  { bg: "#fee2e2", color: "#9b1c1c", label: "Tidak Lulus" },
    "TERUPLOAD":    { bg: "#d1fae5", color: "#065f46", label: "Terupload" },
    "BELUM":        { bg: "#fee2e2", color: "#9b1c1c", label: "Belum" },
    "PROSES":       { bg: "#cffafe", color: "#155e75", label: "Diproses" },
    "Menunggu":     { bg: "#e2e8f0", color: "#334155", label: "Menunggu" },
  };
  const s = map[status] || map["Menunggu"];
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: 11.5, fontWeight: 700,
      padding: "3px 12px", borderRadius: 20,
      whiteSpace: "nowrap",
    }}>
      {s.label}
    </span>
  );
}

// ─────────────────────────────────────────────
//  HELPER: item baris info
// ─────────────────────────────────────────────
function InfoRow({ label, value }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between",
      alignItems: "center", padding: "10px 0",
      borderBottom: "1px solid #e2e8f0",
      fontSize: 13.5, gap: 12,
    }}>
      <span style={{ color: "#64748b", flexShrink: 0 }}>{label}</span>
      <span style={{ fontWeight: 600, color: "#0f172a", textAlign: "right" }}>{value || "-"}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
//  HELPER: judul seksi
// ─────────────────────────────────────────────
function SeksiJudul({ label, aksi, onAksi }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between",
      alignItems: "center", marginBottom: 16,
    }}>
      <div style={{
        fontSize: 15, fontWeight: 700, color: "#0f172a",
      }}>
        {label}
      </div>
      {aksi && (
        <button
          onClick={onAksi}
          style={{
            background: "transparent", border: "1.5px solid #cbd5e1",
            borderRadius: 8, padding: "5px 14px",
            fontSize: 12.5, fontWeight: 600, color: "#155e75",
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          {aksi}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  KOMPONEN UTAMA: Dashboard
// ─────────────────────────────────────────────
export default function Dashboard({ onLogout, onKeDaftar, onKeStatus, onKeHasil }) {
  const siswa = getSiswa();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [showDetail, setShowDetail] = useState(false);

  // ── Ambil data dashboard dari API ──
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // GET /api/dashboard
        // Header: Authorization: Bearer <token>
        // Response: {
        //   pendaftaran: { id_jalur, nama_jalur, id_sekolah, nama_sekolah, id_periode } | null,
        //   dokumen: [ { nama_dokumen, status_dokumen }, ... ],
        //   hasil: { status_hasil, peringkat, tanggal_pengumuman } | null
        // }
        const res = await fetch(`${API_BASE_URL}/dashboard`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) throw new Error("Gagal memuat data dashboard.");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
        // ── Set data kosong saat error ──
        setData({
          pendaftaran: null,
          dokumen: [],
          hasil: null,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Hitung dokumen terupload
  const totalDok    = data?.dokumen?.length || 0;
  const uploadedDok = data?.dokumen?.filter((d) => d.status_dokumen === "TERUPLOAD").length || 0;
  const pctDok      = totalDok > 0 ? Math.round((uploadedDok / totalDok) * 100) : 0;

  const handleLogout = () => {
    localStorage.removeItem("ppdb_token");
    localStorage.removeItem("ppdb_siswa");
    if (onLogout) onLogout();
  };

  const detailPendaftaran = data?.pendaftaran;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #020617 0%, #082f49 100%)",
      fontFamily: "'Sora', 'Segoe UI', sans-serif",
    }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        background: "#083344",
        padding: "0 32px",
        height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, background: "#cffafe",
            borderRadius: 8, display: "flex", alignItems: "center",
            justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#083344",
          }}>P</div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
            PPDB Indramayu
          </span>
          <span style={{
            background: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.6)",
            fontSize: 11, padding: "2px 10px", borderRadius: 20, marginLeft: 4,
          }}>
            2025/2026
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "rgba(255,255,255,.7)", fontSize: 13 }}>
            {siswa?.nama_lengkap || "Siswa"}
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: "rgba(255,255,255,.1)",
              border: "1px solid rgba(255,255,255,.2)",
              color: "rgba(255,255,255,.8)",
              borderRadius: 8, padding: "6px 14px",
              fontSize: 12.5, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Keluar
          </button>
        </div>
      </nav>

      {/* ── KONTEN UTAMA ── */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 20px" }}>

        {/* Sapaan */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>
            Halo, {siswa?.nama_lengkap?.split(" ")[0] || "Siswa"}
          </h1>
          <p style={{ fontSize: 14, color: "#94a3b8" }}>
            Selamat datang di portal PPDB. Pantau status pendaftaran Anda di sini.
          </p>
          {data && !loading && (
            <button
              onClick={() => onKeDaftar?.()}
              style={{
                marginTop: 16,
                background: "#cffafe",
                color: "#083344",
                border: "1px solid #a5f3fc",
                borderRadius: 10,
                padding: "10px 16px",
                fontSize: 13.5,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 8px 18px rgba(2, 8, 23, 0.08)",
              }}
            >
              {data.pendaftaran ? "Ubah Jalur & Sekolah Tujuan" : "Pilih Jalur & Sekolah Tujuan"}
            </button>
          )}
        </div>

        {/* Error banner (kalau API gagal, pakai data dummy) */}
        {error && (
          <div style={{
            background: "#ecfeff", border: "1px solid #a5f3fc",
            borderRadius: 10, padding: "10px 16px",
            fontSize: 12.5, color: "#155e75", marginBottom: 20,
          }}>
            Menggunakan data contoh - {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#94a3b8", fontSize: 14 }}>
            Memuat data...
          </div>
        ) : (
          <>
            {/* ── STAT CARDS ── */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16, marginBottom: 28,
            }}>
              <StatCard
                label="Status Pendaftaran"
                value={data?.pendaftaran ? "Terdaftar" : "Belum Daftar"}
                sub={data?.pendaftaran?.nama_jalur || "—"}
                color={data?.pendaftaran ? "#059669" : "#155e75"}
              />
              <StatCard
                label="Dokumen Terupload"
                value={`${uploadedDok}/${totalDok}`}
                sub={`${pctDok}% selesai`}
                color="#0e7490"
              />
              <StatCard
                label="Hasil Seleksi"
                value={data?.hasil?.status_hasil || "Belum Diumumkan"}
                sub={data?.hasil ? `Peringkat #${data.hasil.peringkat}` : "Pengumuman 7 Juli 2025"}
                color={
                  data?.hasil?.status_hasil === "Lulus" ? "#1a9e5a" :
                  data?.hasil?.status_hasil === "Cadangan" ? "#0e7490" : "#64748b"
                }
              />
            </div>

            {/* ── GRID BAWAH ── */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
            }}>

              {/* Kartu: Data Pendaftaran */}
              <div style={{
                background: "#fff", borderRadius: 16,
                padding: "22px 24px",
                boxShadow: "0 2px 16px rgba(13,34,64,.08)",
              }}>
                <SeksiJudul
                  label="Data Pendaftaran"
                  aksi={data?.pendaftaran ? (showDetail ? "Sembunyikan Detail" : "Lihat Detail") : "Daftar Sekarang"}
                  onAksi={() => {
                    if (!data?.pendaftaran) {
                      onKeDaftar?.();
                      return;
                    }
                    setShowDetail((prev) => !prev);
                  }}
                />
                {data?.pendaftaran ? (
                  <>
                    <InfoRow label="Jalur"         value={data.pendaftaran.nama_jalur} />
                    <InfoRow label="Sekolah Tujuan" value={data.pendaftaran.nama_sekolah} />
                    {showDetail && (
                      <>
                        <InfoRow label="Tahun Ajaran"  value={detailPendaftaran.tahun_ajaran} />
                        <InfoRow label="Tanggal Daftar" value={detailPendaftaran.tanggal_daftar} />
                      </>
                    )}
                  </>
                ) : (
                  <div style={{
                    textAlign: "center", padding: "24px 0",
                    color: "#64748b", fontSize: 13.5,
                  }}>
                    <div style={{ fontSize: 13, marginBottom: 8, fontWeight: 700 }}>Belum Terdaftar</div>
                    Anda belum mendaftar.<br />
                    <span
                      onClick={() => onKeDaftar?.()}
                      style={{ color: "#155e75", fontWeight: 700, cursor: "pointer" }}
                    >
                      Klik di sini untuk mendaftar
                    </span>
                  </div>
                )}
              </div>

              {/* Kartu: Status Dokumen */}
              <div style={{
                background: "#fff", borderRadius: 16,
                padding: "22px 24px",
                boxShadow: "0 2px 16px rgba(13,34,64,.08)",
              }}>
                <SeksiJudul
                  label="Status Dokumen"
                  aksi="Kelola Dokumen"
                  onAksi={() => onKeStatus?.()}
                />

                {/* Progress bar */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    fontSize: 12, color: "#64748b", marginBottom: 6,
                  }}>
                    <span>Kelengkapan dokumen</span>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>{pctDok}%</span>
                  </div>
                  <div style={{
                    height: 8, background: "#e2e8f0", borderRadius: 8,
                  }}>
                    <div style={{
                      height: "100%", borderRadius: 8,
                      width: `${pctDok}%`,
                      background: pctDok === 100 ? "#059669" : "#0e7490",
                      transition: "width .5s",
                    }} />
                  </div>
                </div>

                {data?.dokumen?.map((dok, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center", padding: "8px 0",
                    borderBottom: i < data.dokumen.length - 1 ? "1px solid #e2e8f0" : "none",
                  }}>
                    <span style={{ fontSize: 13, color: "#0f172a" }}>
                      {dok.nama_dokumen}
                    </span>
                    <Badge status={dok.status_dokumen} />
                  </div>
                ))}
              </div>

              {/* Kartu: Hasil Seleksi */}
              <div style={{
                background: "#fff", borderRadius: 16,
                padding: "22px 24px",
                boxShadow: "0 2px 16px rgba(13,34,64,.08)",
                gridColumn: "1 / -1",
              }}>
                <SeksiJudul
                  label="Hasil Seleksi"
                  aksi={data?.hasil ? "Lihat Detail" : undefined}
                  onAksi={() => onKeHasil?.()}
                />

                {data?.hasil ? (
                  <div style={{
                    display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16,
                  }}>
                    <div style={{
                      background: "#f1f5f9", borderRadius: 12, padding: "16px 20px",
                    }}>
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Status</div>
                      <Badge status={data.hasil.status_hasil} />
                    </div>
                    <div style={{
                      background: "#f1f5f9", borderRadius: 12, padding: "16px 20px",
                    }}>
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Peringkat</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>
                        #{data.hasil.peringkat}
                      </div>
                    </div>
                    <div style={{
                      background: "#f1f5f9", borderRadius: 12, padding: "16px 20px",
                    }}>
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                        Tanggal Pengumuman
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
                        {data.hasil.tanggal_pengumuman}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    textAlign: "center", padding: "28px 0",
                    color: "#64748b", fontSize: 13.5, lineHeight: 1.7,
                  }}>
                    <div style={{ fontSize: 13, marginBottom: 10, fontWeight: 700 }}>Menunggu Pengumuman</div>
                    Hasil seleksi belum diumumkan.<br />
                    Pengumuman dijadwalkan pada <strong style={{ color: "#0f172a" }}>7 Juli 2025</strong>.
                  </div>
                )}
              </div>

            </div>

            {/* ── DATA DIRI SISWA ── */}
            <div style={{
              background: "#fff", borderRadius: 16,
              padding: "22px 24px", marginTop: 20,
              boxShadow: "0 2px 16px rgba(13,34,64,.08)",
            }}>
              <SeksiJudul label="Data Diri Saya" />
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px",
              }}>
                <InfoRow label="NISN"          value={siswa?.nisn} />
                <InfoRow label="NIK"           value={siswa?.nik} />
                <InfoRow label="Nama Lengkap"  value={siswa?.nama_lengkap} />
                <InfoRow label="Jenis Kelamin" value={siswa?.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"} />
                <InfoRow label="Tanggal Lahir" value={siswa?.tanggal_lahir} />
                <InfoRow label="No. HP"        value={siswa?.no_hp} />
                <InfoRow label="Asal Sekolah"  value={siswa?.asal_sekolah} />
                <InfoRow label="Nilai Rata-rata" value={siswa?.nilai_rata} />
              </div>
            </div>

          </>
        )}
      </div>
    </div>
  );
}
