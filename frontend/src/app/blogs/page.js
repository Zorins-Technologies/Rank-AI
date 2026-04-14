"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../../components/Navbar";
import BlogCard from "../../components/BlogCard";
import BlogCardSkeleton from "../../components/BlogCardSkeleton";
import ProtectedRoute from "../../components/ProtectedRoute";
import { blogsApi } from "../../lib/api/index";
import { useAuth } from "../../context/AuthContext";

export default function BlogsPage() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [nextCursor, setNextCursor] = useState(null);
  const [error, setError] = useState(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project_id");

  const loadBlogs = useCallback(async (isInitial = true, cursor = null) => {
    if (!user) return;
    
    if (isInitial) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const response = await blogsApi.getAll(token, { search: isInitial ? searchTerm : "", cursor, project_id: projectId });
      
      if (response?.success) {
        const newBlogs = Array.isArray(response.data) ? response.data : [];
        if (isInitial) setBlogs(newBlogs);
        else setBlogs(prev => [...prev, ...newBlogs]);
        setNextCursor(response.nextCursor || null);
      } else {
        throw new Error(response?.error || "Error parsing index.");
      }
    } catch (err) {
      setError(err.message || "Failed to retrieve intelligence index.");
    } finally {
      if (isInitial) setLoading(false);
      else setLoadingMore(false);
    }
  }, [searchTerm, user, projectId]);

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => loadBlogs(true), 500);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, loadBlogs, user]);

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="relative min-h-screen bg-[#020617] text-slate-100 px-6 py-24 sm:py-32 overflow-hidden">
        <div className="aurora-glow w-[500px] h-[500px] -top-20 -left-20 bg-brand-500/10" />
        <div className="aurora-glow w-[400px] h-[400px] bottom-0 -right-20 bg-purple-500/10" />
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto space-y-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="space-y-4">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="badge-premium">
                Intelligence Library
              </motion.div>
              <h1 className="text-4xl sm:text-6xl font-display font-black leading-none tracking-tight text-white shadow-sm">
                {projectId ? "Project" : "Platform"} <span className="text-indigo-400">Index.</span>
              </h1>
              <p className="text-sm font-medium text-slate-400 max-w-xl">
                 Anatomy of generated growth assets, securely queried from the autonomous deployment engine.
              </p>
            </div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="w-full md:max-w-sm">
              <div className="flex items-center px-5 py-4 bg-slate-900/80 border border-white/5 rounded-2xl focus-within:border-indigo-500 focus-within:ring-2 ring-indigo-500/20 transition-all shadow-inner">
                <svg className="w-5 h-5 text-slate-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Query assets..."
                  className="bg-transparent border-none text-white placeholder-slate-500 outline-none w-full text-sm font-bold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => <BlogCardSkeleton key={i} />)}
              </motion.div>
            ) : error ? (
              <motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-12 text-center border-red-500/20">
                <p className="text-2xl mb-4">⚠️</p>
                <h3 className="text-lg font-bold text-red-400 mb-4">{error}</h3>
                <button onClick={() => loadBlogs(true)} className="btn-secondary px-6 py-2 text-xs">Retry Connection</button>
              </motion.div>
            ) : blogs.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card text-center py-24 px-6 border-white/5">
                <span className="text-5xl opacity-50 mb-6 block">📂</span>
                <h3 className="text-xl font-display font-bold text-white mb-2">Registry is empty.</h3>
                <p className="text-slate-400 text-sm mb-8">Execute programmatic generation to populate the index.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button onClick={() => router.push("/keywords")} className="btn-brand">Initialize Pipeline</button>
                  <button onClick={() => router.push("/generate")} className="btn-secondary">Studio Write</button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="blogs" className="space-y-12">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {blogs.map((blog, i) => (
                    <BlogCard key={blog.id} blog={blog} index={i} />
                  ))}
                </div>

                {nextCursor && (
                  <div className="flex justify-center pt-4">
                    <button onClick={() => loadBlogs(false, nextCursor)} disabled={loadingMore} className="btn-secondary relative w-[200px]">
                      <span className={loadingMore ? "opacity-0" : "opacity-100"}>Fetch Additional</span>
                      {loadingMore && <div className="absolute inset-0 flex items-center justify-center"><div className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin" /></div>}
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </ProtectedRoute>
  );
}
