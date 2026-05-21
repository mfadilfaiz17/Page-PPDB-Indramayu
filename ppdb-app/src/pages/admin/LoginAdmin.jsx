import { useState } from "react";
import NoticeBox from "../../components/NoticeBox";
import { API_BASE_URL } from "../../config/api";

export default function LoginAdmin({ onLoginBerhasil, onKeSiswa }) {
  const [form, setForm]     = useState({ username: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow]     = useState(false);

  const handleLogin = async () => {
    if (!form.username || !form.password) {
      setError("Username dan password wajib diisi.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/auth/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const contentType = res.headers.get("content-type") || "";
      const raw = contentType.includes("application/json") ? await res.json() : { message: await res.text() };
      const data = raw;
      if (!res.ok) throw new Error(data.message || "Login admin gagal.");

      // Simpan token admin di key terpisah (tidak ppdb_token)
      localStorage.setItem("ppdb_admin_token", data.token);
      localStorage.setItem("ppdb_admin", JSON.stringify(data.admin));
      onLoginBerhasil?.(data.admin);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 [font-family:'Plus_Jakarta_Sans','Segoe_UI',sans-serif]">
      <div className="pointer-events-none absolute -top-16 left-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 right-0 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="mb-6 text-center text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100/70">
            PPDB Online Indramayu
          </p>
          <h1 className="mt-3 text-2xl font-bold">Portal Admin</h1>
          <p className="mt-1 text-sm text-cyan-100/80">Tahun Ajaran 2025/2026</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white p-8 shadow-2xl shadow-slate-900/40">
          <h2 className="mb-6 text-base font-semibold text-slate-700">Masuk ke Panel Admin</h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Username</label>
              <input
                type="text"
                placeholder="Masukkan username"
                value={form.username}
                onChange={(e) => { setForm((p) => ({ ...p, username: e.target.value })); setError(""); }}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-700 focus:ring-4 focus:ring-cyan-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Password</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={form.password}
                  onChange={(e) => { setForm((p) => ({ ...p, password: e.target.value })); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 pr-16 text-sm text-slate-800 outline-none transition focus:border-cyan-700 focus:ring-4 focus:ring-cyan-100"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-cyan-800 hover:text-cyan-700"
                >
                  {show ? "Sembunyikan" : "Tampilkan"}
                </button>
              </div>
            </div>

            {error && (
              <NoticeBox type="error" message={error} />
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-cyan-900 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </div>
        </div>

        <p className="mt-5 text-center text-sm text-cyan-100/80">
          Anda siswa?{" "}
          <button onClick={onKeSiswa} className="font-semibold text-white hover:underline">
            Portal Siswa
          </button>
        </p>
      </div>
    </div>
  );
}
