"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import BlogCard from "../../components/BlogCard";
import BlogCardSkeleton from "../../components/BlogCardSkeleton";
import ProtectedRoute from "../../components/ProtectedRoute";
import { fetchBlogs } from "../../lib/api";
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

  const loadBlogs = useCallback(async (isInitial = true, cursor = null) => {
    if (!user) return;
    
    if (isInitial) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      // fetchBlogs now returns { success, data, nextCursor } OR throws
      const response = await fetchBlogs(isInitial ? searchTerm : "", cursor, token);
      
      if (response && response.success) {
        const newBlogs = Array.isArray(response.data) ? response.data : [];
        if (isInitial) {
          setBlogs(newBlogs);
        } else {
          setBlogs(prev => [...prev, ...newBlogs]);
        }
        setNextCursor(response.nextCursor || null);
      } else {
        throw new Error(response?.error || "Failed to parse API response.");
      }
    } catch (err) {
      console.error("[Blogs Page] Fetch Error:", err);
      setError(err.message || "An error occurred while loading blogs.");
    } finally {
      if (isInitial) setLoading(false);
      else setLoadingMore(false);
    }
  }, [searchTerm, user]);

  useEffect(() => {
    if (user) {
      const delayDebounceFn = setTimeout(() => {
        loadBlogs(true);
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchTerm, loadBlogs, user]);

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="relative min-h-screen bg-[#020617] text-slate-100 px-6 py-24 sm:py-32">
        {/* Background Aurora */}
        <div className="aurora-glow w-[500px] h-[500px] -top-20 -left-20 bg-brand-500/5" />
        <div className="aurora-glow w-[400px] h-[400px] bottom-0 -right-20 bg-purple-500/5" />
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto space-y-20">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="badge-premium"
              >
                Intelligence Library
              </motion.div>
              <h1 className="text-5xl sm:text-7xl font-display font-black leading-[0.9] tracking-tighter gradient-text">
                Your AI Engine <br />
                <span className="brand-text">Output.</span>
              </h1>
            </div>

            {/* Search Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="w-full md:max-w-md"
            >
              <div className="glass-card flex items-center px-6 py-4 bg-slate-900/60 focus-within:ring-4 ring-brand-500/10 border-white/5 transition-all duration-500 pointer-events-auto shadow-inner">
                <svg className="w-5 h-5 text-slate-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search articles..."
                  className="bg-transparent border-none focus:ring-0 w-full text-slate-200 placeholder:text-slate-700 outline-none font-bold text-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
              >
                {[...Array(6)].map((_, i) => (
                  <BlogCardSkeleton key={i} />
                ))}
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-12 text-center border-red-500/10"
              >
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-red-200">{error}</h3>
                <button onClick={() => loadBlogs(true)} className="mt-4 btn-secondary">Try Again</button>
              </motion.div>
            ) : blogs.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-20 text-center space-y-6"
              >
                <div className="text-6xl">📥</div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-display font-bold text-white">Your library is empty.</h3>
                  <p className="text-slate-400">Time to generate your first SEO-optimized masterpiece.</p>
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                  <button 
                    onClick={() => router.push("/keywords")}
                    className="btn-brand px-8"
                  >
                    Launch AutoSEO 🚀
                  </button>
                  <button 
                    onClick={() => router.push("/generate")}
                    className="btn-secondary px-8 bg-slate-900 border-white/5"
                  >
                    Manual Studio
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="blogs"
                className="space-y-12"
              >
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {blogs.map((blog, i) => (
                    <BlogCard key={blog.id} blog={blog} index={i} />
                  ))}
                </div>

                {nextCursor && (
                  <div className="flex justify-center pt-8">
                    <button
                      onClick={() => loadBlogs(false, nextCursor)}
                      disabled={loadingMore}
                      className="btn-secondary px-10 py-3 relative group overflow-hidden"
                    >
                      <span className={loadingMore ? "opacity-0" : "opacity-100"}>
                        Load More Articles
                      </span>
                      {loadingMore && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                        </div>
                      )}
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
