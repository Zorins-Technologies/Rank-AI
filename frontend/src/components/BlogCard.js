"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function BlogCard({ blog, index }) {
  // Safe formatting for the date using native Intl
  const formattedDate = blog.createdAt 
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(blog.createdAt))
    : "Recently";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative"
    >
      <div className="glass-card hover:border-brand-500/30 group-hover:shadow-brand-500/10 group-hover:-translate-y-2 h-full flex flex-col p-6 overflow-hidden bg-slate-900/40 backdrop-blur-3xl transition-all duration-500">
        
        {/* Image Container */}
        <div className="relative mb-6 h-52 overflow-hidden rounded-[2rem] bg-slate-800/50 group-hover:shadow-2xl transition-all duration-500">
          {blog.imageUrl ? (
            <img 
              src={blog.imageUrl} 
              alt={blog.title}
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
              <span className="text-5xl opacity-40">📄</span>
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* SEO Score Badge on Image */}
          {(blog.analysis || blog.seoScore) && (
            <div className="absolute top-4 right-4 bg-slate-950/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-[10px] font-black tracking-tighter text-brand-400 shadow-xl">
              SEO: {blog.analysis?.score ?? blog.seoScore?.score ?? blog.seoScore ?? "N/A"}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-grow space-y-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-[9px] uppercase tracking-[0.2em] font-black text-brand-400">
              {blog.category || "Intelligence"}
            </span>
            <div className="h-1 w-1 rounded-full bg-slate-700" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {blog.analysis?.wordCount ?? "800+"} Words
            </span>
          </div>

          <h3 className="line-clamp-2 text-xl font-display font-bold text-white group-hover:text-brand-400 transition-colors leading-tight">
            <Link href={`/blogs/${blog.slug || blog.id}`}>
              {blog.title}
            </Link>
          </h3>

          <p className="line-clamp-2 text-sm text-slate-400 leading-relaxed font-medium">
            {blog.metaDescription || blog.description || "Synthesizing high-authority content via advanced Gemini intelligence."}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
             <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
             <span>{formattedDate}</span>
          </div>

          <Link 
            href={`/blogs/${blog.slug || blog.id}`}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-brand-400 group/link"
          >
            <span>Read Article</span>
            <svg className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
