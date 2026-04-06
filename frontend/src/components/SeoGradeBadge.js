export default function SeoGradeBadge({ grade }) {
  const colorMap = {
    A: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
    B: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
    C: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
    D: "bg-orange-500/15 text-orange-400 border border-orange-500/20",
    F: "bg-red-500/15 text-red-400 border border-red-500/20",
  };

  if (!grade) return null;

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${colorMap[grade] || "bg-slate-700 text-slate-100 border border-slate-700/50"}`}>
      SEO {grade}
    </span>
  );
}
