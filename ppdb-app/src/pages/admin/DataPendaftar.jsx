import { useEffect, useState } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";

const DATA_DUMMY = [
  { id: "S01", nama: "Arda Guler",     nisn: "0011223344", asal: "SMP N 1 Indramayu", jalur: "Zonasi",   sekolah: "SMAN 1 Indramayu", nilai: 88.5, status: "Lulus" },
  { id: "S02", nama: "Brahim Diaz",    nisn: "0011223345", asal: "SMP N 2 Indramayu", jalur: "Prestasi", sekolah: "SMAN 2 Indramayu", nilai: 91.0, status: "Lulus" },
  { id: "S03", nama: "Trent Arnold",   nisn: "0011223346", asal: "SMP N 3 Indramayu", jalur: "Zonasi",   sekolah: "SMKN 1 Indramayu", nilai: 85.0, status: "Lulus" },
  { id: "S04", nama: "Kylian Mbappe",  nisn: "0011223347", asal: "SMP N 4 Indramayu", jalur: "Afirmasi", sekolah: "SMKN 2 Indramayu", nilai: 78.5, status: "Tidak Lulus" },
  { id: "S05", nama: "Fede Valverde",  nisn: "0011223348", asal: "SMP N 1 Indramayu", jalur: "Prestasi", sekolah: "SMAN 1 Indramayu", nilai: 93.0, status: "Lulus" },
  { id: "S06", nama: "Vinicius Jr",    nisn: "0011223349", asal: "MTs N 1 Indramayu", jalur: "Zonasi",   sekolah: "SMAN 1 Indramayu", nilai: 82.0, status: "Cadangan" },
  { id: "S07", nama: "Jude Bellingham",nisn: "0011223350", asal: "SMP N 2 Indramayu", jalur: "Prestasi", sekolah: "SMAN 2 Indramayu", nilai: 90.5, status: "Lulus" },
];

function StatusBadge({ status }) {
  const map = {
    "Lulus":       "bg-green-100 text-green-700",
    "Cadangan":    "bg-amber-100 text-amber-700",
    "Tidak Lulus": "bg-red-100 text-red-700",
    "Menunggu":    "bg-slate-100 text-slate-600",
  };
  return <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${map[status] || map["Menunggu"]}`}>{status}</span>;
}

export default function DataPendaftar({ onNavigate }) {
  const [cari, setCari]   = useState("");
  const [jalur, setJalur] = useState("Semua");
  const [data, setData]   = useState(DATA_DUMMY);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("ppdb_token") || "";
        const res = await fetch("http://localhost:5000/api/pendaftaran/admin", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Gagal memuat data pendaftar.");
        const json = await res.json();
        if (Array.isArray(json) && json.length > 0) {
          setData(
            json.map((item) => ({
              id: item.id_pendaftaran,
              nama: item.nama_lengkap,
              nisn: String(item.nisn),
              asal: item.asal_sekolah,
              jalur: item.nama_jalur,
              sekolah: item.nama_sekolah,
              nilai: item.nilai_rata,
              status: item.status,
            }))
          );
        }
      } catch {
        setData(DATA_DUMMY);
      }
    };

    fetchData();
  }, []);

  const filtered = data.filter((d) => {
    const cocokCari  = d.nama.toLowerCase().includes(cari.toLowerCase()) || d.nisn.includes(cari);
    const cocokJalur = jalur === "Semua" || d.jalur === jalur;
    return cocokCari && cocokJalur;
  });

  return (
    <div className="flex min-h-screen bg-slate-100">
      <SidebarAdmin aktif="admin.pendaftar" onNavigate={onNavigate} onLogout={() => { localStorage.clear(); window.location.reload(); }} />

      <main className="flex-1 overflow-y-auto">
        {/* Topbar */}
        <div className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10">
          <h1 className="text-base font-bold text-slate-800">Data Pendaftar</h1>
          <p className="text-xs text-slate-500">Daftar seluruh siswa yang telah mendaftar PPDB</p>
        </div>

        <div className="p-8 space-y-5">

          {/* Filter */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Cari nama atau NISN..."
                value={cari}
                onChange={(e) => setCari(e.target.value)}
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              />
            </div>
            <select
              value={jalur}
              onChange={(e) => setJalur(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 text-slate-700"
            >
              <option>Semua</option>
              <option>Zonasi</option>
              <option>Prestasi</option>
              <option>Afirmasi</option>
              <option>Perpindahan Orang Tua</option>
            </select>
            <div className="text-xs text-slate-500 whitespace-nowrap">{filtered.length} data ditemukan</div>
          </div>

          {/* Tabel */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["No","Nama Siswa","NISN","Asal Sekolah","Jalur","Sekolah Tujuan","Nilai Rata","Status"].map((h) => (
                    <th key={h} className="text-left text-slate-500 font-semibold px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, i) => (
                  <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{d.nama}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono">{d.nisn}</td>
                    <td className="px-4 py-3 text-slate-500">{d.asal}</td>
                    <td className="px-4 py-3 text-slate-500">{d.jalur}</td>
                    <td className="px-4 py-3 text-slate-500">{d.sekolah}</td>
                    <td className="px-4 py-3 text-slate-700 font-semibold">{d.nilai}</td>
                    <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-10 text-slate-400 text-sm">Tidak ada data ditemukan</td></tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}
