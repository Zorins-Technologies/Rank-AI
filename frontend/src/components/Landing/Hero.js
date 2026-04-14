"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function Hero({ onAnalyze, loading, error, loadingStep, loadingSteps }) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onAnalyze(url);
  };

  return (
    <section className="relative z-10 px-6 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-10"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Autonomous Growth Pipeline
            </div>

            <h1 className="text-6xl md:text-8xl font-display font-black leading-[0.95] tracking-tighter text-white">
              Dominate <br />
              <span className="text-indigo-400">AI Search</span>
              <span className="block mt-4 text-4xl md:text-5xl opacity-80">— Hands-Free Traffic</span>
            </h1>

            <p className="max-w-xl text-xl leading-relaxed text-slate-400 font-medium">
              RankAI automates content synthesis, authority mapping, and entity optimization to put your brand at the core of Google, ChatGPT, and Perplexity results.
            </p>

            <div className="space-y-6 pt-4">
              <form onSubmit={handleSubmit} className="relative max-w-lg">
                <motion.div 
                  animate={error ? { x: [-5, 5, -5, 5, 0], transition: { duration: 0.4 } } : {}}
                  className="relative group"
                >
                  <input
                    autoFocus
                    type="text"
                    placeholder="Input your website URL..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={loading}
                    className={`input-field pr-40 transition-all duration-300 focus:ring-4 focus:ring-indigo-500/20 ${
                      error ? "border-red-500 ring-4 ring-red-500/10" : "group-hover:border-white/20"
                    }`}
                  />
                  <button 
                    type="submit"
                    disabled={loading}
                    className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 shadow-lg shadow-indigo-500/20 active:scale-95"
                  >
                    {loading ? (
                       <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Initialize Audit"
                    )}
                  </button>
                </motion.div>

                <AnimatePresence mode="wait">
                  {error && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute -bottom-6 left-1 text-[10px] text-red-400 font-black uppercase tracking-widest"
                    >
                      {error}
                    </motion.p>
                  )}
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -bottom-10 left-1 flex items-center gap-3"
                    >
                       <div className="flex gap-1">
                          {[0, 1, 2].map(i => (
                            <motion.div 
                              key={i}
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                              className="w-1 h-1 bg-indigo-400 rounded-full"
                            />
                          ))}
                       </div>
                       <AnimatePresence mode="wait">
                         <motion.span 
                           key={loadingStep}
                           initial={{ opacity: 0, y: 5 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -5 }}
                           className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em] italic"
                         >
                           {loadingSteps[loadingStep]}
                         </motion.span>
                       </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </motion.div>

          {/* Graphical Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="glass-card p-1.5 bg-gradient-to-br from-white/10 to-transparent">
               <div className="rounded-[2.4rem] overflow-hidden bg-slate-950/80 p-10 space-y-8 backdrop-blur-3xl relative">
                  <div className="flex items-center justify-between">
                    <div className="space-y-4">
                      <div className="h-1.5 w-32 rounded-full bg-indigo-500/40" />
                      <h3 className="text-3xl font-display font-black text-white tracking-tight">Vecting Pipeline</h3>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                       <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                       </span>
                       <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active Synthesis</span>
                    </div>
                  </div>
                  
                  <div className="glass-card bg-white/5 border-white/5 p-8 space-y-6 relative overflow-hidden group/main">
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Entity Recognition</span>
                      <span className="text-emerald-400 font-black font-display text-xl">+440%</span>
                    </div>
                    <div className="h-16 w-full relative z-10 flex items-end gap-1">
                       {[40, 60, 45, 70, 55, 90, 80, 100].map((h, i) => (
                         <motion.div 
                           key={i}
                           initial={{ height: 0 }}
                           animate={{ height: `${h}%` }}
                           transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
                           className="flex-1 bg-indigo-500/20 rounded-t-sm"
                         />
                       ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="glass-card bg-indigo-500/5 border-indigo-500/20 p-6 text-center">
                        <p className="text-[10px] text-indigo-400 uppercase font-black mb-2 tracking-widest">E-E-A-T Score</p>
                        <p className="text-4xl font-display font-black text-white">99.4</p>
                     </div>
                     <div className="glass-card bg-purple-500/5 border-purple-500/20 p-6 text-center">
                        <p className="text-[10px] text-purple-400 uppercase font-black mb-2 tracking-widest">Citations</p>
                        <p className="text-4xl font-display font-black text-white">4.2k</p>
                     </div>
                  </div>
               </div>
            </div>
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-500/20 blur-[100px] animate-pulse-slow" />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
