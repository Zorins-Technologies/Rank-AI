"use client";

import { motion } from "framer-motion";

export default function StatsGrid() {
  const stats = [
    { label: "Partner Sites", val: "1,200+", detail: "Enterprise Grade" },
    { label: "Synthesis Rate", val: "50k+", detail: "Articles / Mo" },
    { label: "Avg CTR Lift", val: "+148%", detail: "Targeted Traffic" },
    { label: "Market Dominance", val: "AEO #1", detail: "Citations" },
  ];

  return (
    <section className="relative z-10 px-6 py-20 border-y border-white/5 bg-slate-900/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center lg:text-left"
            >
              <p className="text-4xl lg:text-5xl font-display font-black text-white mb-2">{s.val}</p>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-indigo-400">{s.label}</p>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-600">{s.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
