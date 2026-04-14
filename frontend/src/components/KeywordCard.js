"use client";

import { motion } from "framer-motion";

const DIFFICULTY_COLORS = {
  easy: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  hard: "text-red-400 bg-red-400/10 border-red-400/20",
};

const INTENT_COLORS = {
  informational: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  commercial: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  transactional: "text-brand-400 bg-brand-400/10 border-brand-400/20",
};

const STATUS_UI = {
  pending: { label: "Target", icon: "💎", classes: "text-slate-400 bg-slate-400/10 border-slate-400/20" },
  generating: { label: "Vecting", icon: "⚡", classes: "text-amber-400 bg-amber-400/10 border-amber-400/20", pulse: true },
  generated: { label: "Indexed", icon: "✓", classes: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  failed: { label: "Halted", icon: "⚠️", classes: "text-red-400 bg-red-400/10 border-red-400/20" },
};

export default function KeywordCard({ kw, index, onGenerate, onView, isGenerating }) {
  const status = STATUS_UI[kw.status] || STATUS_UI.pending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card p-6 flex flex-col group hover:border-brand-500/30 transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${status.classes}`}>
          {status.pulse && <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" />}
          {status.icon} {status.label}
        </span>
        <div className="flex gap-1.5">
           <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-sm border ${DIFFICULTY_COLORS[kw.difficulty] || DIFFICULTY_COLORS.medium}`}>
             {kw.difficulty}
           </span>
        </div>
      </div>

      <h3 className="text-lg font-bold text-white mb-1 group-hover:text-brand-400 transition-colors truncate">
        {kw.keyword}
      </h3>
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-6">{kw.niche}</p>

      <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-white/5">
        <div>
           <p className="text-[8px] font-black uppercase text-slate-600 tracking-tighter mb-1">Vol / Mo</p>
           <p className="text-sm font-black text-white">{kw.search_volume?.toLocaleString() || "—"}</p>
        </div>
        <div>
           <p className="text-[8px] font-black uppercase text-slate-600 tracking-tighter mb-1">Intent</p>
           <span className={`text-[9px] font-bold ${INTENT_COLORS[kw.intent] || INTENT_COLORS.informational} bg-transparent border-none p-0`}>
             {kw.intent}
           </span>
        </div>
      </div>

      <div className="mt-auto">
        {kw.status === "generated" ? (
          <button onClick={() => onView(kw.blog_id)} className="btn-secondary w-full py-2 text-[10px] uppercase font-black tracking-widest">
            View Analysis →
          </button>
        ) : (
          <button
            onClick={() => onGenerate(kw.id, kw.keyword)}
            disabled={isGenerating || kw.status === "failed"}
            className={`w-full py-2 rounded-xl text-[10px] uppercase font-black tracking-widest border transition-all ${
              isGenerating ? "border-amber-500/20 text-amber-400 bg-amber-400/5" : "btn-brand shadow-none"
            }`}
          >
            {isGenerating ? "Vecting..." : kw.status === "failed" ? "Failed" : "Generate Blog"}
          </button>
        )}
      </div>
    </motion.div>
  );
}
