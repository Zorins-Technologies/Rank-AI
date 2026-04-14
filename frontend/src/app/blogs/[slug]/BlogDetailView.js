"use client";

import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import SeoGradeBadge from "../../../components/SeoGradeBadge";
import { useAuth } from "../../../context/AuthContext";
import { motion } from "framer-motion";

export default function BlogDetailView({ blog }) {
  const { user } = useAuth();
  const router = useRouter();

  if (!blog) return null;

  const isOwner = user && user.uid === blog.userId;

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen bg-[#020617] text-slate-200 pt-32 pb-24 px-6 overflow-hidden">
        <div className="aurora-glow w-[800px] h-[800px] -top-52 -left-52 bg-indigo-500/10" />
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            <article className="lg:col-span-8 space-y-10">
               <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="badge-premium border-indigo-500/20 text-indigo-400 bg-indigo-500/5">Validated Asset</span>
                    <div className="h-1 w-1 rounded-full bg-slate-700" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      {new Date(blog.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {isOwner && <span className="ml-auto px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[8px] uppercase tracking-widest border border-emerald-500/20">Admin View</span>}
                  </div>
                  
                  <h1 className="text-4xl md:text-6xl font-display font-black leading-tight text-white tracking-tight">
                    {blog.title}
                  </h1>

                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-black text-white shadow-inner">
                        {blog.userId?.[0]?.toUpperCase() || "A"}
                     </div>
                     <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Authorized Source</p>
                        <p className="text-sm font-bold text-slate-300">System Architecture</p>
                     </div>
                  </div>
               </motion.div>

               {blog.imageUrl && (
                 <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="relative h-[400px] md:h-[500px] w-full rounded-3xl overflow-hidden border border-white/5 shadow-2xl group">
                    <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] to-transparent opacity-80" />
                 </motion.div>
               )}

               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card p-8 md:p-12 bg-slate-950/80 ring-1 ring-white/5 shadow-2xl">
                 <div className="prose prose-invert prose-lg max-w-none 
                   prose-headings:font-display prose-headings:font-black prose-headings:text-white
                   prose-p:text-slate-400 prose-p:leading-loose prose-p:font-medium text-base
                   prose-strong:text-indigo-400 prose-strong:font-black
                   prose-a:text-brand-400 prose-a:font-bold prose-a:no-underline hover:prose-a:text-brand-300
                   prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-500/5 prose-blockquote:p-6 prose-blockquote:rounded-r-xl
                   prose-code:text-indigo-300 prose-code:bg-slate-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                   prose-pre:bg-[#020617] prose-pre:border prose-pre:border-white/5 prose-pre:rounded-xl">
                    <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                 </div>
               </motion.div>
            </article>

            <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-32">
               {isOwner && (
                 <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 bg-indigo-500/5 border-indigo-500/20 shadow-inner">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Validation Matrix</h3>
                       <SeoGradeBadge grade={blog.analysis?.grade || blog.seoScore?.grade} />
                    </div>

                    <div className="flex justify-center gap-8 mb-8">
                       <div className="text-center">
                          <p className="text-5xl font-display font-black text-white">{blog.analysis?.score ?? blog.seoScore?.score ?? blog.seoScore ?? "—"}</p>
                          <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mt-2">SEO Propensity</p>
                       </div>
                       <div className="w-px bg-white/10" />
                       <div className="text-center">
                          <p className="text-5xl font-display font-black text-indigo-400">{blog.analysis?.grade || blog.seoScore?.grade || "F"}</p>
                          <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mt-2">Alpha Grade</p>
                       </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-white/5 text-xs font-bold">
                       <div className="flex justify-between text-slate-400"><span className="uppercase tracking-widest text-[9px]">Token Count</span><span className="text-white">{blog.analysis?.wordCount || "1,200+"}</span></div>
                       <div className="flex justify-between text-slate-400"><span className="uppercase tracking-widest text-[9px]">Keyword Ratio</span><span className="text-white">{blog.analysis?.keywordDensity || "2.1%"}</span></div>
                       <div className="flex justify-between text-slate-400"><span className="uppercase tracking-widest text-[9px]">Readability</span><span className="text-indigo-400">High Trust</span></div>
                    </div>
                 </motion.div>
               )}

               {isOwner && (
                 <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 bg-slate-900/50">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5 pb-3 mb-4">Tactical Vector</h3>
                    <div className="space-y-4">
                       <div>
                          <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Intent Designation</p>
                          <p className="text-sm font-bold text-indigo-300 break-words capitalize">{blog.keyword || "Top Level Strategy"}</p>
                       </div>
                       <div>
                          <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Generation Node</p>
                          <p className="text-xs font-bold text-white flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Gemini Pro Base</p>
                       </div>
                    </div>
                 </motion.div>
               )}

               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-3">
                  <button onClick={() => router.push(isOwner ? "/dashboard" : "/")} className="btn-brand w-full py-4 text-[9px]">
                     {isOwner ? "Return to Dashboard" : "Initiate Growth Protocol"}
                  </button>
                  <div className="flex gap-3">
                    <button onClick={() => router.push(isOwner ? "/generate" : "/signup")} className="btn-secondary flex-1 py-3 text-[8px]">
                       {isOwner ? "Studio Config" : "Create Profile"}
                    </button>
                    <button onClick={() => router.push(isOwner ? "/blogs" : "/")} className="btn-secondary flex-1 py-3 text-[8px]">
                       {isOwner ? "Library Index" : "Documentation"}
                    </button>
                  </div>
               </motion.div>

            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
