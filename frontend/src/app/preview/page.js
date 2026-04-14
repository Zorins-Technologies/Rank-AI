"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function PreviewPage() {
  const router = useRouter();
  const [topics, setTopics] = useState([]);
  const [brandName, setBrandName] = useState("");

  useEffect(() => {
    const storedTopics = localStorage.getItem("preview_topics");
    const storedContext = localStorage.getItem("onboarding_data");
    
    if (storedTopics) {
      setTopics(JSON.parse(storedTopics));
    } else {
      router.push("/");
    }

    if (storedContext) {
      try {
        const parsed = JSON.parse(storedContext);
        if (parsed.context?.brand_name) {
          setBrandName(parsed.context.brand_name);
        }
      } catch (e) {}
    }
  }, [router]);

  if (topics.length === 0) return null;

  return (
    <main className="min-h-[calc(100vh-4rem)] relative z-10 flex flex-col items-center py-20 px-4 sm:px-6 w-full max-w-5xl mx-auto">
      <div className="text-center mb-16 space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
          Your Growth Strategy
        </h1>
        <p className="text-slate-400 text-lg">
          We analyzed the landscape for {brandName || "your brand"}. Here is an automated roadmap designed to dominate search intent.
        </p>
      </div>

      <div className="w-full space-y-6">
        {topics.map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-6 md:p-8"
          >
            {idx === 0 && (
              <div className="mb-6 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                 <p className="text-xs uppercase tracking-wider font-bold text-indigo-400 mb-3 flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                   High Priority Target
                 </p>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                   <div className="bg-slate-900/40 p-3 rounded-lg border border-white/5">
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Estimated Clicks</p>
                      <p className="text-sm font-bold text-white">1,200+ / mo</p>
                   </div>
                   <div className="bg-slate-900/40 p-3 rounded-lg border border-white/5">
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">AI Recommendation</p>
                      <p className="text-sm font-bold text-indigo-400">High</p>
                   </div>
                   <div className="bg-slate-900/40 p-3 rounded-lg border border-white/5">
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Content Type</p>
                      <p className="text-sm font-bold text-white">Foundational</p>
                   </div>
                 </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 border-b border-white/5 pb-4">
              <h3 className="text-xl font-bold text-slate-100">{item.title || item.topic}</h3>
              <div className="flex gap-2">
                 <span className="px-3 py-1 bg-slate-800 border border-white/10 rounded text-[10px] uppercase font-bold tracking-widest text-slate-400">
                    Day {item.publish_day || idx + 1}
                 </span>
                 <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded text-[10px] uppercase font-bold tracking-widest text-indigo-400">
                    {item.intent}
                 </span>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              <div>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Target Keyword</p>
                 <p className="text-slate-300 text-sm font-medium truncate">{item.keyword}</p>
              </div>
              <div>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Traffic Potential</p>
                 <p className="text-slate-300 text-sm font-medium">{item.traffic_potential || "High"}</p>
              </div>
              <div>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Difficulty</p>
                 <p className="text-slate-300 text-sm font-medium">{item.ranking_difficulty || "Medium"}</p>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed font-medium mt-4">
               {item.strategy_reason}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-12 w-full max-w-sm">
        <p className="text-slate-400 mb-6 font-medium text-sm">Deploy this roadmap securely into your dashboard to activate automated publishing.</p>
        <button 
          onClick={() => router.push('/signup?intent=onboarding')}
          className="btn-brand w-full"
        >
          Initialize Account
        </button>
      </div>
    </main>
  );
}
