"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function BlogCard({ blog, index }) {
  const formattedDate = blog.createdAt 
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(blog.createdAt))
    : "Recent";

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.05 }} className="group h-full">
      <div className="glass-card h-full flex flex-col p-5 bg-slate-900/60 hover:border-indigo-500/30 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.05)] transition-all duration-300">
        
        <div className="relative mb-5 h-48 overflow-hidden rounded-2xl bg-slate-800/50">
          {blog.imageUrl ? (
            <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-[#020617] text-3xl opacity-20">🗂️</div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {(blog.analysis || blog.seoScore) && (
            <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur border border-white/5 px-2.5 py-1 rounded bg-opacity-90 text-[9px] font-black tracking-widest text-indigo-400 shadow-sm uppercase">
              Score {blog.analysis?.score ?? blog.seoScore?.score ?? blog.seoScore ?? "N/A"}
            </div>
          )}
        </div>

        <div className="flex flex-col flex-grow space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[8px] uppercase tracking-widest font-black text-indigo-400">
              {blog.category || "General"}
            </span>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
              {blog.analysis?.wordCount ?? "1k+"} W
            </span>
          </div>

          <h3 className="line-clamp-2 text-lg font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
            <Link href={`/blogs/${blog.slug || blog.id}`}>
              {blog.title}
            </Link>
          </h3>

          <p className="line-clamp-2 text-xs text-slate-400 font-medium leading-relaxed">
            {blog.metaDescription || blog.description || "Generated intelligence metric output."}
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
             {formattedDate}
          </div>

          <Link href={`/blogs/${blog.slug || blog.id}`} className="text-[9px] font-black uppercase tracking-widest text-indigo-400 group/link flex items-center gap-1">
            Access File <svg className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" /></svg>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
