"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "../../../components/Navbar";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { useAuth } from "../../../context/AuthContext";
import { api } from "../../../lib/api/index";
import { toast } from "react-hot-toast";

const ENGINE_UI = {
  ChatGPT: { icon: "💬", ring: "ring-emerald-500/30", text: "text-emerald-400" },
  Gemini: { icon: "✨", ring: "ring-blue-500/30", text: "text-blue-400" },
  Perplexity: { icon: "🔍", ring: "ring-purple-500/30", text: "text-purple-400" },
};

export default function AeoPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project_id");

  const [summary, setSummary] = useState(null);
  const [checks, setChecks] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (user && projectId) loadData();
  }, [user, projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const [sumRes, checksRes, projRes] = await Promise.all([
        api.aeo.getSummary(projectId, token).catch(() => ({ success: false })),
        api.aeo.getChecks(projectId, token).catch(() => ({ success: false })),
        api.projects.getAll(token)
      ]);
      if (sumRes.success) setSummary(sumRes.data);
      if (checksRes.success) setChecks(checksRes.data);
      if (projRes.success) setProject(projRes.data.find(p => p.id === projectId));
    } catch (e) {
      toast.error("Failed to load telemetry.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = async () => {
    if (!project) return;
    const id = toast.loading("Probing engine infrastructure...");
    try {
      setChecking(true);
      const token = await user.getIdToken();
      await api.aeo.runCheck({ project_id: projectId, website_url: project.website_url, niche: project.niche_value }, token);
      await loadData();
      toast.success("Telemetry updated.", { id });
    } catch (err) {
      toast.error("Probe failed.", { id });
    } finally {
      setChecking(false);
    }
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen bg-[#020617] text-slate-100 pb-20 pt-32 px-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
        <div className="aurora-glow w-[500px] h-[500px] -top-32 -left-32 bg-indigo-500/10" />

        <div className="max-w-7xl mx-auto space-y-10 relative z-10">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="badge-premium">Answer Engine Optimization</div>
              <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-white">
                Engine <span className="text-indigo-400">Telemetry.</span>
              </h1>
              <p className="text-slate-400 text-sm">Measure and optimize LLM brand retention metrics globally.</p>
            </div>
            
            <button onClick={handleCheck} disabled={checking || !project} className="btn-brand flex items-center gap-2">
              {checking ? "Probing..." : "Force Target Audit"}
            </button>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-40 rounded-2xl bg-white/5 animate-pulse" />)}
            </div>
          ) : !summary || summary.totalChecks === 0 ? (
            <div className="glass-card text-center py-20 px-6">
              <p className="text-slate-400 text-sm mb-6">No historical records found for this domain.</p>
              <button onClick={handleCheck} disabled={checking} className="btn-brand px-8">{checking ? "..." : "Initiate Baseline Probe"}</button>
            </div>
          ) : (
            <div className="space-y-10">
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <div className="glass-card p-6 flex flex-col justify-center items-center text-center col-span-2 md:col-span-1 shadow-[0_0_30px_rgba(99,102,241,0.05)] border-indigo-500/20">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Aggregate Index</p>
                  <p className="text-5xl font-display font-black text-white">{summary.overallScore}</p>
                </div>

                {(summary.engineStats || []).map((engine, i) => {
                  const ui = ENGINE_UI[engine.engine] || ENGINE_UI.ChatGPT;
                  return (
                    <motion.div key={engine.engine} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg bg-slate-900 ring-1 ${ui.ring}`}>{ui.icon}</div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{engine.engine}</span>
                      </div>
                      <p className={`text-3xl font-black font-display ${ui.text}`}>{engine.mention_rate}%</p>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-slate-600 mt-2">{engine.mentioned} / {engine.total} queries</p>
                    </motion.div>
                  );
                })}
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 px-2">Diagnostic Logs</h3>
                <div className="glass-card overflow-hidden">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                        <th className="px-6 py-4">Query Parameter</th>
                        <th className="px-6 py-4">Target Engine</th>
                        <th className="px-6 py-4">Resolution Status</th>
                        <th className="px-6 py-4 hidden md:table-cell">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {checks.slice(0, 15).map(check => (
                        <tr key={check.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 text-white font-medium truncate max-w-[200px]">{check.query}</td>
                          <td className="px-6 py-4 text-slate-400 text-xs font-bold">{check.engine}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${check.is_mentioned ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}>
                              {check.is_mentioned ? "Identified" : "Omitted"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-600 text-[10px] font-bold hidden md:table-cell">{new Date(check.checked_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
