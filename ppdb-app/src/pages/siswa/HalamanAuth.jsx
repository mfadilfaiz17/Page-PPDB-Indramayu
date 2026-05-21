import { useState } from "react";
import NoticeBox from "../../components/NoticeBox";
import { API_BASE_URL } from "../../config/api";

function InputField({ label, required, hint, type = "text", ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-700">
        {label} {required && <span className="text-rose-600">*</span>}
      </label>
      <input
        type={type}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-700 focus:ring-4 focus:ring-cyan-100"
        {...props}
      />
      {hint && <p className="text-[11px] leading-5 text-slate-500">{hint}</p>}
    </div>
  );
}

function SelectField({ label, required, children, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-700">
        {label} {required && <span className="text-rose-600">*</span>}
      </label>
      <select
        className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-700 focus:ring-4 focus:ring-cyan-100"
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

function Btn({ children, loading, variant = "primary", onClick, type = "button", fullWidth = true }) {
  const base = "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70";
  const palette = {
    primary: "bg-cyan-900 text-white hover:bg-cyan-800",
    success: "bg-emerald-700 text-white hover:bg-emerald-600",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`${base} ${palette[variant] || palette.primary} ${fullWidth ? "w-full" : "w-auto"}`}
    >
      {loading ? "Memproses..." : children}
    </button>
  );
}

function SeksiJudul({ label }) {
  return (
    <div className="mb-3 border-b border-slate-200 pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-800">
      {label}
    </div>
  );
}

function HalamanLogin({ onSuksesLogin, onKeRegister }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState(null);

  const handle = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setPesan(null);
  };

  const validasi = () => {
    if (!form.email || !form.password) return "Email dan password wajib diisi.";
    if (!form.email.includes("@")) return "Format email tidak valid.";
    if (form.password.length < 8) return "Password minimal 8 karakter.";
    return null;
  };

  const handleLogin = async () => {
    const err = validasi();
    if (err) {
      setPesan({ type: "error", text: err });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login gagal.");

      localStorage.setItem("ppdb_token", data.token);
      localStorage.setItem("ppdb_siswa", JSON.stringify(data.siswa));

      setPesan({ type: "success", text: `Selamat datang, ${data.siswa.nama_lengkap}.` });
      setTimeout(() => onSuksesLogin(data.siswa), 800);
    } catch (err) {
      setPesan({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <h2 className="text-xl font-bold text-slate-900">Masuk ke Akun PPDB</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Masukkan email dan password yang sudah Anda daftarkan.
      </p>

      <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
        <InputField
          label="Email"
          required
          type="email"
          placeholder="contoh@gmail.com"
          value={form.email}
          onChange={(e) => handle("email", e.target.value)}
        />

        <InputField
          label="Password"
          required
          type="password"
          placeholder="Masukkan password"
          value={form.password}
          onChange={(e) => handle("password", e.target.value)}
        />

        {pesan && <NoticeBox type={pesan.type} message={pesan.text} />}

        <Btn loading={loading} type="submit">
          Masuk
        </Btn>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        Belum punya akun?{" "}
        <button onClick={onKeRegister} className="font-semibold text-cyan-800 hover:text-cyan-700">
          Daftar sekarang
        </button>
      </p>
    </div>
  );
}

function HalamanRegister({ onSuksesRegister, onKeLogin }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    konfirmasi_password: "",
    nisn: "",
    nik: "",
    nama_lengkap: "",
    jenis_kelamin: "",
    tanggal_lahir: "",
    desa: "",
    kecamatan: "",
    alamat_siswa: "",
    no_hp: "",
    asal_sekolah: "",
    nilai_rata: "",
  });

  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState(null);

  const handle = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setPesan(null);
  };

  const validasi = () => {
    const {
      email,
      password,
      konfirmasi_password,
      nisn,
      nik,
      nama_lengkap,
      jenis_kelamin,
      tanggal_lahir,
      desa,
      kecamatan,
      alamat_siswa,
      no_hp,
      asal_sekolah,
      nilai_rata,
    } = form;

    if (
      !email ||
      !password ||
      !konfirmasi_password ||
      !nisn ||
      !nik ||
      !nama_lengkap ||
      !jenis_kelamin ||
      !tanggal_lahir ||
      !desa ||
      !kecamatan ||
      !alamat_siswa ||
      !no_hp ||
      !asal_sekolah ||
      !nilai_rata
    ) {
      return "Semua field wajib diisi.";
    }

    if (!email.includes("@")) return "Format email tidak valid.";
    if (password.length < 8) return "Password minimal 8 karakter.";
    if (password !== konfirmasi_password) return "Password dan konfirmasi password tidak cocok.";
    if (nisn.length !== 10) return "NISN harus 10 digit.";
    if (nik.length !== 16) return "NIK harus 16 digit.";
    if (isNaN(nilai_rata) || Number(nilai_rata) < 0 || Number(nilai_rata) > 100) {
      return "Nilai rata-rata harus antara 0 dan 100.";
    }

    return null;
  };

  const handleRegister = async () => {
    const err = validasi();
    if (err) {
      setPesan({ type: "error", text: err });
      return;
    }

    setLoading(true);
    try {
      const { konfirmasi_password, ...payload } = form;
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registrasi gagal.");

      setPesan({ type: "success", text: "Akun berhasil dibuat. Silakan login." });
      setTimeout(() => onSuksesRegister(), 1200);
    } catch (err) {
      setPesan({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <h2 className="text-xl font-bold text-slate-900">Buat Akun PPDB</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Isi data sesuai dokumen resmi agar proses verifikasi berjalan lancar.
      </p>

      <div className="mt-6 space-y-5">
        <div>
          <SeksiJudul label="Data Akun" />
          <div className="space-y-4">
            <InputField
              label="Email Aktif"
              required
              type="email"
              placeholder="contoh@gmail.com"
              hint="Digunakan untuk login dan notifikasi"
              value={form.email}
              onChange={(e) => handle("email", e.target.value)}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField
                label="Password"
                required
                type="password"
                placeholder="Minimal 8 karakter"
                value={form.password}
                onChange={(e) => handle("password", e.target.value)}
              />
              <InputField
                label="Konfirmasi Password"
                required
                type="password"
                placeholder="Ulangi password"
                value={form.konfirmasi_password}
                onChange={(e) => handle("konfirmasi_password", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div>
          <SeksiJudul label="Data Pribadi Siswa" />
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField
                label="NISN"
                required
                placeholder="10 digit NISN"
                maxLength={10}
                hint="Nomor Induk Siswa Nasional"
                value={form.nisn}
                onChange={(e) => handle("nisn", e.target.value.replace(/\D/g, ""))}
              />
              <InputField
                label="NIK"
                required
                placeholder="16 digit NIK"
                maxLength={16}
                hint="Sesuai KTP atau Kartu Keluarga"
                value={form.nik}
                onChange={(e) => handle("nik", e.target.value.replace(/\D/g, ""))}
              />
            </div>

            <InputField
              label="Nama Lengkap"
              required
              placeholder="Sesuai ijazah atau akta kelahiran"
              value={form.nama_lengkap}
              onChange={(e) => handle("nama_lengkap", e.target.value)}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SelectField
                label="Jenis Kelamin"
                required
                value={form.jenis_kelamin}
                onChange={(e) => handle("jenis_kelamin", e.target.value)}
              >
                <option value="">-- Pilih --</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </SelectField>
              <InputField
                label="Tanggal Lahir"
                required
                type="date"
                value={form.tanggal_lahir}
                onChange={(e) => handle("tanggal_lahir", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div>
          <SeksiJudul label="Alamat Tempat Tinggal" />
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField
                label="Desa"
                required
                placeholder="Nama desa"
                value={form.desa}
                onChange={(e) => handle("desa", e.target.value)}
              />
              <InputField
                label="Kecamatan"
                required
                placeholder="Nama kecamatan"
                value={form.kecamatan}
                onChange={(e) => handle("kecamatan", e.target.value)}
              />
            </div>

            <InputField
              label="Alamat Lengkap"
              required
              placeholder="Jalan, RT/RW, Kelurahan, Kecamatan"
              hint="Pastikan sesuai dokumen kependudukan"
              value={form.alamat_siswa}
              onChange={(e) => handle("alamat_siswa", e.target.value)}
            />
          </div>
        </div>

        <div>
          <SeksiJudul label="Informasi Sekolah Asal" />
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField
                label="Nomor HP Aktif"
                required
                type="tel"
                placeholder="08xxxxxxxxxx"
                value={form.no_hp}
                onChange={(e) => handle("no_hp", e.target.value.replace(/\D/g, ""))}
              />
              <InputField
                label="Asal Sekolah (SMP/MTs)"
                required
                placeholder="Nama lengkap sekolah asal"
                value={form.asal_sekolah}
                onChange={(e) => handle("asal_sekolah", e.target.value)}
              />
            </div>

            <InputField
              label="Nilai Rata-rata Rapor"
              required
              type="number"
              placeholder="Contoh: 88.5"
              min="0"
              max="100"
              step="0.1"
              hint="Rata-rata semester 1 sampai 5"
              value={form.nilai_rata}
              onChange={(e) => handle("nilai_rata", e.target.value)}
            />
          </div>
        </div>

        {pesan && <NoticeBox type={pesan.type} message={pesan.text} />}

        <Btn loading={loading} onClick={handleRegister} variant="success">
          Buat Akun
        </Btn>
      </div>

      <p className="mt-5 text-center text-sm text-slate-500">
        Sudah punya akun?{" "}
        <button onClick={onKeLogin} className="font-semibold text-cyan-800 hover:text-cyan-700">
          Masuk di sini
        </button>
      </p>
    </div>
  );
}

export default function HalamanAuth({ onLoginBerhasil, onKeAdmin }) {
  const [mode, setMode] = useState("login");

  const handleSuksesLogin = (siswa) => {
    if (onLoginBerhasil) onLoginBerhasil(siswa);
  };

  const handleSuksesRegister = (siswa) => {
    if (siswa && onLoginBerhasil) {
      onLoginBerhasil(siswa);
      return;
    }
    setMode("login");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 [font-family:'Plus_Jakarta_Sans','Segoe_UI',sans-serif] sm:px-6">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-0 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />

      <div className={`relative mx-auto w-full max-w-5xl`}>
        <div className="grid items-stretch overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl shadow-slate-900/40 lg:[grid-template-columns:420px_1fr] min-h-[520px]">
          <section className="bg-gradient-to-br from-cyan-950 via-cyan-900 to-slate-900 px-8 py-10 text-white sm:px-10 h-full">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100/70">
              PPDB Online Indramayu 2025/2026
            </p>
            <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
              {mode === "login" ? "Portal Siswa" : "Pendaftaran Akun Baru"}
            </h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-cyan-100/80">
              Satu tempat untuk mendaftar, melengkapi dokumen, dan memantau hasil seleksi secara realtime.
            </p>

            <div className="mt-8 inline-flex rounded-full border border-white/20 bg-white/5 p-1">
              {[
                { id: "login", label: "Masuk" },
                { id: "register", label: "Daftar" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setMode(tab.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    mode === tab.id
                      ? "bg-white text-slate-900"
                      : "text-cyan-100/80 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mt-12 rounded-2xl border border-white/15 bg-white/5 p-5 text-sm leading-7 text-cyan-50/90">
              <p>Bantuan pendaftaran tersedia selama periode PPDB berlangsung.</p>
              <p>Email: ppdb@indramayu.sch.id</p>
            </div>

            {onKeAdmin && (
              <button
                onClick={onKeAdmin}
                className="mt-6 text-sm font-semibold text-cyan-100 underline-offset-4 transition hover:text-white hover:underline"
              >
                Masuk ke portal admin
              </button>
            )}
          </section>

          <section className="overflow-y-auto bg-white px-6 py-8 sm:px-8">
            <div className="flex items-center justify-center min-h-full">
              {mode === "login" ? (
                <HalamanLogin
                  onSuksesLogin={handleSuksesLogin}
                  onKeRegister={() => setMode("register")}
                />
              ) : (
                <HalamanRegister
                  onSuksesRegister={handleSuksesRegister}
                  onKeLogin={() => setMode("login")}
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
