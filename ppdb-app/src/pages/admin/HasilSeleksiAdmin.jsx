import { useState } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";

const DATA_AWAL = [
  { id: "S01", nama: "Arda Guler",      sekolah: "SMAN 1 Indramayu", jalur: "Zonasi",   nilai: 88.5, status: "",            peringkat: "" },
  { id: "S02", nama: "Brahim Diaz",     sekolah: "SMAN 2 Indramayu", jalur: "Prestasi", nilai: 91.0, status: "Lulus",        peringkat: "5" },
  { id: "S03", nama: "Trent Arnold",    sekolah: "SMKN 1 Indramayu", jalur: "Zonasi",   nilai: 85.0, status: "Lulus",        peringkat: "25" },
  { id: "S04", nama: "Kylian Mbappe",   sekolah: "SMKN 2 Indramayu", jalur: "Afirmasi", nilai: 78.5, status: "Tidak Lulus",  peringkat: "40" },
  { id: "S05", nama: "Fede Valverde",   sekolah: "SMAN 1 Indramayu", jalur: "Prestasi", nilai: 93.0, status: "Lulus",        peringkat: "8" },
  { id: "S06", nama: "Vinicius Jr",     sekolah: "SMAN 1 Indramayu", jalur: "Zonasi",   nilai: 82.0, status: "Cadangan",     peringkat: "35" },
  { id: "S07", nama: "Jude Bellingham", sekolah: "SMAN 2 Indramayu", jalur: "Prestasi", nilai: 90.5, status: "",            peringkat: "" },
];

function StatusBadge({ status }) {
  if (!status) return <span className="text-xs text-slate-400">Belum diisi</span>;
  const map = {
    "Lulus":       "bg-green-100 text-green-700",
    "Cadangan":    "bg-amber-100 text-amber-700",
    "Tidak Lulus": "bg-red-100 text-red-700",
  };
  return <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${map[status]}`}>{status}</span>;
}

export default function HasilSeleksiAdmin({ onNavigate }) {
  const [data, setData]     = useState(DATA_AWAL);
  const [saved, setSaved]   = useState(false);
  const [tgl, setTgl]       = useState("2025-07-07");

  const update = (id, key, val) => {
    setData((prev) => prev.map((d) => d.id === id ? { ...d, [key]: val } : d));
    setSaved(false);
  };

  const handleSimpan = () => {
    // Di sini nanti POST ke /api/hasil-seleksi/bulk
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const sudahDiisi   = data.filter((d) => d.status).length;
  const belumDiisi   = data.filter((d) => !d.status).length;

  return (
    <div className="flex min-h-screen bg-slate-100">
      <SidebarAdmin aktif="admin.hasil" onNavigate={onNavigate} onLogout={() => { localStorage.clear(); window.location.reload(); }} />

      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-slate-800">Input Hasil Seleksi</h1>
            <p className="text-xs text-slate-500">Masukkan status dan peringkat untuk setiap pendaftar</p>
          </div>
          <div className="flex items-center gap-3">
            {saved && <span className="text-xs text-green-600 font-semibold">Tersimpan</span>}
            <button
              onClick={handleSimpan}
              className="bg-[#0d2240] text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-[#1a3a5c] transition"
            >
              Simpan Semua
            </button>
          </div>
        </div>

        <div className="p-8 space-y-5">

          {/* Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-xl font-bold text-slate-800">{data.length}</div>
              <div className="text-xs text-slate-500 mt-0.5">Total pendaftar</div>
            </div>
            <div className="bg-white rounded-xl border border-green-200 p-4">
              <div className="text-xl font-bold text-green-700">{sudahDiisi}</div>
              <div className="text-xs text-slate-500 mt-0.5">Sudah diisi</div>
            </div>
            <div className="bg-white rounded-xl border border-amber-200 p-4">
              <div className="text-xl font-bold text-amber-700">{belumDiisi}</div>
              <div className="text-xs text-slate-500 mt-0.5">Belum diisi</div>
            </div>
          </div>

          {/* Tanggal pengumuman */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
            <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">Tanggal Pengumuman</label>
            <input
              type="date"
              value={tgl}
              onChange={(e) => setTgl(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 text-slate-700"
            />
            <span className="text-xs text-slate-400">Tanggal ini akan ditampilkan ke siswa</span>
          </div>

          {/* Tabel input */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["No","Nama Siswa","Sekolah Tujuan","Jalur","Nilai","Status Seleksi","Peringkat","Preview"].map((h) => (
                    <th key={h} className="text-left text-slate-500 font-semibold px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((d, i) => (
                  <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{d.nama}</td>
                    <td className="px-4 py-3 text-slate-500">{d.sekolah}</td>
                    <td className="px-4 py-3 text-slate-500">{d.jalur}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{d.nilai}</td>
                    <td className="px-4 py-3">
                      <select
                        value={d.status}
                        onChange={(e) => update(d.id, "status", e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500 text-slate-700 w-full"
                      >
                        <option value="">-- Pilih --</option>
                        <option value="Lulus">Lulus</option>
                        <option value="Cadangan">Cadangan</option>
                        <option value="Tidak Lulus">Tidak Lulus</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={d.peringkat}
                        onChange={(e) => update(d.id, "peringkat", e.target.value)}
                        placeholder="e.g. 1"
                        min="1"
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500 w-16 text-slate-700"
                      />
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
