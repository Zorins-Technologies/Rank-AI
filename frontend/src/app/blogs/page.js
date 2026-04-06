"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import SeoGradeBadge from "@/components/SeoGradeBadge";
import { fetchBlogs } from "@/lib/api";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialSearch = params.get("search") || "";
    setSearchTerm(initialSearch);
    loadBlogs(initialSearch);
  }, []);

  const loadBlogs = async (search = "") => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchBlogs(search);
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

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    const searchPath = trimmed ? `/blogs?search=${encodeURIComponent(trimmed)}` : "/blogs";
    router.push(searchPath);
    loadBlogs(trimmed);
  };

  const clearSearch = () => {
    setSearchTerm("");
    router.push("/blogs");
    loadBlogs();
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
                  <button onClick={() => { setSearchTerm(""); loadBlogs(); }} className="btn-secondary inline-flex items-center justify-center px-4 py-2">
                    Refresh list
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Search Form */}
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Try a keyword"
                  className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-3 text-slate-100 placeholder-slate-400 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
                />
              </div>
              <button
                type="submit"
                className="btn-primary px-6 py-3"
                disabled={loading}
              >
                Search
              </button>
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="btn-secondary px-6 py-3"
                  disabled={loading}
                >
                  Clear
                </button>
              )}
            </form>
          </div>

          {loading && (
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-16 text-center text-slate-300 shadow-xl">
              <div className="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-2 border-brand-400/30 border-t-transparent" />
              <p>Loading your saved blogs…</p>
            </div>
          )}

          {error && (
            <div className="rounded-[2rem] border border-red-500/20 bg-red-500/10 p-6 mb-8 text-red-100 shadow-sm">
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

          {!loading && !error && blogs.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/blogs/${blog.slug || blog.id}`}
                  className="group block text-left overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-5 transition hover:-translate-y-1 hover:border-brand-400/30"
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
                    <span className="rounded-full bg-brand-500/10 px-3 py-1 text-brand-200 uppercase tracking-[0.2em]">{blog.keyword}</span>
                    {blog.seoScore && <SeoGradeBadge grade={blog.seoScore.grade} />}
                  </div>
                  <h3 className="text-xl font-semibold text-white line-clamp-2 mb-2">{blog.title}</h3>
                  <p className="text-slate-400 text-sm line-clamp-3">{blog.metaDescription}</p>
                  <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
                    <span>{blog.createdAt ? new Date(blog.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Unknown date"}</span>
                    <span className="text-brand-300 font-semibold">View details</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
