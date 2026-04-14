"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    name: "James Wilson",
    role: "SEO Manager",
    review: "Traffic went from 300 to 8,000 in just 3 months. The keyword discovery module alone is worth ten times the price.",
  },
  {
    name: "Sarah Chen",
    role: "Startup Founder",
    review: "We started ranking inside ChatGPT and Perplexity answers within weeks. This is the future of search visibility.",
  },
  {
    name: "Marcus Schmidt",
    role: "Marketing Director",
    review: "The automated backlinks and content synthesis saved us $15k per month in agency fees. Incredible ROI.",
  }
];

export default function SocialProof() {
  return (
    <section className="relative z-10 px-6 py-32 bg-slate-900/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
           <span className="text-[10px] uppercase font-black text-indigo-400 tracking-[0.4em]">Verified Performance</span>
           <h2 className="text-4xl md:text-5xl font-display font-black text-white tracking-tight">Trusted by <span className="text-indigo-400">Visionaries.</span></h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-10 flex flex-col justify-between hover:border-indigo-500/30 transition-all"
            >
              <p className="text-slate-400 text-lg font-medium italic leading-relaxed mb-10">"{t.review}"</p>
              <div>
                <p className="text-white font-black uppercase tracking-widest leading-none mb-1">{t.name}</p>
                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 flex flex-wrap justify-center gap-12 opacity-30 grayscale filter invert">
           {/* Mock logic for trust badges */}
           <div className="h-6 w-32 bg-slate-500 rounded" />
           <div className="h-6 w-24 bg-slate-500 rounded" />
           <div className="h-6 w-28 bg-slate-500 rounded" />
           <div className="h-6 w-32 bg-slate-500 rounded" />
        </div>
      </div>
    </section>
  );
}
