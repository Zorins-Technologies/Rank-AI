"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/Navbar";
import { api } from "../../lib/api/index";
import { useAuth } from "../../context/AuthContext";

import { toast } from "react-hot-toast";

export default function GeneratePage() {
  const { user, loading: authLoading } = useAuth();
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedBlog, setGeneratedBlog] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!keyword.trim() || !user) return;

    setLoading(true);
    setError(null);
    setGeneratedBlog(null);
    const loadingToast = toast.loading("Generating your SEO masterpiece...");

    try {
      const token = await user.getIdToken();
      const response = await api.blogs.generate(keyword, token);
      
      if (response.success && response.data) {
        setGeneratedBlog(response.data);
        toast.success("Blog generated successfully!", { id: loadingToast });
        
        // Automatic redirect after showing result for 4 seconds
        setTimeout(() => {
          router.push(`/blogs/${response.data.slug || response.data.id}`);
        }, 4500);
      } else {
        throw new Error(response.error || "Generation process failed.");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred during generation.");
      toast.error(err.message || "Generation failed.", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500/30 border-t-brand-500" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="relative min-h-[calc(100vh-4rem)] bg-[#020617] text-slate-100 overflow-hidden flex flex-col items-center justify-center">
        {/* Background Aurora */}
        <div className="aurora-glow w-[800px] h-[800px] -top-40 bg-brand-500/10" />
        <div className="aurora-glow w-[600px] h-[600px] -bottom-40 bg-purple-500/10" />
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />

        <div className="relative z-10 w-full max-w-4xl px-6 py-20">
          <div className="text-center mb-16 space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="badge-premium"
            >
              AI Content Studio
            </motion.div>
            <h1 className="text-6xl md:text-8xl font-display font-black leading-[0.9] tracking-tighter gradient-text">
              Rank Higher <br />
              <span className="brand-text">with Intelligence.</span>
            </h1>
            <p className="max-w-xl mx-auto text-lg text-slate-400 font-medium">
              Enter a high-intent keyword and let our specialized Gemini engine craft your next viral article.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!loading && !generatedBlog ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card shadow-2xl p-2 bg-slate-900/60"
              >
                <form onSubmit={handleGenerate} className="flex flex-col md:flex-row gap-2">
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Enter target keyword (e.g., 'SaaS Marketing')"
                    className="flex-1 input-field border-transparent bg-transparent focus:ring-0 text-xl font-bold placeholder:text-slate-700"
                    required
                  />
                  <button
                    type="submit"
                    className="btn-brand px-12 rounded-2xl whitespace-nowrap text-sm uppercase font-black tracking-widest"
                  >
                    Generate Now
                  </button>
                </form>
                
                <div className="absolute -bottom-14 left-0 right-0 text-center">
                  <p className="text-sm font-medium text-slate-500">
                    Not sure what to write about? <a href="/keywords" className="text-brand-400 font-bold underline decoration-brand-400/30 underline-offset-4 hover:text-brand-300">Try our AutoSEO Keyword Engine</a>
                  </p>
                </div>
              </motion.div>
            ) : loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card p-16 text-center space-y-10"
              >
                <div className="flex flex-col items-center gap-8">
                  <div className="relative h-20 w-20">
                    <div className="absolute inset-0 rounded-full border-4 border-brand-500/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
                    <div className="absolute inset-4 rounded-full bg-brand-500/10 animate-pulse" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl font-display font-black text-white uppercase tracking-tight">Writing Masterpiece...</h3>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] animate-pulse">Consulting Gemini 1.5 & Imagen 3 Studio</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-12 border-emerald-500/20 bg-emerald-500/5 text-center space-y-10"
              >
                <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-4xl shadow-lg shadow-emerald-500/10">
                  ✨
                </div>
                <div className="space-y-6">
                  <h3 className="text-4xl font-display font-black text-white tracking-tighter">SUCCESSFULLY SYNTHESIZED</h3>
                  <div className="max-w-md mx-auto p-8 bg-slate-950/50 rounded-[2.5rem] border border-white/5 space-y-6 shadow-inner">
                    <div className="space-y-1">
                       <p className="text-brand-500 text-[10px] uppercase tracking-[0.2em] font-black">Content Title</p>
                       <p className="text-2xl font-display font-bold text-white leading-tight">"{generatedBlog.title}"</p>
                    </div>
                    <div className="pt-6 border-t border-white/5 flex items-center justify-center gap-12">
                       <div className="text-center">
                          <p className="text-4xl font-display font-black text-white">{generatedBlog.analysis?.score || 0}</p>
                          <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mt-1">SEO Score</p>
                       </div>
                       <div className="w-px h-10 bg-white/10" />
                       <div className="text-center">
                          <p className="text-4xl font-display font-black text-brand-400">{generatedBlog.analysis?.grade || "N/A"}</p>
                          <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mt-1">Grade</p>
                       </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest animate-pulse">Redirecting to Analysis View...</p>
                  <div className="h-1 w-32 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 4.5 }}
                      className="h-full bg-brand-500"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 p-6 glass-card border-red-500/20 bg-red-500/5 text-center text-red-200"
            >
              <p className="font-bold">Error: {error}</p>
              <button 
                onClick={() => { setError(null); setLoading(false); }} 
                className="mt-4 text-sm font-bold underline hover:text-white"
              >
                Try again with a different keyword
              </button>
            </motion.div>
          )}
        </div>
      </main>
    </>
  );
}
