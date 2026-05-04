import { useState, useEffect } from "react";
import NoticeBox from "../../components/NoticeBox";

const BASE_URL = "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("ppdb_token") || "";
}

// ─────────────────────────────────────────────
//  DATA JENIS DOKUMEN (dari ERD: Jenis_Dokumen)
// ─────────────────────────────────────────────
const JENIS_DOKUMEN = [
  { id: "JD01", nama_dokumen: "Kartu Keluarga (KK)",       sifat: "Wajib" },
  { id: "JD02", nama_dokumen: "Akta Kelahiran",             sifat: "Wajib" },
  { id: "JD03", nama_dokumen: "Ijazah / SKL",               sifat: "Wajib" },
  { id: "JD04", nama_dokumen: "Sertifikat Prestasi",        sifat: "Opsional" },
  { id: "JD05", nama_dokumen: "Surat Keterangan Domisili",  sifat: "Wajib" },
];

// ─────────────────────────────────────────────
//  HELPER: badge status dokumen
// ─────────────────────────────────────────────
function Badge({ status, sifat }) {
  if (sifat) {
    const s = sifat === "Wajib"
      ? { bg: "#fee2e2", color: "#9b1c1c" }
      : { bg: "#d1fae5", color: "#065f46" };
    return (
      <span style={{
        background: s.bg, color: s.color,
        fontSize: 11, fontWeight: 700,
        padding: "2px 10px", borderRadius: 20,
      }}>{sifat}</span>
    );
  }

  const map = {
    "TERUPLOAD": { bg: "#d1fae5", color: "#065f46", label: "Terupload" },
    "PROSES":    { bg: "#fef3c7", color: "#92400e", label: "Diverifikasi" },
    "DITOLAK":   { bg: "#fee2e2", color: "#9b1c1c", label: "Ditolak" },
    "BELUM":     { bg: "#f0f4fa", color: "#4a5568", label: "Belum Upload" },
  };
  const s = map[status] || map["BELUM"];
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: 11.5, fontWeight: 700,
      padding: "3px 12px", borderRadius: 20,
      whiteSpace: "nowrap",
    }}>{s.label}</span>
  );
}

