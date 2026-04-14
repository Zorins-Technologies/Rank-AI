"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import { projectsApi } from "../../lib/api/index";
import { toast } from "react-hot-toast";


const PRESET_NICHES = [
  "AI Tools", "SaaS Growth", "SEO Strategies", "E-commerce", "Freelancing", "Productivity", "Finance"
];

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [websiteUrl, setWebsiteUrl] = useState("");
  const [nicheType, setNicheType] = useState("preset");
  const [nicheValue, setNicheValue] = useState(PRESET_NICHES[0]);
  const [customNiche, setCustomNiche] = useState("");

  useEffect(() => {
    if (user) loadProjects();
  }, [user]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const res = await projectsApi.getAll(token);
      if (res.success) setProjects(res.data);
    } catch (err) {
      toast.error("Failed to synchronize projects.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    const id = toast.loading("Initializing growth engine...");

    try {
      const finalNiche = nicheType === "preset" ? nicheValue : customNiche;
      if (!finalNiche) throw new Error("Please specify a target niche.");

      const token = await user.getIdToken();
      const res = await projectsApi.create({ website_url: websiteUrl, niche_type: nicheType, niche_value: finalNiche }, token);

      if (res.success) {
        toast.success("Project activated successfully.", { id });
        setIsAdding(false);
        setWebsiteUrl("");
        setCustomNiche("");
        loadProjects();
      } else throw new Error("API rejection");
    } catch (err) {
      toast.error(err.message || "Engine initialization failed.", { id });
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (projectId, currentStatus) => {
    try {
      const token = await user.getIdToken();
      const newStatus = currentStatus === "active" ? "paused" : "active";
      const res = await projectsApi.update(projectId, { status: newStatus }, token);
      if (res.success) {
        setProjects(projects.map(p => p.id === projectId ? { ...p, status: newStatus } : p));
        toast.success(`Project ${newStatus}.`);
      }
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Warning: This permanently deletes the project and flushes all SEO data.")) return;
    try {
      const token = await user.getIdToken();
      const res = await projectsApi.delete(projectId, token);
      if (res.success) {
        setProjects(projects.filter(p => p.id !== projectId));
        toast.success("Project terminated.");
      }
    } catch (err) {
      toast.error("Failed to delete project.");
    }
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen bg-[#020617] text-slate-100 pb-20 pt-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
        <div className="aurora-glow w-[500px] h-[500px] -top-32 -left-32 bg-indigo-500/10" />
        <div className="aurora-glow w-[400px] h-[400px] bottom-10 -right-20 bg-purple-500/10" />

        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="badge-premium">
                Multi-Tenant Architecture
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-white">
                Dashboard <span className="text-indigo-400">Overview.</span>
              </h1>
              <p className="text-slate-400 text-sm max-w-xl">Manage scalable SEO engines across your portfolio. Each project operates autonomously within isolated parameters.</p>
            </div>

            <button onClick={() => setIsAdding(true)} className="btn-brand flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Project
            </button>
          </div>

          <div className="glass-card bg-indigo-500/5 border-indigo-500/20 p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="w-14 h-14 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/30">
              <span className="text-2xl">⚡</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-display font-bold text-white mb-1">Engines are Online</h3>
              <ul className="flex flex-wrap gap-4 sm:gap-6 mt-2">
                {["Articles generating", "Backlinks processing", "AEO tracking"].map(msg => (
                  <li key={msg} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                    {msg}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <AnimatePresence>
            {isAdding && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm" onClick={() => setIsAdding(false)} />
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                  className="glass-card w-full max-w-lg p-8 relative z-10 overflow-hidden"
                >
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-display font-bold text-white">Initialize Engine</h2>
                    <button onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-white"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                  </div>
                  
                  <form onSubmit={handleAddProject} className="space-y-5">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5 ml-1">Domain Target</label>
                      <input required type="url" placeholder="https://domain.com" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} className="input-field" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5 ml-1">Strategy Profile</label>
                        <select value={nicheType} onChange={(e) => setNicheType(e.target.value)} className="input-field">
                          <option value="preset">Optimized Preset</option>
                          <option value="custom">Custom Build</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5 ml-1">Niche Classification</label>
                        {nicheType === "preset" ? (
                          <select value={nicheValue} onChange={(e) => setNicheValue(e.target.value)} className="input-field">
                            {PRESET_NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                        ) : (
                          <input required type="text" placeholder="Micro-niche" value={customNiche} onChange={(e) => setCustomNiche(e.target.value)} className="input-field" />
                        )}
                      </div>
                    </div>

                    <button type="submit" disabled={formLoading} className="btn-brand w-full mt-2">
                       {formLoading ? "Provisioning..." : "Launch Pipeline"}
                    </button>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {loading ? (
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[1, 2, 3].map(i => <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse border border-white/5" />)}
             </div>
          ) : projects.length === 0 ? (
            <div className="glass-card text-center py-24 px-6">
              <h3 className="text-2xl font-display font-bold text-white mb-2">Workspace Empty</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto mb-8">Deploy your first website entity to begin algorithmic content generation and ranking.</p>
              <button onClick={() => setIsAdding(true)} className="btn-brand px-8">Provision Project</button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="glass-card flex flex-col group hover:border-indigo-500/30 transition-all duration-300"
                >
                  <div className="p-6 pb-5 border-b border-white/5">
                    <div className="flex items-start justify-between mb-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${
                        project.status === "active" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {project.status === "active" ? "Online" : "Suspended"}
                      </span>
                      <div className="flex gap-2">
                         <button onClick={() => handleToggleStatus(project.id, project.status)} className="text-slate-500 hover:text-white transition-colors" title="Toggle State">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                         </button>
                         <button onClick={() => handleDeleteProject(project.id)} className="text-slate-500 hover:text-red-400 transition-colors" title="Terminate">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                         </button>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white truncate mb-1">
                      {project.website_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">{project.niche_value}</p>
                  </div>

                  <div className="p-6 pt-5 grid grid-cols-2 gap-3 h-full">
                    <button onClick={() => router.push(`/blogs?project_id=${project.id}`)} className="col-span-2 btn-secondary text-[10px] py-1.5 transition-colors">Library & Index</button>
                    <button onClick={() => router.push(`/dashboard/calendar?project_id=${project.id}`)} className="col-span-1 border border-white/5 bg-slate-900/50 hover:bg-slate-800 rounded-lg text-[9px] uppercase font-bold text-slate-400 hover:text-white transition-all py-2">Content Calendar</button>
                    <button onClick={() => router.push(`/dashboard/pipeline?project_id=${project.id}`)} className="col-span-1 border border-white/5 bg-slate-900/50 hover:bg-slate-800 rounded-lg text-[9px] uppercase font-bold text-slate-400 hover:text-white transition-all py-2">Pipeline</button>
                    <button onClick={() => router.push(`/dashboard/aeo?project_id=${project.id}`)} className="col-span-1 border border-white/5 bg-slate-900/50 hover:bg-slate-800 rounded-lg text-[9px] uppercase font-bold text-slate-400 hover:text-white transition-all py-2">AEO Metrics</button>
                    <button onClick={() => router.push(`/dashboard/backlinks?project_id=${project.id}`)} className="col-span-1 border border-white/5 bg-slate-900/50 hover:bg-slate-800 rounded-lg text-[9px] uppercase font-bold text-slate-400 hover:text-white transition-all py-2">Distribution</button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
