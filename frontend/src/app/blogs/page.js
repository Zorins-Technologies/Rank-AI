"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { fetchBlogs } from "@/lib/api";

function SeoGradeBadge({ grade }) {
  const colorMap = {
    A: "bg-emerald-500/15 text-emerald-400",
    B: "bg-blue-500/15 text-blue-400",
    C: "bg-yellow-500/15 text-yellow-400",
    D: "bg-orange-500/15 text-orange-400",
    F: "bg-red-500/15 text-red-400",
  };
  if (!grade) return null;
  return (
    <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${colorMap[grade] || "bg-dark-500 text-dark-200"}`}>
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
    try {
      setLoading(true);
      setError(null);
      const response = await fetchBlogs();
      if (response.success) {
        setBlogs(response.data);
      } else {
        throw new Error(response.error || "Failed to load blogs");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)] px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-10 animate-fade-in">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Your <span className="gradient-text">Blogs</span>
              </h1>
              <p className="text-dark-100">
                {blogs.length > 0
                  ? `${blogs.length} blog${blogs.length !== 1 ? "s" : ""} generated`
                  : "No blogs yet"}
              </p>
            </div>
            <Link href="/generate" className="btn-primary flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Blog
            </Link>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
              <div className="spinner mb-4" />
              <p className="text-dark-200 text-sm">Loading blogs...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="glass-card border-red-500/30 bg-red-500/5 p-6 mb-8 animate-fade-in">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <div>
                  <h3 className="text-red-400 font-semibold mb-1">Error Loading Blogs</h3>
                  <p className="text-red-300/80 text-sm">{error}</p>
                </div>
              </div>
              <button onClick={loadBlogs} className="btn-secondary mt-4 text-sm py-2 px-4">
                Retry
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && blogs.length === 0 && (
            <div className="glass-card gradient-border p-16 text-center animate-slide-up">
              <div className="w-16 h-16 rounded-2xl bg-dark-600 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-dark-200" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No blogs yet</h3>
              <p className="text-dark-200 mb-6">Generate your first AI-powered SEO blog post.</p>
              <Link href="/generate" className="btn-primary inline-flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                Generate First Blog
              </Link>
            </div>
          )}

          {/* Blog grid */}
          {!loading && blogs.length > 0 && !selectedBlog && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog, index) => (
                <article
                  key={blog.id}
                  onClick={() => setSelectedBlog(blog)}
                  className="glass-card gradient-border overflow-hidden cursor-pointer group hover:-translate-y-1 transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  {blog.imageUrl && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={blog.imageUrl}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-brand-600/15 text-brand-400 text-xs font-semibold uppercase tracking-wider">
                        {blog.keyword}
                      </span>
                      {blog.seoScore && <SeoGradeBadge grade={blog.seoScore.grade} />}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-brand-300 transition-colors">
                      {blog.title}
                    </h3>
                    {blog.metaDescription && (
                      <p className="text-dark-200 text-sm line-clamp-2 mb-4">{blog.metaDescription}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-dark-200">
                      <span>
                        {blog.createdAt
                          ? new Date(blog.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Just now"}
                      </span>
                      <span className="text-brand-400 font-medium group-hover:underline">Read →</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Blog detail view */}
          {selectedBlog && (
            <div className="animate-fade-in">
              <button
                onClick={() => setSelectedBlog(null)}
                className="flex items-center gap-2 text-dark-100 hover:text-white mb-6 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Back to all blogs
              </button>

              {/* SEO Score bar */}
              {selectedBlog.seoScore && (
                <div className="glass-card p-4 mb-6 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`text-2xl font-bold ${
                      selectedBlog.seoScore.score >= 70 ? "text-emerald-400" :
                      selectedBlog.seoScore.score >= 50 ? "text-yellow-400" : "text-red-400"
                    }`}>
                      {selectedBlog.seoScore.score}/100
                    </div>
                    <SeoGradeBadge grade={selectedBlog.seoScore.grade} />
                  </div>
                  <div className="flex gap-4 text-xs text-dark-200">
                    <span>{selectedBlog.seoScore.wordCount} words</span>
                    <span>{selectedBlog.seoScore.keywordDensity}% keyword density</span>
                  </div>
                </div>
              )}

              {selectedBlog.imageUrl && (
                <div className="glass-card gradient-border overflow-hidden mb-6">
                  <img
                    src={selectedBlog.imageUrl}
                    alt={selectedBlog.title}
                    className="w-full h-64 sm:h-96 object-cover"
                  />
                </div>
              )}

              <div className="glass-card gradient-border p-8 sm:p-12">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-brand-600/15 text-brand-400 text-xs font-semibold uppercase tracking-wider">
                    {selectedBlog.keyword}
                  </span>
                  {selectedBlog.slug && (
                    <span className="inline-block px-3 py-1 rounded-full bg-dark-500 text-dark-200 text-xs font-mono">
                      /{selectedBlog.slug}
                    </span>
                  )}
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                  {selectedBlog.title}
                </h2>
                {selectedBlog.metaDescription && (
                  <p className="text-dark-200 text-sm italic border-l-2 border-brand-500/30 pl-4 mb-6">
                    {selectedBlog.metaDescription}
                  </p>
                )}
                <div className="text-xs text-dark-300 mb-8">
                  {selectedBlog.createdAt &&
                    new Date(selectedBlog.createdAt).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                </div>
                <hr className="border-dark-400/20 mb-8" />
                <div
                  className="blog-content"
                  dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
