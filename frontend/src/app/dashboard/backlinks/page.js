"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "../../../components/Navbar";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { useAuth } from "../../../context/AuthContext";
import { api } from "../../../lib/api/index";
import { toast } from "react-hot-toast";

export default function BacklinksPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project_id");

  const [campaigns, setCampaigns] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (user && projectId) loadData();
  }, [user, projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const [blRes, platRes] = await Promise.all([
        api.backlinks.get(projectId, token),
        api.backlinks.getPlatforms(token).catch(() => ({ success: false })),
      ]);
      if (blRes.success) {
        setCampaigns(blRes.data);
        if (blRes.stats) setStats(blRes.stats);
      }
      if (platRes.success) setPlatforms(platRes.data);
    } catch (e) {
      toast.error("Failed to retrieve distribution data.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      setActionLoading(taskId);
      const token = await user.getIdToken();
      const res = await api.backlinks.updateTask(taskId, { status: newStatus }, token);
      if (res.success) {
        setCampaigns(campaigns.map(c => c.id === taskId ? { ...c, status: newStatus } : c));
        toast.success("Distribution node updated.");
      }
    } catch {
      toast.error("Failed to update node status.");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = filter === "all" ? campaigns : campaigns.filter(c => c.status === filter);

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen bg-[#020617] text-slate-100 pb-20 pt-32 px-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
        <div className="aurora-glow w-[500px] h-[500px] -top-32 -left-32 bg-brand-500/10" />

        <div className="max-w-[1200px] mx-auto space-y-10 relative z-10 w-full">
          
          <div className="space-y-3 mb-8">
             <div className="badge-premium">Domain Authority Mapping</div>
             <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-white mb-2">Link <span className="text-indigo-400">Distribution.</span></h1>
             <p className="text-slate-400 text-sm">Monitor and orchestrate backlink placements to scale off-page SEO velocity.</p>
          </div>

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "Active Nodes", val: stats.total, color: "text-white" },
                { label: "Pending", val: stats.pending, color: "text-slate-500" },
                { label: "Propagating", val: stats.submitted, color: "text-amber-500" },
                { label: "Live", val: stats.live, color: "text-emerald-500" },
                { label: "Avg DA Target", val: stats.total_da, color: "text-indigo-400" },
              ].map(s => (
                <div key={s.label} className="glass-card p-5 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{s.label}</p>
                  <p className={`text-2xl font-display font-black ${s.color}`}>{s.val}</p>
                </div>
              ))}
            </div>
          )}

          {platforms.length > 0 && (
            <div className="pt-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Target Infrastructure</h3>
              <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
                {platforms.map(p => (
                  <div key={p.id} className="glass-card px-4 py-3 shrink-0 min-w-[150px]">
                    <p className="text-[11px] font-bold text-white truncate mb-1">{p.name}</p>
                    <div className="flex items-center gap-2 justify-between">
                       <p className="text-lg font-display font-black text-emerald-400 leading-none">DA {p.domain_authority}</p>
                       <p className="text-[8px] font-bold uppercase tracking-widest text-slate-600 border border-slate-700/50 bg-slate-800/50 px-1.5 py-0.5 rounded">{p.platform_type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {campaigns.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/5">
              {["all", "pending", "submitted", "live", "lost"].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors whitespace-nowrap border-b-2 ${
                    filter === f
                      ? "text-indigo-400 border-indigo-500"
                      : "text-slate-500 border-transparent hover:text-slate-300"
                  }`}
                >
                  {f} <span className="ml-1 opacity-50">({f === "all" ? campaigns.length : campaigns.filter(c => c.status === f).length})</span>
                </button>
              ))}
            </div>
          )}

          {loading ? (
             <div className="space-y-3"><div className="h-16 bg-white/5 rounded-xl animate-pulse"/><div className="h-16 bg-white/5 rounded-xl animate-pulse"/></div>
          ) : campaigns.length === 0 ? (
            <div className="glass-card text-center py-20">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Awaiting active publication nodes</p>
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
               <table className="w-full text-left text-sm">
                 <thead>
                   <tr className="border-b border-white/5 text-slate-500 text-[10px] uppercase font-bold tracking-widest bg-slate-900/40">
                     <th className="px-6 py-4">Domain Authority</th>
                     <th className="px-6 py-4">Target Node</th>
                     <th className="px-6 py-4">Status Vector</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {filtered.map(campaign => (
                       <tr key={campaign.id} className="hover:bg-white/[0.02]">
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center shrink-0 shadow-inner">
                                   <span className="text-white font-black font-display text-sm">DA</span>
                                </div>
                                <div>
                                   <p className="text-white font-black text-sm">{campaign.platform}</p>
                                   <p className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-block px-1 rounded-sm font-bold tracking-widest uppercase mt-1">DA {campaign.domain_authority}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <p className="text-slate-300 text-xs font-bold leading-relaxed max-w-sm line-clamp-2 mb-1">{campaign.task_description}</p>
                             {campaign.blog_title && <p className="text-[10px] text-slate-500 truncate max-w-sm">Assigned content: {campaign.blog_title}</p>}
                          </td>
                          <td className="px-6 py-4">
                             <select
                                value={campaign.status}
                                onChange={(e) => handleStatusUpdate(campaign.id, e.target.value)}
                                disabled={actionLoading === campaign.id}
                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-slate-900/80 border border-white/10 text-slate-300 cursor-pointer outline-none focus:border-indigo-500 disabled:opacity-50`}
                              >
                                <option value="pending">Pending Propogation</option>
                                <option value="submitted">Submitted to Target</option>
                                <option value="live">Live Connection</option>
                                <option value="lost">Connection Lost</option>
                                <option value="rejected">Rejected by Target</option>
                              </select>
                              {campaign.url && (
                                <a href={campaign.url} target="_blank" rel="noopener noreferrer" className="ml-3 text-[10px] text-indigo-400 hover:text-indigo-300 font-bold underline">Verify Link</a>
                              )}
                          </td>
                       </tr>
                    ))}
                 </tbody>
               </table>
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
