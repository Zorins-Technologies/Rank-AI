"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/Navbar";
import { researchKeywords, fetchKeywords, generateFromKeyword } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

const DIFFICULTY_COLORS = {
  easy: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  hard: "text-red-400 bg-red-400/10 border-red-400/20",
};

const INTENT_COLORS = {
  informational: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  commercial: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  transactional: "text-brand-400 bg-brand-400/10 border-brand-400/20",
};

const STATUS_CONFIG = {
  pending: { label: "Pending", className: "text-slate-400 bg-slate-400/10 border-slate-400/20", pulse: false },
  generating: { label: "Generating…", className: "text-amber-400 bg-amber-400/10 border-amber-400/20", pulse: true },
  generated: { label: "Generated ✓", className: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", pulse: false },
  failed: { label: "Failed", className: "text-red-400 bg-red-400/10 border-red-400/20", pulse: false },
};

export default function KeywordsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [niche, setNiche] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [isResearching, setIsResearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [generating, setGenerating] = useState({});
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  // Load existing keywords on mount
  const loadKeywords = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetchKeywords(token);
      if (res.success) setKeywords(res.data);
    } catch (err) {
      console.error("Failed to load keywords:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadKeywords();
  }, [loadKeywords]);

  // Auto-refresh while any keyword is generating
  useEffect(() => {
    const hasGenerating = keywords.some(k => k.status === "generating");
    if (!hasGenerating) return;
    const interval = setInterval(loadKeywords, 8000);
    return () => clearInterval(interval);
  }, [keywords, loadKeywords]);

  const handleResearch = async (e) => {
    e.preventDefault();
    if (!niche.trim() || !user) return;
    setIsResearching(true);
    const loadingToast = toast.loading(`Researching keywords for "${niche}"…`);
    try {
      const token = await user.getIdToken();
      const res = await researchKeywords(niche, token);
      if (res.success) {
        toast.success(`${res.count} keywords discovered!`, { id: loadingToast });
        await loadKeywords();
        setNiche("");
      } else {
        toast.error(res.error || "Research failed.", { id: loadingToast });
      }
    } catch (err) {
      toast.error(err.message, { id: loadingToast });
    } finally {
      setIsResearching(false);
    }
  };

  const handleGenerate = async (kwId, keyword) => {
    if (!user || generating[kwId]) return;
    setGenerating(prev => ({ ...prev, [kwId]: true }));
    const loadingToast = toast.loading(`Starting generation for "${keyword}"…`);
    try {
      const token = await user.getIdToken();
      const res = await generateFromKeyword(kwId, token);
      if (res.success) {
        toast.success("Generation started! The article will be ready shortly.", { id: loadingToast });
        // Optimistically update status in UI
        setKeywords(prev => prev.map(k => k.id === kwId ? { ...k, status: "generating" } : k));
      } else {
        toast.error(res.error || "Generation failed.", { id: loadingToast });
        setGenerating(prev => ({ ...prev, [kwId]: false }));
      }
    } catch (err) {
      toast.error(err.message, { id: loadingToast });
      setGenerating(prev => ({ ...prev, [kwId]: false }));
    }
  };

  const filteredKeywords = filterStatus === "all"
    ? keywords
    : keywords.filter(k => k.status === filterStatus);

  const stats = {
    total: keywords.length,
    pending: keywords.filter(k => k.status === "pending").length,
    generated: keywords.filter(k => k.status === "generated").length,
    generating: keywords.filter(k => k.status === "generating").length,
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
      <main className="relative min-h-screen bg-[#020617] text-slate-100 overflow-hidden">
        {/* Background Aurora */}
        <div className="aurora-glow w-[700px] h-[700px] -top-40 left-1/4 bg-brand-500/10" />
        <div className="aurora-glow w-[500px] h-[500px] bottom-0 right-0 bg-purple-500/10" />
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">

          {/* Header */}
          <div className="mb-12 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="badge-premium"
            >
              🔬 Automated SEO Engine
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter gradient-text">
              Keyword <span className="brand-text">Research</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl">
              Enter a niche once — our AI discovers high-value keywords and auto-generates SEO articles for you daily.
            </p>
          </div>

          {/* Research Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleResearch}
            className="glass-card p-2 mb-8 bg-slate-900/60 flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              value={niche}
              onChange={e => setNiche(e.target.value)}
              placeholder="Enter niche (e.g. 'SaaS marketing', 'email automation')"
              className="flex-1 input-field border-transparent bg-transparent focus:ring-0 text-lg font-bold placeholder:text-slate-700"
              disabled={isResearching}
            />
            <button
              type="submit"
              disabled={isResearching || !niche.trim()}
              className="btn-brand px-10 rounded-2xl whitespace-nowrap text-sm uppercase font-black tracking-widest"
            >
              {isResearching ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Researching…
                </span>
              ) : "Research Keywords"}
            </button>
          </motion.form>

          {/* Stats Bar */}
          {keywords.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
            >
              {[
                { label: "Total Keywords", value: stats.total, color: "text-white" },
                { label: "Pending", value: stats.pending, color: "text-slate-400" },
                { label: "Generating", value: stats.generating, color: "text-amber-400" },
                { label: "Generated", value: stats.generated, color: "text-emerald-400" },
              ].map(({ label, value, color }) => (
                <div key={label} className="glass-card p-5 text-center">
                  <p className={`text-3xl font-display font-black ${color}`}>{value}</p>
                  <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mt-1">{label}</p>
                </div>
              ))}
            </motion.div>
          )}

          {/* Filter Tabs */}
          {keywords.length > 0 && (
            <div className="flex gap-2 mb-6 flex-wrap">
              {["all", "pending", "generating", "generated", "failed"].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                    filterStatus === status
                      ? "bg-brand-500/20 border-brand-500/40 text-brand-400"
                      : "border-white/10 text-slate-500 hover:text-white hover:border-white/20"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          )}

          {/* Keywords Table */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="loading" className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="shimmer h-16 rounded-2xl" />
                ))}
              </motion.div>
            ) : filteredKeywords.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-20 text-center"
              >
                <p className="text-5xl mb-4">🔍</p>
                <h3 className="text-2xl font-display font-black text-white mb-2">
                  {keywords.length === 0 ? "No keywords yet" : "No keywords match this filter"}
                </h3>
                <p className="text-slate-500">
                  {keywords.length === 0
                    ? "Enter a niche above to discover high-value SEO keywords."
                    : "Try a different filter tab."}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="table"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card overflow-hidden"
              >
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 text-[10px] uppercase font-black tracking-widest text-slate-500">
                  <div className="col-span-4">Keyword</div>
                  <div className="col-span-2 text-center">Volume</div>
                  <div className="col-span-2 text-center">Difficulty</div>
                  <div className="col-span-2 text-center">Intent</div>
                  <div className="col-span-2 text-right">Action</div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-white/5">
                  {filteredKeywords.map((kw, i) => {
                    const status = STATUS_CONFIG[kw.status] || STATUS_CONFIG.pending;
                    const isGenerating = kw.status === "generating" || generating[kw.id];
                    const isGenerated = kw.status === "generated";
                    const isFailed = kw.status === "failed";

                    return (
                      <motion.div
                        key={kw.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/2 transition-colors group"
                      >
                        {/* Keyword + Status */}
                        <div className="col-span-4 min-w-0">
                          <p className="font-bold text-white truncate group-hover:text-brand-300 transition-colors">
                            {kw.keyword}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center gap-1 border text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${status.className}`}>
                              {status.pulse && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />}
                              {status.label}
                            </span>
                            <span className="text-[10px] text-slate-600 truncate">{kw.niche}</span>
                          </div>
                        </div>

                        {/* Volume */}
                        <div className="col-span-2 text-center">
                          <p className="font-bold text-slate-300">{kw.search_volume?.toLocaleString()}</p>
                          <p className="text-[10px] text-slate-600 uppercase tracking-wider">/ month</p>
                        </div>

                        {/* Difficulty */}
                        <div className="col-span-2 text-center">
                          <span className={`border text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider ${DIFFICULTY_COLORS[kw.difficulty] || DIFFICULTY_COLORS.medium}`}>
                            {kw.difficulty}
                          </span>
                        </div>

                        {/* Intent */}
                        <div className="col-span-2 text-center">
                          <span className={`border text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider ${INTENT_COLORS[kw.intent] || INTENT_COLORS.informational}`}>
                            {kw.intent}
                          </span>
                        </div>

                        {/* Action Button */}
                        <div className="col-span-2 flex justify-end">
                          {isGenerated ? (
                            <button
                              onClick={() => router.push(`/blogs/${kw.blog_id}`)}
                              className="btn-secondary px-4 py-2 text-[10px] rounded-xl uppercase font-black tracking-wider"
                            >
                              View Blog →
                            </button>
                          ) : (
                            <button
                              onClick={() => handleGenerate(kw.id, kw.keyword)}
                              disabled={isGenerating || isFailed}
                              className={`px-4 py-2 text-[10px] rounded-xl uppercase font-black tracking-wider border transition-all ${
                                isGenerating
                                  ? "border-amber-500/20 text-amber-400 bg-amber-400/5 cursor-not-allowed"
                                  : isFailed
                                  ? "border-red-500/20 text-red-400 bg-red-400/5 cursor-not-allowed"
                                  : "btn-brand"
                              }`}
                            >
                              {isGenerating ? (
                                <span className="flex items-center gap-1.5">
                                  <span className="h-3 w-3 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
                                  Working…
                                </span>
                              ) : isFailed ? "Retry" : "Generate Blog"}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Auto-generated info note */}
          {stats.pending > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-center text-[11px] text-slate-600 font-medium"
            >
              ⚡ {stats.pending} pending keyword{stats.pending !== 1 ? "s" : ""} will be auto-generated overnight (up to 5 per day per account).
            </motion.p>
          )}
        </div>
      </main>
    </>
  );
}
