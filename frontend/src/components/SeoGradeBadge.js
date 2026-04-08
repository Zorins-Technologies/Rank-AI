export default function SeoGradeBadge({ grade }) {
  const colorMap = {
    A: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30", dot: "bg-emerald-400" },
    B: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30", dot: "bg-blue-400" },
    C: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30", dot: "bg-amber-400" },
    D: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30", dot: "bg-orange-400" },
    F: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30", dot: "bg-red-400" },
  };

  if (!grade) return null;

  const style = colorMap[grade] || { bg: "bg-slate-700/20", text: "text-slate-400", border: "border-slate-700/30", dot: "bg-slate-400" };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] ${style.bg} ${style.text} ${style.border} border backdrop-blur-md shadow-lg shadow-black/20`}>
      <span className={`h-1 w-1 rounded-full ${style.dot} animate-pulse-slow shadow-[0_0_8px_rgba(255,255,255,0.5)]`} />
      Grade {grade}
    </span>
  );
}
