"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";

export default function HomePage() {
  const [keyword, setKeyword] = useState("");
  const router = useRouter();

  const handleSearch = (event) => {
    event.preventDefault();
    const trimmed = keyword.trim();
    const searchPath = trimmed ? `/blogs?search=${encodeURIComponent(trimmed)}` : "/blogs";
    router.push(searchPath);
  };

  return (
    <>
      <Navbar />
      <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 text-slate-100">
        <div className="hero-glow"></div>
        <div className="hero-glow-2"></div>

        <section className="relative px-6 pt-24 pb-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mx-auto max-w-6xl"
          >
            <div className="glass-card gradient-border overflow-hidden p-10 md:p-14">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-3xl">
                  <div className="feature-pill mb-6">AI + SEO content intelligence</div>
                  <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
                    Build premium blog content with one keyword.
                  </h1>
                  <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                    Generate SEO-optimized articles, smart blog images, and polished publishing drafts with a premium AI workflow.
                  </p>

                  <div className="mt-10 grid gap-4 sm:grid-cols-[1fr_auto]">
                    <div className="glass-card p-4 sm:p-5">
                      <div className="flex flex-col gap-3">
                        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Try a keyword</p>
                          <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <input
                              type="text"
                              value={keyword}
                              onChange={(e) => setKeyword(e.target.value)}
                              placeholder="Try a keyword"
                              className="input-field glow-input"
                            />
                            <button type="submit" className="btn-primary w-full text-center sm:w-auto">
                              Search blogs
                            </button>
                          </form>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/10">
                      <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Saved drafts</p>
                        <p className="mt-2 text-2xl font-semibold text-white">Instant access</p>
                      </div>
                      <span className="inline-flex rounded-full bg-brand-500/15 px-4 py-2 text-sm font-semibold text-brand-300">Secure</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-slate-950/30">
                  <p className="text-sm uppercase tracking-[0.35em] text-brand-400">Quick launch</p>
                  <div className="mt-6 grid gap-4">
                    {[
                      ["Instant drafts", "AI outlines your blog structure in seconds."],
                      ["Visual headlines", "Create clickable titles that convert."],
                      ["SEO score", "Get a performance-ready content report."],
                    ].map(([title, body]) => (
                      <div key={title} className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
                        <p className="text-sm uppercase tracking-[0.35em] text-slate-500">{title}</p>
                        <p className="mt-3 text-slate-300">{body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="relative px-6 pb-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
            className="mx-auto max-w-6xl"
          >
            <div className="grid gap-6 md:grid-cols-3">
              {[
                ["AI Content Generation", "Google Gemini creates SEO-optimized, long-form blog posts tailored to your target keyword."],
                ["AI Image Generation", "Google Imagen generates stunning visuals that match your article instantly."],
                ["Centralized Library", "Store, preview, and publish your blog drafts from a premium dashboard."],
              ].map(([title, description], index) => (
                <motion.div
                  key={title}
                  whileHover={{ y: -6 }}
                  className="glass-card gradient-border p-8 transition-all duration-300"
                >
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-brand-500/10 text-brand-300">
                    <span className="text-xl">{index + 1}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
                  <p className="text-slate-300 leading-relaxed">{description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      </main>
    </>
  );
}
