import { useEffect, useState } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";
import { API_BASE_URL } from "../../config/api";

const SEKOLAH_AWAL = [
  { id: "ST01", npsn: "202001", nama: "SMA Negeri 1 Indramayu", jenjang: "SMA", kuota: 200, alamat: "Jl. MT Haryono No.1, Indramayu" },
  { id: "ST02", npsn: "202002", nama: "SMA Negeri 2 Indramayu", jenjang: "SMA", kuota: 180, alamat: "Jl. Pahlawan No.2, Indramayu" },
  { id: "ST03", npsn: "202003", nama: "SMK Negeri 1 Indramayu", jenjang: "SMK", kuota: 220, alamat: "Jl. Sudirman No.3, Indramayu" },
  { id: "ST04", npsn: "202004", nama: "SMK Negeri 2 Indramayu", jenjang: "SMK", kuota: 210, alamat: "Jl. Diponegoro No.4, Indramayu" },
];

const JALUR_AWAL = [
  { id: "J01", nama: "Zonasi",                 kuota: 50 },
  { id: "J02", nama: "Prestasi",               kuota: 30 },
  { id: "J03", nama: "Afirmasi",               kuota: 10 },
  { id: "J04", nama: "Perpindahan Orang Tua",  kuota: 10 },
];

export default function KelolaSekolah({ onNavigate }) {
  const [sekolah, setSekolah] = useState(SEKOLAH_AWAL);
  const [jalur,   setJalur]   = useState(JALUR_AWAL);
  const [editSekolah, setEditSekolah] = useState(null);
  const [editJalur,   setEditJalur]   = useState(null);
  const [saved, setSaved] = useState("");

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("ppdb_token") || ""}`,
  });

  const loadData = async () => {
    try {
      const [resSekolah, resJalur] = await Promise.all([
        fetch(`${API_BASE_URL}/master/sekolah`, { headers: authHeaders() }),
        fetch(`${API_BASE_URL}/master/jalur`, { headers: authHeaders() }),
      ]);

      if (!resSekolah.ok || !resJalur.ok) throw new Error("Gagal memuat data master.");

      const [dataSekolah, dataJalur] = await Promise.all([resSekolah.json(), resJalur.json()]);
      setSekolah(Array.isArray(dataSekolah) && dataSekolah.length ? dataSekolah : SEKOLAH_AWAL);
      setJalur(Array.isArray(dataJalur) && dataJalur.length ? dataJalur : JALUR_AWAL);
    } catch {
      setSekolah(SEKOLAH_AWAL);
      setJalur(JALUR_AWAL);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const simpanSekolah = async () => {
    if (!editSekolah) return;
    try {
      const res = await fetch(`${API_BASE_URL}/master/sekolah/${editSekolah.id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          npsn: editSekolah.npsn,
          nama_sekolah: editSekolah.nama,
          jenjang: editSekolah.jenjang,
          kuota: editSekolah.kuota,
          alamat_sekolah: editSekolah.alamat,
        }),
      });

      if (!res.ok) throw new Error((await res.json()).message || "Gagal menyimpan sekolah.");

      await loadData();
      setEditSekolah(null);
      setSaved("sekolah");
      setTimeout(() => setSaved(""), 2000);
    } catch (err) {
      alert(err.message);
    }
  };

  const hapusSekolah = async (id) => {
    if (!confirm("Hapus sekolah ini?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/master/sekolah/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Gagal menghapus sekolah.");
      await loadData();
      setSaved("sekolah");
      setTimeout(() => setSaved(""), 2000);
    } catch (err) {
      alert(err.message);
    }
  };

  const tambahSekolah = async () => {
    const npsn = prompt("NPSN sekolah baru:");
    if (!npsn) return;
    const nama = prompt("Nama sekolah baru:");
    if (!nama) return;
    const jenjang = prompt("Jenjang (SMA/SMK/MA):", "SMA");
    if (!jenjang) return;
    const kuota = prompt("Kuota sekolah:", "0");
    if (!kuota) return;
    const alamat = prompt("Alamat sekolah:");
    if (!alamat) return;

    try {
      const res = await fetch(`${API_BASE_URL}/master/sekolah`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          npsn,
          nama_sekolah: nama,
          jenjang,
          kuota,
          alamat_sekolah: alamat,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Gagal menambah sekolah.");
      await loadData();
      setSaved("sekolah");
      setTimeout(() => setSaved(""), 2000);
    } catch (err) {
      alert(err.message);
    }
  };

  const simpanJalur = async () => {
    if (!editJalur) return;
    try {
      const res = await fetch(`${API_BASE_URL}/master/jalur/${editJalur.id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          nama_jalur: editJalur.nama,
          persentase_kuota: editJalur.kuota,
        }),
      });

      if (!res.ok) throw new Error((await res.json()).message || "Gagal menyimpan jalur.");

      await loadData();
      setEditJalur(null);
      setSaved("jalur");
      setTimeout(() => setSaved(""), 2000);
    } catch (err) {
      alert(err.message);
    }
  };

  const hapusJalur = async (id) => {
    if (!confirm("Hapus jalur ini?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/master/jalur/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Gagal menghapus jalur.");
      await loadData();
      setSaved("jalur");
      setTimeout(() => setSaved(""), 2000);
    } catch (err) {
      alert(err.message);
    }
  };

  const tambahJalur = async () => {
    const nama = prompt("Nama jalur baru:");
    if (!nama) return;
    const kuota = prompt("Kuota jalur (%):", "0");
    if (!kuota) return;

    try {
      const res = await fetch(`${API_BASE_URL}/master/jalur`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          nama_jalur: nama,
          persentase_kuota: kuota,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Gagal menambah jalur.");
      await loadData();
      setSaved("jalur");
      setTimeout(() => setSaved(""), 2000);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <SidebarAdmin aktif="admin.sekolah" onNavigate={onNavigate} onLogout={() => { localStorage.clear(); window.location.reload(); }} />

      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10">
          <h1 className="text-base font-bold text-slate-800">Kelola Sekolah & Jalur</h1>
          <p className="text-xs text-slate-500">Atur data sekolah tujuan dan jalur pendaftaran</p>
        </div>

        <div className="p-8 space-y-6">

          {/* Sekolah */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-bold text-slate-700">Sekolah Tujuan</h2>
                <button onClick={tambahSekolah} className="text-xs font-semibold px-3 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition">Tambah</button>
              </div>
              {saved === "sekolah" && <span className="text-xs text-green-600 font-semibold">Tersimpan</span>}
            </div>
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["NPSN","Nama Sekolah","Jenjang","Kuota","Alamat","Aksi"].map((h) => (
                    <th key={h} className="text-left text-slate-500 font-semibold px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sekolah.map((s) => (
                  <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    {editSekolah?.id === s.id ? (
                      <>
                        <td className="px-4 py-2 text-slate-500 font-mono">{s.npsn}</td>
                        <td className="px-4 py-2">
                          <input value={editSekolah.nama} onChange={(e) => setEditSekolah({ ...editSekolah, nama: e.target.value })}
                            className="border border-slate-200 rounded-lg px-2 py-1 w-full focus:outline-none focus:border-blue-500 text-slate-700" />
                        </td>
                        <td className="px-4 py-2">
                          <select value={editSekolah.jenjang} onChange={(e) => setEditSekolah({ ...editSekolah, jenjang: e.target.value })}
                            className="border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500 text-slate-700">
                            <option>SMA</option><option>SMK</option><option>MA</option>
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <input type="number" value={editSekolah.kuota} onChange={(e) => setEditSekolah({ ...editSekolah, kuota: e.target.value })}
                            className="border border-slate-200 rounded-lg px-2 py-1 w-20 focus:outline-none focus:border-blue-500 text-slate-700" />
                        </td>
                        <td className="px-4 py-2">
                          <input value={editSekolah.alamat} onChange={(e) => setEditSekolah({ ...editSekolah, alamat: e.target.value })}
                            className="border border-slate-200 rounded-lg px-2 py-1 w-full focus:outline-none focus:border-blue-500 text-slate-700" />
                        </td>
                        <td className="px-4 py-2 flex gap-2">
                          <button onClick={simpanSekolah} className="text-xs font-semibold px-3 py-1 rounded-lg bg-[#0d2240] text-white hover:bg-[#1a3a5c] transition">Simpan</button>
                          <button onClick={() => setEditSekolah(null)} className="text-xs font-semibold px-3 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition">Batal</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-slate-500 font-mono">{s.npsn}</td>
                        <td className="px-4 py-3 font-medium text-slate-700">{s.nama}</td>
                        <td className="px-4 py-3 text-slate-500">{s.jenjang}</td>
                        <td className="px-4 py-3 text-slate-700 font-semibold">{s.kuota}</td>
                        <td className="px-4 py-3 text-slate-500">{s.alamat}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => setEditSekolah({ ...s })} className="text-xs font-semibold px-3 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition">Edit</button>
                            <button onClick={() => hapusSekolah(s.id)} className="text-xs font-semibold px-3 py-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition">Hapus</button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Jalur */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-bold text-slate-700">Jalur Pendaftaran</h2>
                <button onClick={tambahJalur} className="text-xs font-semibold px-3 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition">Tambah</button>
              </div>
              {saved === "jalur" && <span className="text-xs text-green-600 font-semibold">Tersimpan</span>}
            </div>
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["Jalur","Kuota (%)","Aksi"].map((h) => (
                    <th key={h} className="text-left text-slate-500 font-semibold px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jalur.map((j) => (
                  <tr key={j.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    {editJalur?.id === j.id ? (
                      <>
                        <td className="px-4 py-2">
                          <input value={editJalur.nama} onChange={(e) => setEditJalur({ ...editJalur, nama: e.target.value })}
                            className="border border-slate-200 rounded-lg px-2 py-1 w-full focus:outline-none focus:border-blue-500 text-slate-700" />
                        </td>
                        <td className="px-4 py-2">
                          <input type="number" value={editJalur.kuota} onChange={(e) => setEditJalur({ ...editJalur, kuota: e.target.value })}
                            className="border border-slate-200 rounded-lg px-2 py-1 w-20 focus:outline-none focus:border-blue-500 text-slate-700" />
                        </td>
                        <td className="px-4 py-2 flex gap-2">
                          <button onClick={simpanJalur} className="text-xs font-semibold px-3 py-1 rounded-lg bg-[#0d2240] text-white hover:bg-[#1a3a5c] transition">Simpan</button>
                          <button onClick={() => setEditJalur(null)} className="text-xs font-semibold px-3 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition">Batal</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-medium text-slate-700">{j.nama}</td>
                        <td className="px-4 py-3 text-slate-700 font-semibold">{j.kuota}%</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => setEditJalur({ ...j })} className="text-xs font-semibold px-3 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition">Edit</button>
                            <button onClick={() => hapusJalur(j.id)} className="text-xs font-semibold px-3 py-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition">Hapus</button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100">
              <p className="text-xs text-slate-400">Total kuota: {jalur.reduce((a, j) => a + Number(j.kuota), 0)}% — harus berjumlah 100%</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
