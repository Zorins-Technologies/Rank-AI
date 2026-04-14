"use client";

import { motion } from "framer-motion";

const plans = [
  {
    name: "Starter",
    price: 29,
    desc: "For solo creators and early-stage projects.",
    features: ["10 Synthesis Credits/mo", "Basic Authoring", "Global Indexing", "1 Target Site"],
    cta: "Launch Trial",
    popular: false
  },
  {
    name: "Growth",
    price: 79,
    desc: "The standard for aggressive market expansion.",
    features: ["40 Synthesis Credits/mo", "AEO Focus + Entities", "Deep Linking Pipeline", "3 Target Sites", "Priority Synthesis"],
    cta: "Expand Market",
    popular: true
  },
  {
    name: "Pro",
    price: 199,
    desc: "Enterprise-grade market dominance.",
    features: ["120 Synthesis Credits/mo", "White-label Studio", "Team Access (5 Seats)", "Unlimited Sites", "Custom LLM Fine-tuning"],
    cta: "Scale Globally",
    popular: false
  }
];

export default function PricingSection({ onAction }) {
  return (
    <section className="relative z-10 px-6 py-32 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl font-display font-black text-white tracking-tight">
            Select Your <span className="text-indigo-400">Scale.</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
            Standardize your SEO operations with a plan that matches your expansion goals.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`glass-card p-10 flex flex-col justify-between border-white/5 relative group transition-all duration-500 ${p.popular ? 'bg-indigo-500/[0.03] border-indigo-500/30 shadow-[0_0_80px_-20px_rgba(79,70,229,0.15)] ring-1 ring-indigo-500/10 scale-105 z-20' : 'bg-slate-900/40 hover:bg-slate-900/60 z-10'}`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-600/20">
                  Most Popular
                </div>
              )}

              <div>
                 <div className="mb-8">
                    <h3 className="text-2xl font-display font-black text-white uppercase italic tracking-tighter mb-1">{p.name}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{p.desc}</p>
                 </div>
                 
                 <div className="mb-10 flex items-baseline gap-2">
                    <span className="text-6xl font-display font-black text-white tracking-tighter">${p.price}</span>
                    <span className="text-slate-500 text-xs font-black uppercase tracking-widest italic">/ month</span>
                 </div>

                 <ul className="space-y-4 mb-12 border-t border-white/5 pt-8">
                    {p.features.map(f => (
                      <li key={f} className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                 </ul>
              </div>

              <button 
                onClick={() => onAction(p.name)}
                className={`w-full py-5 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all active:scale-[0.98] ${p.popular ? 'btn-brand shadow-xl' : 'btn-secondary border border-white/10 hover:border-white/20'}`}
              >
                {p.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
