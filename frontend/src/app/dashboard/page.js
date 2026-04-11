"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import { fetchProjects, createProject, updateProject, deleteProject } from "../../lib/api";

const PRESET_NICHES = [
  "AI tools",
  "SaaS growth",
  "SEO strategies",
  "make money online",
  "ecommerce",
  "freelancing",
  "productivity"
];

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");

  // New Project Form State
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [nicheType, setNicheType] = useState("preset");
  const [nicheValue, setNicheValue] = useState(PRESET_NICHES[0]);
  const [customNiche, setCustomNiche] = useState("");

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const res = await fetchProjects(token);
      if (res.success) {
        setProjects(res.data);
      }
    } catch (err) {
      console.error("Dashboard Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    setError("");
    setFormLoading(true);

    try {
      const finalNiche = nicheType === "preset" ? nicheValue : customNiche;
      if (!finalNiche) throw new Error("Please specify a niche.");

      const token = await user.getIdToken();
      const res = await createProject(
        { website_url: websiteUrl, niche_type: nicheType, niche_value: finalNiche },
        token
      );

      if (res.success) {
        setIsAdding(false);
        setWebsiteUrl("");
        setCustomNiche("");
        loadProjects();
      }
    } catch (err) {
      setError(err.message || "Failed to create project.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (projectId, currentStatus) => {
    try {
      const token = await user.getIdToken();
      const newStatus = currentStatus === "active" ? "paused" : "active";
      const res = await updateProject(projectId, { status: newStatus }, token);
      if (res.success) {
        setProjects(projects.map(p => p.id === projectId ? { ...p, status: newStatus } : p));
      }
    } catch (err) {
      console.error("Toggle Status Error:", err);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm("Are you sure? This will permanently delete the project and its SEO data links.")) return;
    try {
      const token = await user.getIdToken();
      const res = await deleteProject(projectId, token);
      if (res.success) {
        setProjects(projects.filter(p => p.id !== projectId));
      }
    } catch (err) {
      console.error("Delete Project Error:", err);
    }
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen bg-[#020617] text-slate-100 pb-20 pt-32 px-6">
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
        <div className="aurora-glow w-[600px] h-[600px] -top-40 -left-40 bg-indigo-600/10" />
        <div className="aurora-glow w-[500px] h-[500px] bottom-0 -right-20 bg-purple-600/10" />

        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="badge-premium"
              >
                Multi-Tenant Architecture
              </motion.div>
              <h1 className="text-5xl font-display font-black tracking-tighter gradient-text">
                Your <span className="brand-text">Projects.</span>
              </h1>
              <p className="text-slate-400 font-medium">Manage multiple sites with isolated autonomous SEO engines.</p>
            </div>

            <button 
              onClick={() => setIsAdding(true)}
              className="btn-brand hover:scale-105 active:scale-95 px-8 flex items-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add New Project
            </button>
          </div>

          {/* Add Project Modal/Form Overlay */}
          <AnimatePresence>
            {isAdding && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/90 backdrop-blur-xl p-6">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="glass-card w-full max-w-xl p-10 space-y-8 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-purple-500" />
                  
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-display font-black text-white italic uppercase tracking-tight">New Website Project</h2>
                    <button onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-white transition-colors">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>

                  <form onSubmit={handleAddProject} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Website URL</label>
                      <input 
                        required
                        type="url"
                        placeholder="https://your-website.com"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        className="input-field bg-slate-900/50 border-white/5"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Niche Type</label>
                        <select 
                          value={nicheType}
                          onChange={(e) => setNicheType(e.target.value)}
                          className="input-field bg-slate-900/50 border-white/5"
                        >
                          <option value="preset">Preset Categories</option>
                          <option value="custom">Custom Niche</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Niche</label>
                        {nicheType === "preset" ? (
                          <select 
                            value={nicheValue}
                            onChange={(e) => setNicheValue(e.target.value)}
                            className="input-field bg-slate-900/50 border-white/5"
                          >
                            {PRESET_NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                        ) : (
                          <input 
                            required
                            type="text"
                            placeholder="e.g. specialized medical gear"
                            value={customNiche}
                            onChange={(e) => setCustomNiche(e.target.value)}
                            className="input-field bg-slate-900/50 border-white/5"
                          />
                        )}
                      </div>
                    </div>

                    {error && <p className="text-red-400 text-xs font-bold uppercase tracking-widest">{error}</p>}

                    <button 
                      type="submit" 
                      disabled={formLoading}
                      className="btn-brand w-full py-4 uppercase font-black tracking-widest shadow-lg shadow-brand-500/20 active:scale-[0.98]"
                    >
                      {formLoading ? "Provisioning System..." : "Launch Project"}
                    </button>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Project Grid */}
          {loading ? (
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
               {[1, 2, 3].map(i => (
                 <div key={i} className="glass-card h-64 bg-slate-900/40 animate-pulse border-white/5" />
               ))}
             </div>
          ) : projects.length === 0 ? (
            <div className="glass-card p-20 text-center space-y-6">
              <div className="text-6xl">🏢</div>
              <h3 className="text-2xl font-display font-bold text-white">No active projects yet.</h3>
              <p className="text-slate-400 max-w-sm mx-auto">Add a website to start generating isolated, autonomous SEO content today.</p>
              <button onClick={() => setIsAdding(true)} className="btn-brand px-10">Add Website</button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card bg-slate-900/60 p-8 flex flex-col justify-between group hover:border-brand-500/30 transition-all active:scale-[0.98]"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        project.status === "active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                      }`}>
                        {project.status === "active" ? "Running" : "Paused"}
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => handleToggleStatus(project.id, project.status)} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white" title={project.status === "active" ? "Pause" : "Resume"}>
                            {project.status === "active" ? (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            )}
                         </button>
                         <button onClick={() => handleDeleteProject(project.id)} className="p-2 hover:bg-red-500/5 rounded-lg text-slate-400 hover:text-red-400" title="Delete">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                         </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">{project.website_url}</p>
                      <h3 className="text-xl font-display font-black text-white truncate group-hover:text-brand-400 transition-colors">
                        {project.website_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      </h3>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between text-slate-400 font-bold text-xs">
                      <div className="flex flex-col">
                        <span className="text-[8px] uppercase tracking-tighter text-slate-600 mb-1">Niche</span>
                        <span className="text-slate-100">{project.niche_value || "General"}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] uppercase tracking-tighter text-slate-600 mb-1">Articles</span>
                        <span className="text-emerald-400 font-black">{project.blog_count || 0}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => router.push(`/blogs?project_id=${project.id}`)}
                    className="mt-8 w-full py-3 rounded-xl bg-slate-800 hover:bg-brand-600 text-slate-300 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-inner border border-white/5"
                  >
                    View Library
                  </button>
                </motion.div>
              ))}
            </div>
          )}

        </div>
      </main>
    </ProtectedRoute>
  );
}
