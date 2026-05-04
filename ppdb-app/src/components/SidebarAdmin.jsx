export default function SidebarAdmin({ aktif, onNavigate, onLogout }) {
  const menu = [
    { id: "admin.dashboard", label: "Dashboard" },
    { id: "admin.pendaftar", label: "Data Pendaftar" },
    { id: "admin.dokumen", label: "Verifikasi Dokumen" },
    { id: "admin.hasil", label: "Hasil Seleksi" },
    { id: "admin.sekolah", label: "Kelola Sekolah" },
  ];

  return (
    <aside className="flex min-h-screen w-64 flex-shrink-0 flex-col bg-gradient-to-b from-cyan-950 via-cyan-900 to-slate-900 [font-family:'Plus_Jakarta_Sans','Segoe_UI',sans-serif]">
      {/* Logo */}
      <div className="border-b border-white/10 px-6 py-5">
        <div className="mb-1 text-xs font-bold uppercase tracking-widest text-cyan-100/50">Admin Panel</div>
        <div className="text-base font-bold leading-tight text-white">PPDB Indramayu</div>
        <div className="mt-0.5 text-xs text-cyan-100/60">Tahun Ajaran 2025/2026</div>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {menu.map((m) => {
          const aktif_ = aktif === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onNavigate(m.id)}
              className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all
                ${aktif_
                  ? "bg-white/15 text-white"
                  : "text-cyan-100/65 hover:bg-white/10 hover:text-white"}`}
            >
              {m.label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-white/10 px-3 py-4">
        <button
          onClick={onLogout}
          className="w-full rounded-xl border border-white/15 px-3 py-2.5 text-left text-sm font-medium text-cyan-100/70 transition-all hover:bg-white/10 hover:text-white"
        >
          Keluar
        </button>
      </div>
    </aside>
  );
}
