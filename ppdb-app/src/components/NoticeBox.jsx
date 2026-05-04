const STYLES = {
  error: {
    wrap: "border-rose-200 bg-rose-50 text-rose-700",
    title: "Terjadi kesalahan",
  },
  success: {
    wrap: "border-emerald-200 bg-emerald-50 text-emerald-700",
    title: "Berhasil",
  },
  warning: {
    wrap: "border-amber-200 bg-amber-50 text-amber-700",
    title: "Perhatian",
  },
  info: {
    wrap: "border-cyan-200 bg-cyan-50 text-cyan-700",
    title: "Informasi",
  },
};

export default function NoticeBox({ type = "info", title, message, className = "" }) {
  const preset = STYLES[type] || STYLES.info;

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm leading-6 ${preset.wrap} ${className}`.trim()}>
      {(title || preset.title) && <div className="mb-0.5 font-semibold">{title || preset.title}</div>}
      <div>{message}</div>
    </div>
  );
}
