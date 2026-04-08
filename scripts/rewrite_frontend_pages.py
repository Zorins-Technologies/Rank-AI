from pathlib import Path

base_dir = Path(__file__).parent / "frontend" / "src" / "app"

generate_page = base_dir / "generate" / "page.js"
blogs_page = base_dir / "blogs" / "page.js"

generate_content = '''"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { generateBlog } from "@/lib/api";

export default function GeneratePage() {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [blog, setBlog] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setBlog(null);

    const query = keyword.trim();
    if (!query) {
      setError("Please enter a topic or keyword to begin.");
      return;
    }

    setLoading(true);
    try {
      const response = await generateBlog(query);
      if (!response.success) {
        throw new Error(response.error || "Unable to generate the blog.");
      }
      setBlog(response.data);
    } catch (err) {
      setError(err.message || "Unexpected error while generating content.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-slate-950/95 text-slate-100">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-brand-500/20 via-transparent to-transparent blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-24 h-96 w-96 rounded-full bg-violet-500/15 blur-3xl" />

        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10">
          <section className="grid gap-8 rounded-[2rem] border border-white/10 bg-slate-950/90 p-10 shadow-2xl shadow-brand-500/10 backdrop-blur-xl lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/20 bg-brand-500/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-brand-200 shadow-sm shadow-brand-500/10">
                AI-powered content studio
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                  Launch polished blog content from a single idea.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-300">
                  Generate an SEO-ready blog post with title, summary, full article, and visuals in one elegant workflow.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ["Instant drafts", "Turn ideas into publish-ready blog posts in seconds."],
                  ["SEO-ready", "Structure output for search, readability, and modern audiences."],
                  ["Visual-first", "Auto image support helps your content feel polished and professional."],
                ].map((item) => (
                  <div key={item[0]} className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/20">
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{item[0]}</p>
                    <p className="mt-3 text-white font-semibold">{item[1]}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.35em] text-brand-300 mb-6">Describe your next blog</p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <label htmlFor="keyword" className="text-sm font-medium text-slate-200">
                  Topic, keyword, or product idea
                </label>
                <input
                  id="keyword"
                  type="text"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="e.g. remote work productivity"
                  className="input-field"
                  disabled={loading}
                  maxLength={200}
                />
                {error && <p className="text-sm text-rose-300">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center"
                >
                  {loading ? (
                    <>
                      <span className="mr-2 inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
                      Generating blog
                    </>
                  ) : (
                    "Create blog draft"
                  )}
                </button>
              </form>
            </div>
          </section>

          {blog && (
            <section className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
              <div className="space-y-6 rounded-[2rem] border border-white/10 bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-[0.35em] text-brand-400">Blog preview</p>
                  <h2 className="text-3xl font-semibold text-white">{blog.title}</h2>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                    <span className="rounded-full bg-brand-500/10 px-3 py-1 text-brand-200">{blog.keyword}</span>
                    <span className="rounded-full bg-slate-800 px-3 py-1">/{blog.slug}</span>
                  </div>
                </div>
                {blog.imageUrl && (
                  <div className="overflow-hidden rounded-3xl border border-white/10 shadow-xl">
                    <img src={blog.imageUrl} alt={blog.title} className="h-72 w-full object-cover" />
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Meta summary</p>
                      <p className="mt-3 text-slate-200">{blog.metaDescription}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-800/80 px-4 py-2 text-sm text-slate-200">
                      {blog.content.length.toLocaleString()} characters
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
                  <h3 className="text-lg font-semibold text-white mb-4">Generated content</h3>
                  <div className="prose prose-invert max-w-none whitespace-pre-line text-slate-200">{blog.content}</div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
'''

