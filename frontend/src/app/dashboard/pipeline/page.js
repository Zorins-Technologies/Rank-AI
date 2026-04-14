"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../../components/Navbar";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { useAuth } from "../../../context/AuthContext";
import { api } from "../../../lib/api/index";
import { toast } from "react-hot-toast";

const STAGES = [
  { id: "draft", name: "Queue", line: "bg-slate-500", dot: "border-slate-500", active: "bg-slate-500/10 border-slate-500/30" },
  { id: "pending_review", name: "Validation", line: "bg-amber-500", dot: "border-amber-500", active: "bg-amber-500/10 border-amber-500/30" },
  { id: "approved", name: "Clearance", line: "bg-indigo-500", dot: "border-indigo-500", active: "bg-indigo-500/10 border-indigo-500/30" },
  { id: "published", name: "Deployed", line: "bg-emerald-500", dot: "border-emerald-500", active: "bg-emerald-500/10 border-emerald-500/30" },
];

export default function PipelinePage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project_id");

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  useEffect(() => {
    if (user && projectId) loadBlogs();
  }, [user, projectId]);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const res = await api.blogs.getAll("", "", token, projectId);
      if (res.success) setBlogs(res.data);
    } catch (err) {
      toast.error("Failed to sync pipeline.");
    } finally {
      setLoading(false);
    }
  };

  const traverse = async (id, status) => {
    try {
      setActing(id);
      const token = await user.getIdToken();
      const res = await api.blogs.updateStatus(id, status, token);
      if (res.success) {
        setBlogs(blogs.map(b => b.id === id ? { ...b, status } : b));
        toast.success("Entity progressed.");
      }
    } catch {
      toast.error("Pipeline progression failed.");
    } finally {
      setActing(null);
    }
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen bg-[#020617] text-slate-100 pb-20 pt-32 px-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
        
        <div className="max-w-[1400px] mx-auto space-y-10 relative z-10 w-full overflow-x-auto pb-4 hide-scrollbar">
          
          <div className="space-y-2 mb-8 min-w-[800px]">
             <div className="badge-premium">Content Distribution</div>
             <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-white mb-2">Publishing <span className="text-indigo-400">Node.</span></h1>
             <p className="text-slate-400 text-sm">Orchestrate lifecycle transitions for programmatic assets.</p>
          </div>

          {loading ? (
             <div className="grid grid-cols-4 gap-4 min-w-[800px]">
                {[1,2,3,4].map(i => <div key={i} className="h-96 rounded-2xl bg-white/5 animate-pulse" />)}
             </div>
          ) : (
             <div className="grid grid-cols-4 gap-4 lg:gap-6 min-w-[1000px] pb-10">
                {STAGES.map(stage => {
                  const subset = blogs.filter(b => (b.status || "draft") === stage.id);
                  return (
                    <div key={stage.id} className={`glass-card p-4 h-full min-h-[500px] ${stage.active}`}>
                        <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                           <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ring-2 ring-offset-2 ring-offset-transparent outline-none ${stage.line} ${stage.dot}`} />
                              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300">{stage.name}</h3>
                           </div>
                           <span className="text-xs font-bold text-slate-500">{subset.length}</span>
                        </div>

                        <div className="space-y-3 relative">
                           <AnimatePresence>
                              {subset.map(blog => (
                                <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} key={blog.id} className="bg-[#020617] border border-white/5 rounded-xl p-4 shadow-xl">
                                   <h4 className="text-sm font-bold text-white line-clamp-2 mb-2 leading-snug">{blog.title}</h4>
                                   <div className="flex items-center gap-2 mb-3">
                                     <span className="text-[8px] uppercase tracking-widest font-black text-slate-500">ID: {blog.id.substring(0,6)}</span>
                                   </div>
                                   
                                   {/* Workflow Buttons */}
                                   <div className="flex gap-2">
                                     {stage.id === "draft" && <button onClick={()=>traverse(blog.id, "pending_review")} disabled={acting === blog.id} className="btn-secondary w-full py-1 text-[9px]">Push to Validate</button>}
                                     {stage.id === "pending_review" && <button onClick={()=>traverse(blog.id, "approved")} disabled={acting === blog.id} className="btn-brand w-full py-1 text-[9px] bg-indigo-600">Clear</button>}
                                     {stage.id === "approved" && <button onClick={()=>traverse(blog.id, "published")} disabled={acting === blog.id} className="btn-brand w-full py-1 text-[9px] bg-emerald-600">Deploy</button>}
                                   </div>
                                </motion.div>
                              ))}
                           </AnimatePresence>
                        </div>
                    </div>
                  )
                })}
             </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
