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

export default function KeywordTable({ keywords, generating, onGenerate, onView }) {
  return (
    <div className="glass-card overflow-hidden border-white/5">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-slate-900/40 text-[10px] uppercase font-black tracking-widest text-slate-500">
              <th className="px-6 py-4">Keyword Entity</th>
              <th className="px-6 py-4 text-center">Density / Vol</th>
              <th className="px-6 py-4 text-center">Difficulty</th>
              <th className="px-6 py-4 text-center">Intent</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {keywords.map((kw, i) => {
              const isGenerating = kw.status === "generating" || generating[kw.id];
              const isGenerated = kw.status === "generated";
              
              return (
                <motion.tr
                  key={kw.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-6 py-4">
                    <p className="font-bold text-white group-hover:text-brand-400 transition-colors">
                      {kw.keyword}
                    </p>
                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">{kw.niche}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-sm font-black text-slate-300">{kw.search_volume?.toLocaleString() || "—"}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${DIFFICULTY_COLORS[kw.difficulty] || DIFFICULTY_COLORS.medium}`}>
                      {kw.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${INTENT_COLORS[kw.intent] || INTENT_COLORS.informational}`}>
                      {kw.intent}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isGenerated ? (
                      <button onClick={() => onView(kw.blog_id)} className="text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:underline">
                        View Analysis
                      </button>
                    ) : (
                      <button
                        onClick={() => onGenerate(kw.id, kw.keyword)}
                        disabled={isGenerating}
                        className={`text-[10px] font-black uppercase tracking-widest ${
                          isGenerating ? "text-amber-400 animate-pulse" : "text-brand-400 hover:text-brand-300"
                        }`}
                      >
                        {isGenerating ? "Vecting..." : "Forge Blog"}
                      </button>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
