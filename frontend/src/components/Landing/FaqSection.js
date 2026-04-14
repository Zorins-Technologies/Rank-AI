"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const faqs = [
  {
    question: "How is AEO different from traditional SEO?",
    answer: "SEO focuses on search engines. AEO (Answer Engine Optimization) focuses on AI models like ChatGPT and Perplexity. RankAI handles both by forging content that AI prefers to cite."
  },
  {
    question: "Is AI-generated content safe for my URL?",
    answer: "Absolutely. We follow Google's E-E-A-T guidelines strictly. Our engine doesn't just 'write text'; it synthesizes expert-level perspectives backed by entity mapping."
  },
  {
    question: "How fast will I see results?",
    answer: "Most users see indexing acceleration within 7 days and initial AI engine citations within 3-6 weeks, significantly faster than traditional 6-month SEO cycles."
  },
  {
    question: "Can I cancel at any point?",
    answer: "Of course. We offer month-to-month flexibility. You can deactivate your node with a single click in your billing dashboard."
  }
];

export default function FaqSection() {
  const [active, setActive] = useState(null);

  return (
    <section className="relative z-10 px-6 py-32 border-t border-white/5">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16 space-y-4">
           <h2 className="text-4xl font-display font-black text-white uppercase tracking-tight">Deployment <span className="text-indigo-400">FAQ.</span></h2>
           <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Everything you need to know about the pipeline.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div key={i} className="glass-card border-white/5 bg-slate-900/40 overflow-hidden">
               <button 
                 onClick={() => setActive(active === i ? null : i)}
                 className="w-full px-8 py-6 flex items-center justify-between text-left group"
               >
                 <span className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight italic">{f.question}</span>
                 <span className={`text-2xl transition-transform ${active === i ? 'rotate-45' : ''}`}>+</span>
               </button>
               <AnimatePresence>
                 {active === i && (
                   <motion.div
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: "auto", opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     className="px-8 pb-8"
                   >
                     <p className="text-slate-400 leading-relaxed font-medium">
                       {f.answer}
                     </p>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
