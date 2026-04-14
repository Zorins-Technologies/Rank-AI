"use client";

import { motion } from "framer-motion";

export default function HowItWorks() {
  const steps = [
    { 
      id: "01",
      title: "Market Probe", 
      desc: "Our engine crawls your niche to identify high-intent entities and search clusters that AI search engines prioritize.",
      icon: "🔍"
    },
    { 
      id: "02",
      title: "Knowledge Synthesis", 
      desc: "Gemini 2.0 Flash forges expert-level articles that satisfy both human readers and AI retrieval benchmarks.",
      icon: "🧠"
    },
    { 
      id: "03",
      title: "Authority Distribution", 
      desc: "Automatic indexing accelerators and backlink forging put your brand at the center of the search map.",
      icon: "🚀"
    }
  ];

  return (
    <section className="relative z-10 px-6 py-32 border-t border-white/5 overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-500/5 blur-[120px] rounded-full translate-x-1/2" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl font-display font-black text-white tracking-tight">
            Programmatic <span className="text-indigo-400">Growth.</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
            A fully autonomous pipeline that turns raw URLs into market authority.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {steps.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="relative group lg:border-l lg:border-white/5 lg:pl-12 lg:pb-12"
            >
              <div className="absolute top-0 left-0 -translate-x-1/2 hidden lg:block">
                 <div className="w-10 h-10 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:border-indigo-500 group-hover:text-indigo-400 transition-all duration-300">
                   {step.id}
                 </div>
              </div>

              <div className="text-4xl mb-6">{step.icon}</div>
              <h3 className="text-2xl font-display font-black text-white mb-4 uppercase tracking-tighter italic">
                {step.title}
              </h3>
              <p className="text-slate-400 leading-relaxed font-medium">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
