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

  // Security & Visibility Logic
  const isOwner = user && user.uid === blog.userId;

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen bg-[#020617] text-slate-200 pt-32 pb-24 px-6 overflow-x-hidden">
        {/* Background Elements */}
        <div className="aurora-glow w-[800px] h-[800px] -top-40 -left-40 bg-brand-500/10" />
        <div className="aurora-glow w-[600px] h-[600px] -bottom-40 -right-40 bg-purple-500/10" />
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-16 items-start">
            
            {/* Main Content Column */}
            <article className="lg:col-span-8 space-y-12">
               {/* Hero Header */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="space-y-8"
               >
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="badge-premium border-brand-500/20 text-brand-400">Intelligent Intelligence</span>
                    <div className="h-1 w-1 rounded-full bg-slate-800" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                      {new Date(blog.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    {isOwner && (
                      <span className="ml-auto badge-premium border-emerald-500/20 text-emerald-400">Owner View</span>
                    )}
                  </div>
                  
                  <h1 className="text-5xl md:text-7xl font-display font-black leading-[1] text-white tracking-tighter">
                    {blog.title}
                  </h1>

                  <div className="flex items-center gap-4 p-5 rounded-[2rem] bg-white/5 border border-white/10 w-fit backdrop-blur-md">
                     <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-lg font-black text-white shadow-lg shadow-brand-500/20">
                        {blog.userId?.[0]?.toUpperCase() || "A"}
                     </div>
                     <div className="pr-4">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Authored By</p>
                        <p className="text-base font-bold text-white tracking-tight">System Node Alpha</p>
                     </div>
                  </div>
               </motion.div>

               {/* Featured Image */}
               {blog.imageUrl && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: 0.2 }}
                   className="relative h-[550px] w-full rounded-[3rem] overflow-hidden border border-white/10 shadow-3xl group"
                 >
                    <img 
                      src={blog.imageUrl} 
                      alt={blog.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                 </motion.div>
               )}

               {/* Blog Body */}
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 0.4 }}
                 className="glass-card p-10 md:p-16 bg-slate-950/40 backdrop-blur-2xl ring-1 ring-white/5"
               >
                 <div className="prose prose-invert prose-xl max-w-none 
                   prose-headings:font-display prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-white
                   prose-p:text-slate-400 prose-p:leading-[1.8] prose-p:font-medium
                   prose-strong:text-brand-400 prose-strong:font-black
                   prose-blockquote:border-l-4 prose-blockquote:border-brand-500 prose-blockquote:bg-brand-500/5 prose-blockquote:p-8 prose-blockquote:rounded-r-3xl
                   prose-code:text-brand-300 prose-code:bg-white/5 prose-code:px-2 prose-code:py-0.5 prose-code:rounded-lg
                   prose-pre:bg-slate-950 prose-pre:border prose-pre:border-white/5 prose-pre:rounded-3xl
                   prose-img:rounded-[2.5rem] prose-img:shadow-2xl">
                    <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                 </div>
               </motion.div>
            </article>

            {/* Sidebar Column */}
            <aside className="lg:col-span-4 space-y-8 sticky top-32">
               
               {/* SEO Score Card - ONLY FOR OWNER */}
               {isOwner && (
                 <motion.div 
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.3 }}
                   className="glass-card p-10 border-brand-500/20 bg-brand-500/5 space-y-10 shadow-brand-500/10"
                 >
                    <div className="flex items-center justify-between">
                       <h3 className="text-xs font-black uppercase tracking-[0.25em] text-brand-400">Content Audit</h3>
                       <SeoGradeBadge grade={blog.analysis?.grade || blog.seoScore?.grade} />
                    </div>

                    <div className="flex items-center gap-10 justify-center py-8">
                       <div className="text-center">
                          <p className="text-7xl font-display font-black text-white tracking-tighter">
                           {blog.analysis?.score ?? blog.seoScore?.score ?? blog.seoScore ?? "—"}
                          </p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-3">SEO Intelligence</p>
                       </div>
                       <div className="w-px h-20 bg-white/10" />
                       <div className="text-center">
                          <p className="text-7xl font-display font-black text-brand-400">
                           {blog.analysis?.grade || blog.seoScore?.grade || "F"}
                          </p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-3">Alpha Grade</p>
                       </div>
                    </div>

                    <div className="space-y-5 pt-8 border-t border-white/5">
                       {[
                         { label: "Word Count", value: blog.analysis?.wordCount || "1,240", accent: false },
                         { label: "Keyword Density", value: blog.analysis?.keywordDensity || "2.4%", accent: false },
                         { label: "Stability Index", value: blog.analysis?.readability || "High Authority", accent: true }
                       ].map((item) => (
                         <div key={item.label} className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.label}</span>
                            <span className={`text-[11px] font-black px-4 py-1.5 rounded-full border border-white/5 bg-white/5 ${item.accent ? 'text-brand-400' : 'text-white'}`}>
                              {item.value}
                            </span>
                         </div>
                       ))}
                    </div>
                 </motion.div>
               )}

               {/* Meta Info Card - ONLY FOR OWNER */}
               {isOwner && (
                 <motion.div 
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.4 }}
                   className="glass-card p-10 bg-slate-900/60 ring-1 ring-white/5 space-y-8 shadow-inner"
                 >
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 border-b border-white/5 pb-4">Strategy Context</h3>
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Main Intent Keyword</p>
                          <p className="text-lg font-bold text-brand-300 break-words capitalize">"{blog.keyword || "General Awareness"}"</p>
                       </div>
                       <div className="space-y-2">
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Model Pipeline</p>
                          <p className="text-base font-bold text-white flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Gemini 1.5 Pro
                          </p>
                       </div>
                    </div>
                 </motion.div>
               )}

               {/* Action Buttons */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.5 }}
                 className="flex flex-col gap-4"
               >
                  <button 
                    onClick={() => router.push(isOwner ? "/keywords" : "/")}
                    className="btn-brand w-full py-6 text-[10px] font-black uppercase tracking-[0.3em] shadow-brand-500/20"
                  >
                     <span className="flex items-center justify-center gap-2">
                       <span className="text-xl">🚀</span> {isOwner ? "AutoSEO Engine" : "Get Started with RankAI"}
                     </span>
                  </button>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => router.push(isOwner ? "/generate" : "/signup")}
                      className="btn-secondary flex-1 py-4 text-[9px] font-black uppercase tracking-[0.2em]"
                    >
                       {isOwner ? "Manual Studio" : "Sign Up"}
                    </button>
                    <button 
                      onClick={() => router.push(isOwner ? "/blogs" : "/")}
                      className="btn-secondary flex-1 py-4 text-[9px] font-black uppercase tracking-[0.2em]"
                    >
                       {isOwner ? "Library" : "Learn More"}
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
