"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";

export default function HomePage() {
  const [keyword, setKeyword] = useState("");
  const router = useRouter();

  const handleSearch = (event) => {
    event.preventDefault();
    const trimmed = keyword.trim();
    const searchPath = trimmed ? `/blogs?search=${encodeURIComponent(trimmed)}` : "/blogs";
    router.push(searchPath);
  };

  return (
    <>
      <Navbar />
      <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#020617] text-slate-100 flex flex-col justify-center">
        {/* Background Aurora Elements */}
        <div className="aurora-glow w-[600px] h-[600px] -top-40 -left-40 bg-indigo-600/20" />
        <div className="aurora-glow w-[500px] h-[500px] bottom-0 -right-20 bg-purple-600/15" />
        <div className="absolute inset-0 bg-grid opacity-10" />

        <section className="relative z-10 px-6 py-24 lg:py-40">
          <div className="mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="space-y-10"
              >
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.4em] text-brand-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                  </span>
                  AI Content Intelligence
                </div>

                <h1 className="text-6xl md:text-8xl font-display font-black leading-[0.95] gradient-text tracking-tighter">
                  Automate your <br />
                  <span className="brand-text">Content Engine.</span>
                </h1>

                <p className="max-w-xl text-xl leading-relaxed text-slate-400 font-medium">
                  Generate high-authority articles, premium visuals, and data-driven drafts in seconds with our advanced Gemini-powered workflow.
                </p>

                <div className="flex flex-col sm:flex-row gap-5 pt-4">
                  <Link href="/keywords" className="btn-brand px-10 py-5 text-sm uppercase tracking-widest font-black flex items-center justify-center gap-2">
                    <span className="text-xl">🚀</span> Launch AutoSEO
                  </Link>
                  <Link href="/generate" className="btn-secondary px-10 py-5 text-sm uppercase tracking-widest font-black bg-slate-900 border-white/5">
                    Manual Studio
                  </Link>
                </div>

                <div className="flex items-center gap-12 pt-10 border-t border-white/5">
                  <div>
                    <p className="text-3xl font-display font-black text-white">Gemini 2.0</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Text Intelligence</p>
                  </div>
                  <div className="w-px h-12 bg-white/10" />
                  <div>
                    <p className="text-3xl font-display font-black text-white">Imagen 3</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Visual Studio</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                className="relative hidden lg:block"
              >
                <div className="glass-card p-1.5 bg-gradient-to-br from-white/10 to-transparent">
                   <div className="rounded-[2.4rem] overflow-hidden bg-slate-950/80 p-10 space-y-8 backdrop-blur-3xl">
                      <div className="space-y-4">
                        <div className="h-1.5 w-32 rounded-full bg-brand-500/40" />
                        <h3 className="text-3xl font-display font-black text-white tracking-tight">Intelligence Dashboard</h3>
                      </div>
                      
                      <div className="glass-card bg-white/5 border-white/5 p-8 space-y-6">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Growth Potential</span>
                          <span className="text-emerald-400 font-black font-display text-xl">+142%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Difficulty Index</span>
                          <span className="text-amber-400 font-black font-display text-xl underline decoration-amber-400/20 underline-offset-4 font-mono">MODERATE</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "72%" }}
                            transition={{ duration: 2, delay: 1 }}
                            className="h-full bg-gradient-to-r from-brand-600 via-brand-400 to-emerald-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                         <div className="glass-card bg-brand-500/5 border-brand-500/20 p-6 text-center group/card transition-colors hover:bg-brand-500/10">
                            <p className="text-[10px] text-brand-400 uppercase font-black mb-2 tracking-widest">SEO Score</p>
                            <p className="text-4xl font-display font-black text-white">96</p>
                         </div>
                         <div className="glass-card bg-purple-500/5 border-purple-500/20 p-6 text-center group/card transition-colors hover:bg-purple-500/10">
                            <p className="text-[10px] text-purple-400 uppercase font-black mb-2 tracking-widest">Authority</p>
                            <p className="text-4xl font-display font-black text-white">High</p>
                         </div>
                      </div>
                   </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-brand-500/20 blur-[100px] animate-pulse-slow" />
                <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-purple-500/15 blur-[100px] animate-pulse-slow" />
              </motion.div>

            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="relative z-10 px-6 pb-40">
          <div className="mx-auto max-w-7xl">
            <div className="grid md:grid-cols-3 gap-10">
               {[
                { title: "Auto Keyword Discovery", desc: "Enter a niche and let Gemini find 30+ high-volume, low-competition keywords.", icon: "🎯" },
                { title: "Set & Forget Engine", desc: "Auto-generate up to 5 SEO-optimized articles daily. Passive traffic generation.", icon: "⚙️" },
                { title: "Intelligent Studio", desc: "Built-in optimization checks for metadata, keyword density, and word counts.", icon: "📈" }
               ].map((feature, i) => (
                 <motion.div
                   key={feature.title}
                   initial={{ opacity: 0, y: 30 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.4 + (i * 0.1), duration: 0.8 }}
                   className="glass-card glass-card-hover p-10 group"
                 >
                    <div className="text-4xl mb-8 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">{feature.icon}</div>
                    <h3 className="text-2xl font-display font-black text-white mb-4 group-hover:text-brand-400 transition-colors uppercase tracking-tight">{feature.title}</h3>
                    <p className="text-slate-400 leading-relaxed font-medium">{feature.desc}</p>
                 </motion.div>
               ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