// ─────────────────────────────────────────────
//  HELPER: satu baris dokumen
// ─────────────────────────────────────────────
function DokumenRow({ dok, statusDok, onUpload, uploading }) {
  const sudahUpload = statusDok === "TERUPLOAD" || statusDok === "PROSES";

  return (
    <div style={{
      border: `1.5px solid ${sudahUpload ? "#a7f3d0" : "#dde6f4"}`,
      borderRadius: 12,
      padding: "16px 20px",
      background: sudahUpload ? "#f0fdf4" : "#fff",
      transition: "all .2s",
    }}>
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap", gap: 10,
      }}>
        {/* Info dokumen */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            minWidth: 88,
            height: 28,
            padding: "0 10px",
            borderRadius: 999,
            background: sudahUpload ? "#d1fae5" : "#f0f4fa",
            color: sudahUpload ? "#166534" : "#475569",
            display: "flex", alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 700,
            flexShrink: 0,
          }}>
            {sudahUpload ? "Sudah Upload" : "Belum Upload"}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: "#1c2e4a" }}>
              {dok.nama_dokumen}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <Badge sifat={dok.sifat} />
              <Badge status={statusDok || "BELUM"} />
            </div>
          </div>
        </div>

        {/* Tombol upload */}
        <div>
          <label style={{
            background: sudahUpload ? "#f0f4fa" : "#0d2240",
            color: sudahUpload ? "#7a8fa8" : "#fff",
            border: sudahUpload ? "1.5px solid #dde6f4" : "none",
            borderRadius: 9, padding: "8px 18px",
            fontSize: 12.5, fontWeight: 700,
            cursor: uploading ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            display: "inline-block",
            transition: "all .2s",
          }}>
            {uploading ? "Mengupload..." : sudahUpload ? "Ganti File" : "Upload"}
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: "none" }}
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) onUpload(dok.id, file);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>

      {/* Pesan ditolak */}
      {statusDok === "DITOLAK" && (
        <div style={{
          marginTop: 12,
          background: "#fff5f5", border: "1px solid #fed7d7",
          borderRadius: 8, padding: "10px 14px",
          fontSize: 12.5, color: "#c53030",
        }}>
          Dokumen ditolak oleh panitia. Silakan upload ulang dengan file yang benar.
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  KOMPONEN UTAMA: StatusDokumen
// ─────────────────────────────────────────────
export default function StatusDokumen({ onKembali }) {
  const [statusMap, setStatusMap]     = useState({});
  const [loading, setLoading]         = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  const [pesan, setPesan]             = useState(null);
  const [error, setError]             = useState("");

  // ── Ambil status semua dokumen dari API ──
  useEffect(() => {
    const fetchDokumen = async () => {
      try {
        // GET /api/dokumen
        // Header: Authorization: Bearer <token>
        // Response: [ { id_jenis_dokumen, status_dokumen }, ... ]
        const res = await fetch(`${BASE_URL}/dokumen`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) throw new Error("Gagal memuat data dokumen.");
        const data = await res.json();

        // Ubah array jadi object: { JD01: "TERUPLOAD", JD02: "BELUM", ... }
        const map = {};
        data.forEach((d) => { map[d.id_jenis_dokumen] = d.status_dokumen; });
        setStatusMap(map);
      } catch (err) {
        setError(err.message);
        // Data dummy untuk preview
        setStatusMap({ JD01: "TERUPLOAD", JD02: "TERUPLOAD", JD03: "PROSES" });
      } finally {
        setLoading(false);
      }
    };
    fetchDokumen();
  }, []);

  // ── Upload satu file dokumen ──
  const handleUpload = async (idJenis, file) => {
    if (file.size > 2 * 1024 * 1024) {
      setPesan({ type: "error", text: `File terlalu besar. Maksimal 2 MB.` });
      return;
    }

    setUploadingId(idJenis);
    setPesan(null);

    try {
      const formData = new FormData();
      formData.append("id_jenis_dokumen", idJenis);
      formData.append("file", file);

      // POST /api/dokumen/upload
      // Body: FormData { id_jenis_dokumen, file }
      // Response: { success: true, status_dokumen: "TERUPLOAD" }
      const res = await fetch(`${BASE_URL}/dokumen/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload gagal.");

      setStatusMap((prev) => ({ ...prev, [idJenis]: "TERUPLOAD" }));
      setPesan({ type: "success", text: `Dokumen berhasil diupload!` });
    } catch (err) {
      setPesan({ type: "error", text: err.message });
    } finally {
      setUploadingId(null);
    }
  };

  // Hitung statistik
  const total    = JENIS_DOKUMEN.length;
  const uploaded = JENIS_DOKUMEN.filter((d) => statusMap[d.id] === "TERUPLOAD" || statusMap[d.id] === "PROSES").length;
  const pct      = Math.round((uploaded / total) * 100);
  const wajibKurang = JENIS_DOKUMEN.filter(
    (d) => d.sifat === "Wajib" && !statusMap[d.id] || statusMap[d.id] === "DITOLAK"
  ).length;

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
            Status Dokumen
          </span>
        </div>
      </nav>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1c2e4a", marginBottom: 4 }}>
            Dokumen Persyaratan
          </h1>
          <p style={{ fontSize: 13.5, color: "#7a8fa8", lineHeight: 1.6 }}>
            Upload semua dokumen wajib sebelum batas waktu pendaftaran.
            Format diterima: PDF, JPG, PNG. Maksimal 2 MB per file.
          </p>
        </div>

        {/* Progress keseluruhan */}
        <div style={{
          background: "#fff", borderRadius: 14,
          padding: "20px 24px", marginBottom: 24,
          boxShadow: "0 2px 16px rgba(13,34,64,.08)",
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 10,
          }}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1c2e4a" }}>
                Kelengkapan Dokumen
              </span>
              {wajibKurang > 0 && (
                <span style={{
                  marginLeft: 10, fontSize: 12, fontWeight: 700,
                  background: "#fee2e2", color: "#9b1c1c",
                  padding: "2px 10px", borderRadius: 20,
                }}>
                  {wajibKurang} wajib belum lengkap
                </span>
              )}
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#1c2e4a" }}>{pct}%</span>
          </div>
          <div style={{ height: 10, background: "#f0f4fa", borderRadius: 8 }}>
            <div style={{
              height: "100%", borderRadius: 8,
              width: `${pct}%`,
              background: pct === 100 ? "#1a9e5a" : "#3a7bd5",
              transition: "width .6s",
            }} />
          </div>
          <div style={{
            display: "flex", justifyContent: "space-between",
            fontSize: 12, color: "#7a8fa8", marginTop: 8,
          }}>
            <span>{uploaded} dari {total} dokumen terupload</span>
            {pct === 100 && (
              <span style={{ color: "#1a9e5a", fontWeight: 700 }}>Semua dokumen lengkap</span>
            )}
          </div>
        </div>

        {/* Pesan sukses / error */}
        {pesan && (
          <NoticeBox
            type={pesan.type}
            message={pesan.text}
            className="mb-4"
          />
        )}

        {error && (
          <NoticeBox
            type="warning"
            title="Menggunakan data contoh"
            message={error}
            className="mb-4"
          />
        )}

        {/* Daftar dokumen */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#7a8fa8" }}>
            Memuat data dokumen...
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {JENIS_DOKUMEN.map((dok) => (
              <DokumenRow
                key={dok.id}
                dok={dok}
                statusDok={statusMap[dok.id]}
                onUpload={handleUpload}
                uploading={uploadingId === dok.id}
              />
            ))}
          </div>
        )}

        {/* Info tambahan */}
        <NoticeBox
          type="info"
          title="Informasi verifikasi"
          message="Dokumen yang sudah diupload akan diverifikasi oleh panitia. Status akan berubah menjadi Diverifikasi saat sedang diperiksa. Jika dokumen Ditolak, segera upload ulang dengan file yang benar."
          className="mt-6"
        />
      </div>
    </div>
  );
}
