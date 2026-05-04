import { useEffect, useState } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";

const STATS = [
  { label: "Total Pendaftar",     value: "248",  sub: "Tahun ajaran 2025/2026", color: "bg-blue-50 text-blue-700",   border: "border-blue-200" },
  { label: "Dokumen Diverifikasi",value: "183",  sub: "73% dari total pendaftar",color: "bg-green-50 text-green-700", border: "border-green-200" },
  { label: "Menunggu Verifikasi", value: "41",   sub: "Perlu ditinjau",          color: "bg-amber-50 text-amber-700", border: "border-amber-200" },
  { label: "Hasil Diumumkan",     value: "200",  sub: "Sudah mendapat keputusan",color: "bg-slate-50 text-slate-700", border: "border-slate-200" },
];

const JALUR_DATA = [
  { jalur: "Zonasi",                kuota: "50%", pendaftar: 124, diterima: 100 },
  { jalur: "Prestasi",              kuota: "30%", pendaftar: 74,  diterima: 60  },
  { jalur: "Afirmasi",              kuota: "10%", pendaftar: 31,  diterima: 20  },
  { jalur: "Perpindahan Orang Tua", kuota: "10%", pendaftar: 19,  diterima: 20  },
];

const PENDAFTAR_TERBARU = [
  { nama: "Arda Guler",     sekolah: "SMAN 1 Indramayu", jalur: "Zonasi",   status: "Lulus" },
  { nama: "Brahim Diaz",    sekolah: "SMAN 2 Indramayu", jalur: "Prestasi", status: "Lulus" },
  { nama: "Trent Arnold",   sekolah: "SMKN 1 Indramayu", jalur: "Zonasi",   status: "Lulus" },
  { nama: "Kylian Mbappe",  sekolah: "SMKN 2 Indramayu", jalur: "Afirmasi", status: "Tidak Lulus" },
  { nama: "Fede Valverde",  sekolah: "SMAN 1 Indramayu", jalur: "Prestasi", status: "Lulus" },
];

function StatusBadge({ status }) {
  const map = {
    "Lulus":       "bg-green-100 text-green-700",
    "Cadangan":    "bg-amber-100 text-amber-700",
    "Tidak Lulus": "bg-red-100 text-red-700",
    "Menunggu":    "bg-slate-100 text-slate-600",
  };
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${map[status] || map["Menunggu"]}`}>
      {status}
    </span>
  );
}

export default function DashboardAdmin({ onLogout, onNavigate }) {
  const [recent, setRecent] = useState(PENDAFTAR_TERBARU);
  const [total, setTotal] = useState(248);

  useEffect(() => {
    const fetchRingkasan = async () => {
      try {
        const token = localStorage.getItem("ppdb_token") || "";
        const res = await fetch("http://localhost:5000/api/pendaftaran/admin", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const json = await res.json();
        if (Array.isArray(json) && json.length > 0) {
          setRecent(
            json.slice(0, 5).map((item) => ({
              nama: item.nama_lengkap,
              sekolah: item.nama_sekolah,
              jalur: item.nama_jalur,
              status: item.status,
            }))
          );
          setTotal(json.length);
        }
      } catch {
        // fallback static data tetap dipakai
      }
    };

    fetchRingkasan();
  }, []);

  const stats = STATS.map((s) => {
    if (s.label === "Total Pendaftar") return { ...s, value: String(total) };
    if (s.label === "Hasil Diumumkan") return { ...s, value: String(Math.min(total, 200)) };
    return s;
  });

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      <SidebarAdmin aktif="admin.dashboard" onNavigate={onNavigate} onLogout={onLogout} />

      <main className="flex-1 overflow-y-auto">
        {/* Topbar */}
        <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-base font-bold text-slate-800">Dashboard</h1>
            <p className="text-xs text-slate-500">Ringkasan data PPDB Indramayu 2025/2026</p>
          </div>
          <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
            Periode: 1 Juni – 30 Juni 2025
          </div>
        </div>

        <div className="p-8 space-y-6">

          {/* Stat Cards */}
          <div className="grid grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div key={i} className={`bg-white rounded-xl border ${s.border} p-5`}>
                <div className={`text-2xl font-bold ${s.color.split(" ")[1]} mb-1`}>{s.value}</div>
                <div className="text-sm font-semibold text-slate-700">{s.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6">

            {/* Rekapitulasi Jalur */}
            <div className="col-span-1 bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-bold text-slate-700 mb-4">Rekapitulasi Jalur</h2>
              <div className="space-y-3">
                {JALUR_DATA.map((j, i) => {
                  const pct = Math.round((j.pendaftar / 248) * 100);
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span className="font-medium">{j.jalur}</span>
                        <span>{j.pendaftar} pendaftar</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full">
                        <div className="h-1.5 bg-[#0d2240] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tabel kuota */}
              <div className="mt-5 border-t border-slate-100 pt-4">
                <div className="text-xs font-semibold text-slate-500 mb-2">Kuota per Jalur</div>
                {JALUR_DATA.map((j, i) => (
                  <div key={i} className="flex justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                    <span className="text-slate-600">{j.jalur}</span>
                    <div className="flex gap-3 text-slate-500">
                      <span>Kuota {j.kuota}</span>
                      <span className="text-green-600 font-medium">Diterima {j.diterima}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabel pendaftar terbaru */}
            <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-700">Pendaftar Terbaru</h2>
                <button
                  onClick={() => onNavigate("admin.pendaftar")}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  Lihat Semua
                </button>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-slate-500 font-semibold pb-2">Nama Siswa</th>
                    <th className="text-left text-slate-500 font-semibold pb-2">Sekolah Tujuan</th>
                    <th className="text-left text-slate-500 font-semibold pb-2">Jalur</th>
                    <th className="text-left text-slate-500 font-semibold pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((p, i) => (
                    <tr key={i} className="border-b border-slate-50 last:border-0">
                      <td className="py-2.5 font-medium text-slate-700">{p.nama}</td>
                      <td className="py-2.5 text-slate-500">{p.sekolah}</td>
                      <td className="py-2.5 text-slate-500">{p.jalur}</td>
                      <td className="py-2.5"><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sekolah kuota */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-700">Kapasitas Sekolah Tujuan</h2>
              <button onClick={() => onNavigate("admin.sekolah")} className="text-xs text-blue-600 font-semibold hover:underline">Kelola Sekolah</button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[
                { nama: "SMAN 1 Indramayu", kuota: 200, terisi: 156 },
                { nama: "SMAN 2 Indramayu", kuota: 180, terisi: 132 },
                { nama: "SMKN 1 Indramayu", kuota: 220, terisi: 178 },
                { nama: "SMKN 2 Indramayu", kuota: 210, terisi: 144 },
              ].map((s, i) => {
                const pct = Math.round((s.terisi / s.kuota) * 100);
                return (
                  <div key={i} className="border border-slate-100 rounded-lg p-4">
                    <div className="text-xs font-bold text-slate-700 mb-1">{s.nama}</div>
                    <div className="text-lg font-bold text-[#0d2240]">{s.terisi}<span className="text-xs text-slate-400 font-normal">/{s.kuota}</span></div>
                    <div className="mt-2 h-1.5 bg-slate-100 rounded-full">
                      <div className={`h-1.5 rounded-full ${pct > 80 ? "bg-amber-400" : "bg-green-500"}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{pct}% terisi</div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
