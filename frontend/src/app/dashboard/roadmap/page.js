"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "../../../components/Navbar";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { useAuth } from "../../../context/AuthContext";
import { api } from "../../../lib/api/index";
import { toast } from "react-hot-toast";

const INTENT_UI = {
  informational: "border-blue-500/20 text-blue-400",
  commercial: "border-indigo-500/20 text-indigo-400",
  transactional: "border-emerald-500/20 text-emerald-400",
};

export default function RoadmapPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project_id");

  const [items, setItems] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (user && projectId) loadData();
  }, [user, projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const [pRes, mRes] = await Promise.all([
        api.growthPlan.get(projectId, token),
        api.projects.getAll(token)
      ]);
      if (pRes.success) setItems(pRes.data);
      if (mRes.success) setProject(mRes.data.find(p => p.id === projectId));
    } catch {
      toast.error("Failed to fetch trajectory.");
    } finally {
      setLoading(false);
    }
  };

  const runEngine = async () => {
    const id = toast.loading("Formulating strategy matrix...");
    try {
      setGenerating(true);
      const token = await user.getIdToken();
      await api.growthPlan.generate({ project_id: projectId, website_url: project.website_url, niche: project.niche_value }, token);
      await loadData();
      toast.success("Roadmap initialized.", { id });
    } catch {
      toast.error("Matrix generation halted.", { id });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen bg-[#020617] text-slate-100 pb-20 pt-32 px-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />

        <div className="max-w-5xl mx-auto space-y-10 relative z-10 w-full flex flex-col md:flex-row gap-10">
           
           <div className="w-full md:w-1/3 shrink-0 flex flex-col gap-6 pt-4 sticky top-32">
              <div>
                 <div className="badge-premium mb-2">Algorithm Directives</div>
                 <h1 className="text-4xl font-display font-black tracking-tight text-white mb-2">Execution <span className="text-indigo-400">Path.</span></h1>
                 <p className="text-slate-400 text-sm">Pre-calculated content vectors mapped over a 30-day index cycle.</p>
              </div>

              {items.length > 0 && (
                <div className="glass-card p-6 shadow-[0_0_30px_rgba(99,102,241,0.05)] border-indigo-500/20">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Velocity Metrics</p>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                         <span className="text-xs font-medium text-slate-400">Total Vectors</span>
                         <span className="text-sm font-bold text-white">{items.length}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                         <span className="text-xs font-medium text-slate-400">Completion</span>
                         <span className="text-sm font-bold text-emerald-400">{items.filter(i=>i.status==='completed').length} / {items.length}</span>
                      </div>
                   </div>
                </div>
              )}

              <button onClick={runEngine} disabled={generating || !project} className="btn-brand w-full py-4 text-[10px]">
                 {generating ? "Computing Sequence..." : items.length > 0 ? "Override Existing Matrix" : "Initialize Sequence"}
              </button>
           </div>

           <div className="w-full md:w-2/3 flex-1">
             {loading ? (
                <div className="space-y-4"><div className="h-64 rounded-2xl bg-white/5 animate-pulse"/><div className="h-64 rounded-2xl bg-white/5 animate-pulse"/></div>
             ) : items.length === 0 ? (
                <div className="glass-card py-20 text-center"><p className="text-sm text-slate-500 font-bold uppercase tracking-widest">No sequential data found</p></div>
             ) : (
                <div className="space-y-4">
                   {items.sort((a,b)=>a.publish_day - b.publish_day).map(item => {
                     const isDone = item.status === "completed";
                     const ui = INTENT_UI[item.intent] || "border-slate-500/20 text-slate-400";
                     return (
                        <motion.div key={item.id} className={`glass-card p-5 group flex items-start gap-4 transition-all duration-300 ${isDone ? "opacity-50 hover:opacity-100" : ""}`}>
                           <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shrink-0">
                              <span className="text-[10px] font-black uppercase text-indigo-400">Day {item.publish_day}</span>
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className={`text-base font-bold truncate mb-1 ${isDone ? 'text-slate-400 line-through' : 'text-white'}`}>{item.topic}</h4>
                              <p className="text-xs text-slate-500 leading-snug mb-3">{item.strategy_reason}</p>
                              
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border border-white/10 bg-slate-900/50 text-slate-400`}>TGT: {item.keyword}</span>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border bg-transparent ${ui}`}>{item.intent}</span>
                              </div>
                           </div>
                        </motion.div>
                     )
                   })}
                </div>
             )}
           </div>

        </div>
      </main>
    </ProtectedRoute>
  );
}
