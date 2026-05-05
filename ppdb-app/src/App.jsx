import { useState, useEffect } from "react";
import HalamanAuth       from "./pages/siswa/HalamanAuth";
import Dashboard         from "./pages/siswa/Dashboard";
import FormPendaftaran   from "./pages/siswa/FormPendaftaran";
import StatusDokumen     from "./pages/siswa/StatusDokumen";
import HasilSeleksi      from "./pages/siswa/HasilSeleksi";
import LoginAdmin        from "./pages/admin/LoginAdmin";
import DashboardAdmin    from "./pages/admin/DashboardAdmin";
import DataPendaftar     from "./pages/admin/DataPendaftar";
import VerifikasiDokumen from "./pages/admin/VerifikasiDokumen";
import HasilSeleksiAdmin from "./pages/admin/HasilSeleksiAdmin";
import KelolaSekolah     from "./pages/admin/KelolaSekolah";

function getSiswaLokal() {
  try { return JSON.parse(localStorage.getItem("ppdb_siswa")) || null; }
  catch { return null; }
}

export default function App() {
  const [halaman, setHalaman] = useState("auth");
  const [siswa,   setSiswa]   = useState(null);

  // Ambil token dan data dari localStorage
  const siswaToken = localStorage.getItem("ppdb_token");
  const adminToken = localStorage.getItem("ppdb_admin_token");
  const siswaLokal = getSiswaLokal();
  const adminLokal = localStorage.getItem("ppdb_admin");

  useEffect(() => {
    // Prioritas: Admin > Siswa
    if (adminToken && adminLokal)       setHalaman("admin.dashboard");
    else if (siswaToken && siswaLokal) { setSiswa(siswaLokal); setHalaman("dashboard"); }
  }, []);

  const handleLoginSiswa = (d) => { setSiswa(d); setHalaman("dashboard"); };
  const handleLoginAdmin = ()  => setHalaman("admin.dashboard");
  const handleLogout     = ()  => {
    localStorage.clear();
    setSiswa(null);
    setHalaman("auth");
  };

  const isSiswaLoggedIn = Boolean(siswaToken && siswaLokal);
  const isAdminLoggedIn = Boolean(adminToken && adminLokal);

  const renderAuth = () => <HalamanAuth onLoginBerhasil={handleLoginSiswa} onKeAdmin={() => setHalaman("admin.login")} />;

  switch (halaman) {
    case "auth":             return renderAuth();
    case "dashboard":        return isSiswaLoggedIn ? <Dashboard onLogout={handleLogout} onKeDaftar={() => setHalaman("daftar")} onKeStatus={() => setHalaman("dokumen")} onKeHasil={() => setHalaman("hasil")} /> : renderAuth();
    case "daftar":           return isSiswaLoggedIn ? <FormPendaftaran onKembali={() => setHalaman("dashboard")} onSelesai={() => setHalaman("dashboard")} /> : renderAuth();
    case "dokumen":          return isSiswaLoggedIn ? <StatusDokumen onKembali={() => setHalaman("dashboard")} /> : renderAuth();
    case "hasil":            return isSiswaLoggedIn ? <HasilSeleksi onKembali={() => setHalaman("dashboard")} /> : renderAuth();
    case "admin.login":      return <LoginAdmin onLoginBerhasil={handleLoginAdmin} onKeSiswa={() => setHalaman("auth")} />;
    case "admin.dashboard":  return isAdminLoggedIn ? <DashboardAdmin onLogout={handleLogout} onNavigate={setHalaman} /> : <LoginAdmin onLoginBerhasil={handleLoginAdmin} onKeSiswa={() => setHalaman("auth")} />;
    case "admin.pendaftar":  return isAdminLoggedIn ? <DataPendaftar onNavigate={setHalaman} /> : <LoginAdmin onLoginBerhasil={handleLoginAdmin} onKeSiswa={() => setHalaman("auth")} />;
    case "admin.dokumen":    return isAdminLoggedIn ? <VerifikasiDokumen onNavigate={setHalaman} /> : <LoginAdmin onLoginBerhasil={handleLoginAdmin} onKeSiswa={() => setHalaman("auth")} />;
    case "admin.hasil":      return isAdminLoggedIn ? <HasilSeleksiAdmin onNavigate={setHalaman} /> : <LoginAdmin onLoginBerhasil={handleLoginAdmin} onKeSiswa={() => setHalaman("auth")} />;
    case "admin.sekolah":    return isAdminLoggedIn ? <KelolaSekolah onNavigate={setHalaman} /> : <LoginAdmin onLoginBerhasil={handleLoginAdmin} onKeSiswa={() => setHalaman("auth")} />;
    default:                   return renderAuth();
  }
}