blogs_content = '''"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { fetchBlogs } from "@/lib/api";

function SeoGradeBadge({ grade }) {
  const colorMap = {
    A: "bg-emerald-500/15 text-emerald-400",
    B: "bg-blue-500/15 text-blue-400",
    C: "bg-amber-500/15 text-amber-400",
    D: "bg-orange-500/15 text-orange-400",
    F: "bg-red-500/15 text-red-400",
  };

  if (!grade) return null;

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colorMap[grade] || "bg-slate-700 text-slate-100"}`}>
      {grade}
    </span>
  );
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchBlogs();
      if (response.success) {
        setBlogs(response.data || []);
      } else {
        throw new Error(response.error || "Unable to load blogs.");
      }
    } catch (err) {
      setError(err.message || "Unexpected error while fetching blogs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)] bg-slate-950 px-6 py-12 text-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-10">
          <div className="grid gap-8 rounded-[2rem] border border-white/10 bg-slate-950/90 p-10 shadow-2xl shadow-brand-500/10 backdrop-blur-xl lg:grid-cols-[1.4fr_0.8fr]">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.3em] text-brand-400">Content vault</p>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Explore your generated blog library.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                Review published drafts, preview SEO scores, and continue building your next high-impact post.
              </p>
            </div>
            <div className="flex flex-col gap-4 rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-6 text-sm text-slate-200">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Total blogs</span>
                <span className="rounded-full bg-brand-500/10 px-3 py-1 text-brand-200">{blogs.length}</span>
              </div>
              <div className="border-t border-white/10 pt-4">
                <p className="text-slate-400">Quick actions</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href="/generate" className="btn-primary inline-flex items-center justify-center px-4 py-2">
                    Generate new
                  </Link>
                  <button onClick={loadBlogs} className="btn-secondary inline-flex items-center justify-center px-4 py-2">
                    Refresh list
                  </button>
                </div>
              </div>
            </div>
          </div>

          {loading && (
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-16 text-center text-slate-300 shadow-xl">
              <div className="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-2 border-brand-400/30 border-t-transparent" />
              <p>Loading your saved blogs…</p>
            </div>
          )}

          {error && (
            <div className="rounded-[2rem] border border-red-500/20 bg-red-500/10 p-6 text-red-100 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">Could not load blogs</p>
                  <p className="text-sm text-red-200">{error}</p>
                </div>
                <button onClick={loadBlogs} className="btn-secondary">
                  Try again
                </button>
              </div>
            </div>
          )}

          {!loading && !error && blogs.length === 0 && (
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-16 text-center text-slate-200 shadow-xl">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-500/10 text-brand-200">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-3">No blogs yet</h2>
              <p className="text-slate-400 mb-6">Create your first AI-generated blog and it will appear here with full metrics and previews.</p>
              <Link href="/generate" className="btn-primary">
                Start generating
              </Link>
            </div>
          )}

          {!loading && !error && blogs.length > 0 && !selectedBlog && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => (
                <button
                  key={blog.id}
                  onClick={() => setSelectedBlog(blog)}
                  className="group text-left overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-5 text-left transition hover:-translate-y-1 hover:border-brand-400/30"
                >
                  <div className="mb-4 h-44 overflow-hidden rounded-3xl bg-slate-950">
                    {blog.imageUrl ? (
                      <img
                        src={blog.imageUrl}
                        alt={blog.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-slate-800 text-slate-400">No image</div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-3 text-xs text-slate-400">
                    <span className="rounded-full bg-brand-500/10 px-3 py-1 uppercase tracking-[0.2em] text-brand-200">{blog.keyword}</span>
                    {blog.seoScore && <SeoGradeBadge grade={blog.seoScore.grade} />}
                  </div>
                  <h3 className="text-xl font-semibold text-white line-clamp-2 mb-2">{blog.title}</h3>
                  <p className="text-slate-400 text-sm line-clamp-3">{blog.metaDescription}</p>
                  <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
                    <span>{blog.createdAt ? new Date(blog.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Unknown date"}</span>
                    <span className="text-brand-300 font-semibold">Preview</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedBlog && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/30 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-brand-400 mb-2">Blog detail</p>
                  <h2 className="text-3xl font-bold text-white">{selectedBlog.title}</h2>
                  <p className="text-slate-400 mt-2 max-w-2xl">Review the saved blog with SEO metrics, preview, and easy navigation.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => setSelectedBlog(null)} className="btn-secondary">
                    Back to list
                  </button>
                  <Link href="/generate" className="btn-primary">
                    Generate more
                  </Link>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
                <div className="space-y-6 rounded-[2rem] border border-white/10 bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/30">
                  <div className="rounded-[1.75rem] overflow-hidden border border-white/10 bg-slate-900">
                    {selectedBlog.imageUrl ? (
                      <img src={selectedBlog.imageUrl} alt={selectedBlog.title} className="h-80 w-full object-cover" />
                    ) : (
                      <div className="flex h-80 items-center justify-center bg-slate-800 text-slate-400">No image available</div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3 text-slate-400">
                      <span className="rounded-full bg-brand-500/10 px-3 py-1 text-brand-200">{selectedBlog.keyword}</span>
                      {selectedBlog.slug && <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">/{selectedBlog.slug}</span>}
                    </div>
                    <div className="text-slate-400 text-sm">
                      {selectedBlog.createdAt ? new Date(selectedBlog.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Date unavailable"} • Saved in Firestore
                    </div>
                  </div>
                </div>

                <aside className="space-y-6">
                  {selectedBlog.seoScore && (
                    <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-xl">
                      <p className="text-xs uppercase tracking-[0.3em] text-brand-400 mb-4">SEO score</p>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-4xl font-bold text-white">{selectedBlog.seoScore.score}</div>
                        <SeoGradeBadge grade={selectedBlog.seoScore.grade} />
                      </div>
                      <div className="space-y-2 text-sm text-slate-300">
                        <p>Word count: {selectedBlog.seoScore.wordCount}</p>
                        <p>Keyword density: {selectedBlog.seoScore.keywordDensity}%</p>
                      </div>
                    </div>
                  )}

                  <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-xl">
                    <p className="text-xs uppercase tracking-[0.3em] text-brand-400 mb-4">Summary</p>
                    <p className="text-slate-300 text-sm leading-relaxed">{selectedBlog.metaDescription || "No summary available."}</p>
                  </div>
                </aside>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/30">
                <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: selectedBlog.content }} />
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
'''

for path, content in [(generate_page, generate_content), (blogs_page, blogs_content)]:
    path.write_text(content, encoding="utf-8")
    print(f"Wrote {path}")
