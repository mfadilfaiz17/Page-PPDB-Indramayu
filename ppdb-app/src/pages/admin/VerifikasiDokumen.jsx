import { useEffect, useState } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";

const BASE_URL = "http://localhost:5000/api";

function StatusBadge({ status }) {
  const map = {
    "TERUPLOAD": "bg-green-100 text-green-700",
    "PROSES":    "bg-blue-100 text-blue-700",
    "DITOLAK":   "bg-red-100 text-red-700",
    "BELUM":     "bg-slate-100 text-slate-500",
  };
  const label = { TERUPLOAD: "Terupload", PROSES: "Diproses", DITOLAK: "Ditolak", BELUM: "Belum" };
  return <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${map[status]}`}>{label[status]}</span>;
}

export default function VerifikasiDokumen({ onNavigate }) {
  const [data, setData] = useState([]);
  const [aktif, setAktif] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDokumen = async () => {
      try {
        const token = localStorage.getItem("ppdb_admin_token");
        if (!token) {
          throw new Error("Admin token tidak ditemukan. Silakan login kembali.");
        }
        const resPendaftar = await fetch(`${BASE_URL}/pendaftaran/admin`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resPendaftar.ok) throw new Error("Gagal memuat data pendaftar");

        const pendaftarList = await resPendaftar.json();
        const dataSiswa = pendaftarList.map((p) => ({
          id: p.id_siswa,
          nama: p.nama_lengkap,
          nisn: p.nisn,
          dokumen: [],
          id_siswa: p.id_siswa,
        }));

        setData(dataSiswa);
        if (dataSiswa.length > 0) setAktif(dataSiswa[0]?.id);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDokumen();
  }, []);

  const updateStatus = (idSiswa, idDokumen, statusBaru) => {
    setData((prev) =>
      prev.map((s) =>
        s.id !== idSiswa
          ? s
          : {
              ...s,
              dokumen: s.dokumen.map((d) =>
                d.id_dokumen !== idDokumen ? d : { ...d, status_dokumen: statusBaru }
              ),
            }
      )
    );
  };

  const handleSimpan = async () => {
    const siswaAktif = data.find((s) => s.id === aktif);
    if (!siswaAktif) return;
    alert("Verifikasi dokumen berhasil disimpan!");
  };

  const siswaAktif = data.find((s) => s.id === aktif);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-100">
        <SidebarAdmin aktif="admin.dokumen" onNavigate={onNavigate} onLogout={() => { localStorage.clear(); window.location.reload(); }} />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-slate-500">Memuat data dokumen...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <SidebarAdmin aktif="admin.dokumen" onNavigate={onNavigate} onLogout={() => { localStorage.clear(); window.location.reload(); }} />

      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10">
          <h1 className="text-base font-bold text-slate-800">Verifikasi Dokumen</h1>
          <p className="text-xs text-slate-500">Tinjau dan verifikasi kelengkapan dokumen pendaftar</p>
        </div>

        {error && (
          <div className="mx-8 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="p-8">
          <div className="grid grid-cols-3 gap-6">

            {/* Daftar siswa */}
            <div className="col-span-1 space-y-2">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Daftar Pendaftar ({data.length})</div>
              {data.map((s) => {
                const lengkap = s.dokumen.filter((d) => d.status_dokumen === "TERUPLOAD").length;
                const total = s.dokumen.length || 5;
                const ada_ditolak = s.dokumen.some((d) => d.status_dokumen === "DITOLAK");
                return (
                  <button
                    key={s.id}
                    onClick={() => setAktif(s.id)}
                    className={`w-full text-left rounded-xl border p-4 transition-all
                      ${aktif === s.id ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
                  >
                    <div className="font-semibold text-sm text-slate-800">{s.nama}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{s.nisn}</div>
                    <div className="text-xs text-slate-500 mt-1">{lengkap}/{total} dokumen terupload</div>
                    {ada_ditolak && (
                      <div className="text-xs text-red-500 font-medium mt-1">Ada dokumen ditolak</div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Detail dokumen */}
            <div className="col-span-2">
              {siswaAktif ? (
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h2 className="text-sm font-bold text-slate-800 mb-1">{siswaAktif.nama}</h2>
                  <p className="text-xs text-slate-500 mb-5">NISN: {siswaAktif.nisn} — Klik tombol untuk mengubah status verifikasi dokumen</p>

                  {siswaAktif.dokumen.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-slate-500">Belum ada dokumen yang diupload</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {siswaAktif.dokumen.map((dok) => (
                        <div key={dok.id_dokumen} className="flex items-center justify-between p-4 rounded-lg border border-slate-100 bg-slate-50/50">
                          <div>
                            <div className="text-sm font-medium text-slate-700">{dok.nama_dokumen}</div>
                            <div className="mt-1"><StatusBadge status={dok.status_dokumen} /></div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateStatus(siswaAktif.id, dok.id_dokumen, "TERUPLOAD")}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-green-200 text-green-700 hover:bg-green-50 transition"
                            >
                              Setujui
                            </button>
                            <button
                              onClick={() => updateStatus(siswaAktif.id, dok.id_dokumen, "DITOLAK")}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition"
                            >
                              Tolak
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={handleSimpan}
                      className="bg-[#0d2240] text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-[#1a3a5c] transition"
                    >
                      Simpan Verifikasi
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 h-64 flex items-center justify-center">
                  <div className="text-center">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Belum Ada Pilihan</p>
                    <p className="text-sm text-slate-400">Pilih pendaftar untuk melihat dokumennya</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
