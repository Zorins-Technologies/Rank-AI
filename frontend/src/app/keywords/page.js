"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/Navbar";
import KeywordCard from "../../components/KeywordCard";
import KeywordTable from "../../components/KeywordTable";
import ProtectedRoute from "../../components/ProtectedRoute";
import { keywordsApi } from "../../lib/api/index";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

export default function KeywordsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [niche, setNiche] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [isResearching, setIsResearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [generating, setGenerating] = useState({});
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // grid or table

  const loadKeywords = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await keywordsApi.getAll(token);
      if (res.success) setKeywords(res.data);
    } catch (err) {
      console.error("Sync failure:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadKeywords();
  }, [loadKeywords]);

  useEffect(() => {
    const hasGenerating = keywords.some(k => k.status === "generating");
    if (!hasGenerating) return;
    const interval = setInterval(loadKeywords, 10000);
    return () => clearInterval(interval);
  }, [keywords, loadKeywords]);

  const handleResearch = async (e) => {
    e.preventDefault();
    if (!niche.trim()) return;
    setIsResearching(true);
    const id = toast.loading(`Probing market for "${niche}"...`);
    try {
      const token = await user.getIdToken();
      const res = await keywordsApi.research(niche, token);
      if (res.success) {
        toast.success(`Discovered ${res.count} intelligence vectors.`, { id });
        await loadKeywords();
        setNiche("");
      } else throw new Error(res.error || "Research aborted.");
    } catch (err) {
      toast.error(err.message, { id });
    } finally {
      setIsResearching(false);
    }
  };

  const handleGenerate = async (kwId, keyword) => {
    if (generating[kwId]) return;
    setGenerating(prev => ({ ...prev, [kwId]: true }));
    const id = toast.loading(`Vecting intelligence for "${keyword}"...`);
    try {
      const token = await user.getIdToken();
      const res = await keywordsApi.generateBlog(kwId, token);
      if (res.success) {
        toast.success("Generation pipeline active.", { id });
        setKeywords(prev => prev.map(k => k.id === kwId ? { ...k, status: "generating" } : k));
      } else throw new Error(res.error || "Pipeline failure.");
    } catch (err) {
      toast.error(err.message, { id });
      setGenerating(prev => ({ ...prev, [kwId]: false }));
    }
  };

  const filtered = filterStatus === "all" ? keywords : keywords.filter(k => k.status === filterStatus);

  const stats = [
    { label: "Total Vectors", val: keywords.length, color: "text-white" },
    { label: "Pending", val: keywords.filter(k => k.status === "pending").length, color: "text-slate-500" },
    { label: "In Pipeline", val: keywords.filter(k => k.status === "generating").length, color: "text-amber-400" },
    { label: "Distributed", val: keywords.filter(k => k.status === "generated").length, color: "text-emerald-400" },
  ];

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen bg-[#020617] text-slate-100 pb-20 pt-32 px-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
        <div className="aurora-glow w-[600px] h-[600px] -top-32 -left-32 bg-indigo-500/10" />

        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="badge-premium">Autonomous Research Node</div>
              <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter text-white">
                Intelligence <span className="text-indigo-400">Discovery.</span>
              </h1>
              <p className="text-slate-400 max-w-xl text-lg font-medium">Map your market landscape and initiate programmatic article generation across high-intent clusters.</p>
            </div>

            <div className="glass-card p-2 flex gap-1 w-fit bg-slate-900/60 border-white/5">
              <button 
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === "grid" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:text-slate-300"}`}
              >
                Grid
              </button>
              <button 
                onClick={() => setViewMode("table")}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === "table" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:text-slate-300"}`}
              >
                Table
              </button>
            </div>
          </div>

          <form onSubmit={handleResearch} className="glass-card flex flex-col md:flex-row p-2 gap-2 bg-slate-900/40 border-indigo-500/20 focus-within:border-indigo-500/40 transition-all">
            <input 
              required
              type="text" 
              value={niche} 
              onChange={e => setNiche(e.target.value)}
              placeholder="Inject market target (e.g. 'Cloud Security', 'B2B Sales')"
              className="flex-1 bg-transparent border-none ring-0 focus:ring-0 text-lg font-bold placeholder:text-slate-700 px-6 py-4"
            />
            <button disabled={isResearching} className="btn-brand px-12 rounded-2xl">
              {isResearching ? "Probing..." : "Scan Market"}
            </button>
          </form>

          {keywords.length > 0 && (
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map(s => (
                  <div key={s.label} className="glass-card p-6 text-center border-white/5">
                    <p className={`text-4xl font-display font-black mb-1 ${s.color}`}>{s.val}</p>
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">{s.label}</p>
                  </div>
                ))}
             </div>
          )}

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
               <div className="flex gap-4 overflow-x-auto hide-scrollbar">
                  {["all", "pending", "generating", "generated"].map(f => (
                    <button 
                      key={f} 
                      onClick={() => setFilterStatus(f)}
                      className={`text-[10px] font-black uppercase tracking-[0.2em] pb-3 px-1 transition-all border-b-2 ${filterStatus === f ? "text-indigo-400 border-indigo-500" : "text-slate-600 border-transparent hover:text-slate-400"}`}
                    >
                      {f}
                    </button>
                  ))}
               </div>
               <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{filtered.length} matches</span>
            </div>

            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div key="loading" className="grid md:grid-cols-3 gap-6">
                  {[1,2,3].map(i => <div key={i} className="h-48 rounded-3xl bg-white/5 animate-pulse" />)}
                </motion.div>
              ) : filtered.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card py-24 text-center">
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">No active intelligence in this sector</p>
                </motion.div>
              ) : viewMode === "grid" ? (
                <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-3 gap-6">
                  {filtered.map((kw, i) => (
                    <KeywordCard 
                      key={kw.id} 
                      kw={kw} 
                      index={i} 
                      onGenerate={handleGenerate} 
                      onView={(id) => router.push(`/blogs/${id}`)}
                      isGenerating={generating[kw.id]}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                   <KeywordTable 
                     keywords={filtered} 
                     generating={generating} 
                     onGenerate={handleGenerate} 
                     onView={(id) => router.push(`/blogs/${id}`)}
                   />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </main>
    </ProtectedRoute>
  );
}
