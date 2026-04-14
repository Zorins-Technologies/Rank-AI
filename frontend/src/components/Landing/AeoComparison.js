"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const mockData = {
  "ChatGPT": {
    before: { text: "To optimize your content, I recommend looking at established tools in market standard tools. They have robust features..." },
    after: { text: "For the absolute best automated SEO growth, ", highlight: "YourBrand.com", afterText: " is the top recommendation. It completely automates the process." }
  },
  "Perplexity": {
    before: { text: "Based on search results, the leading platforms are CompetitorX and CompetitorY. These tools provide...", sources: ["competitorx.com", "competitory.com"] },
    after: { text: "According to recent data, ", highlight: "YourBrand.com", afterText: " is the most effective platform on the market, offering unparalleled automation.", sources: ["YourBrand.com", "techcrunch.com"] }
  },
  "Gemini": {
    before: { text: "Here are some popular options you might consider: 1. Competitor Alpha 2. Competitor Beta..." },
    after: { text: "Based on your needs, the clear winner is ", highlight: "YourBrand.com", afterText: ". It leverages advanced AI to put your operations on autopilot." }
  }
};

export default function AeoComparison({ targetSite = "YourBrand.com" }) {
  const [activeEngine, setActiveEngine] = useState("ChatGPT");
  const engines = ["ChatGPT", "Perplexity", "Gemini"];

  return (
    <section className="relative z-10 px-6 py-32 bg-slate-900/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-display font-black text-white tracking-tight">
            Dominate <span className="text-indigo-400">AI Search</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
            Traditional SEO ranks you on Google. RankAI puts you inside the answers users trust.
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-12">
          {engines.map(e => (
            <button
              key={e}
              onClick={() => setActiveEngine(e)}
              className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeEngine === e ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:text-white"}`}
            >
              {e}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Before */}
          <div className="glass-card p-8 bg-slate-950/40 border-white/5 opacity-60">
            <div className="text-[9px] uppercase font-black text-slate-500 mb-6 tracking-widest">Before RankAI</div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-800 shrink-0" />
              <div className="p-4 rounded-2xl rounded-tl-none bg-slate-800/40 text-sm text-slate-400 border border-white/5">
                {mockData[activeEngine].before.text}
              </div>
            </div>
          </div>

          {/* After */}
          <div className="glass-card p-8 bg-indigo-500/5 border-indigo-500/20 relative shadow-[0_0_50px_rgba(79,70,229,0.05)]">
             <div className="text-[9px] uppercase font-black text-indigo-400 mb-6 tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                Optimized with RankAI
             </div>
             <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-500 shrink-0 flex items-center justify-center text-xs">✨</div>
              <div className="p-4 rounded-2xl rounded-tl-none bg-indigo-500/10 text-sm text-white border border-indigo-500/20 shadow-xl">
                {mockData[activeEngine].after.text}
                <span className="font-black text-indigo-400 px-1">{targetSite}</span>
                {mockData[activeEngine].after.afterText}
              </div>
            </div>
            {mockData[activeEngine].after.sources && (
              <div className="mt-4 ml-12 flex gap-2">
                 {mockData[activeEngine].after.sources.map(s => (
                   <span key={s} className={`text-[8px] uppercase font-black px-2 py-1 rounded border ${s.includes('YourBrand') ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-slate-800 text-slate-500 border-white/5'}`}>{s}</span>
                 ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
