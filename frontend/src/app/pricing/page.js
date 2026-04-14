"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function PricingPage() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("targetUrl");
    if (stored) setUrl(stored);

    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    router.push('/signup?intent=onboarding');
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#020617] flex items-center justify-center py-20 px-6 relative overflow-hidden text-slate-100">
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
        <div className="aurora-glow w-[800px] h-[800px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600/10 pointer-events-none" />

        <div className="max-w-2xl w-full relative z-10">
          <div className="glass-card bg-slate-900/60 border border-indigo-500/20 p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-emerald-500 to-purple-500" />
            
            <div className="text-center space-y-6 mb-10">
               <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-white leading-tight">
                 Strategic <span className="text-indigo-400">Synthesis</span> Ready.
               </h1>
               <p className="text-slate-400 font-medium text-lg">
                 Deploy your autonomous growth node and dominate AI search results.
               </p>

               <div className="inline-flex flex-col items-center p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl w-full max-w-sm mx-auto">
                 <span className="text-[10px] uppercase font-black tracking-widest text-amber-500 mb-1">Entity Reservation Expires In</span>
                 <span className="text-4xl font-display font-black text-white tracking-widest">{formatTime(timeLeft)}</span>
               </div>
            </div>

            <div className="glass-card bg-[#020617]/50 border-white/5 p-8 mb-10 rounded-2xl">
               <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h2 className="text-3xl font-display font-black text-indigo-400 mb-2">Growth Trial</h2>
                    <p className="text-sm text-slate-500 font-medium italic">Full pipeline access for 7 days.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-5xl font-display font-black text-white">$1</span>
                  </div>
               </div>
               
               <div className="w-full h-px bg-white/5 my-6" />
               
               <ul className="space-y-4">
                  {[
                    "40 Synthesis Vectors per month",
                    "Deep Entity Mapping & Citations",
                    "Autonomous Backlink Forging",
                    "AI Visibility Console (ChatGPT/Perplexity)",
                    "Enterprise Indexing Accelerator"
                  ].map((b, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300 font-medium text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                      {b}
                    </li>
                  ))}
               </ul>
            </div>

            <button 
              onClick={handleStart}
              className="btn-brand w-full py-5 rounded-xl shadow-[0_0_50px_rgba(79,70,229,0.3)] hover:shadow-[0_0_80px_rgba(79,70,229,0.5)] transition-all"
            >
              Initialize Node ($1)
            </button>
            <p className="text-[10px] text-center text-slate-500 uppercase tracking-widest mt-6 font-bold flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-slate-700" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
              Encrypted Synthesis Channel
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
