"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import { generateBlog } from "../../lib/api";

function SeoScoreBadge({ score, grade }) {
  const colorMap = {
    A: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
    B: "text-blue-400 bg-blue-500/15 border-blue-500/30",
    C: "text-yellow-400 bg-yellow-500/15 border-yellow-500/30",
    D: "text-orange-400 bg-orange-500/15 border-orange-500/30",
    F: "text-red-400 bg-red-500/15 border-red-500/30",
  };
  const colors = colorMap[grade] || colorMap.C;

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${colors}`}>
      <span className="text-2xl font-bold">{score}</span>
      <div className="text-left">
        <div className="text-xs uppercase tracking-wider opacity-70">SEO Score</div>
        <div className="text-sm font-semibold">Grade {grade}</div>
      </div>
    </div>
  );
}

function SeoDetails({ details }) {
  const statusIcon = {
    pass: "✅",
    warn: "⚠️",
    fail: "❌",
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
      {details.map((item, i) => (
        <div key={i} className="flex items-start gap-2 text-sm">
          <span className="shrink-0">{statusIcon[item.status]}</span>
          <div>
            <span className="text-dark-50 font-medium">{item.check}:</span>{" "}
            <span className="text-dark-200">{item.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function GeneratePage() {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState("");
  const [showSeoDetails, setShowSeoDetails] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setShowSeoDetails(false);
    setStep("Generating blog content with Gemini...");

    try {
      const stepTimer1 = setTimeout(() => setStep("Creating image with Imagen..."), 8000);
      const stepTimer2 = setTimeout(() => setStep("Uploading image to Cloud Storage..."), 16000);
      const stepTimer3 = setTimeout(() => setStep("Analyzing SEO & saving to Firestore..."), 20000);

      const response = await generateBlog(keyword.trim());

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      if (response.success) {
        setResult(response.data);
        setStep("");
      } else {
        throw new Error(response.error || "Unknown error");
      }
    } catch (err) {
      setError(err.message);
      setStep("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)] px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl font-bold text-white mb-3">
              Generate <span className="gradient-text">SEO Blog</span>
            </h1>
            <p className="text-dark-100 text-lg">
              Enter a keyword and let AI create a complete, optimized blog post with a matching image.
            </p>
          </div>

          {/* Input Form */}
          <form onSubmit={handleGenerate} className="glass-card gradient-border p-8 mb-8 animate-slide-up">
            <label htmlFor="keyword-input" className="block text-sm font-medium text-dark-100 mb-2">
              Target Keyword
            </label>
            <div className="flex gap-4">
              <input
                id="keyword-input"
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g., best project management tools 2025"
                className="input-field flex-1"
                disabled={loading}
                maxLength={200}
              />
              <button
                type="submit"
                disabled={loading || !keyword.trim()}
                className="btn-primary whitespace-nowrap flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="spinner !w-5 !h-5 !border-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    Generate
                  </>
                )}
              </button>
            </div>

            {/* Progress indicator */}
            {loading && step && (
              <div className="mt-6 flex items-center gap-3 text-brand-400 animate-fade-in">
                <div className="spinner !w-4 !h-4 !border-2" />
                <span className="text-sm font-medium">{step}</span>
              </div>
            )}
          </form>

          {/* Error */}
          {error && (
            <div className="glass-card border-red-500/30 bg-red-500/5 p-6 mb-8 animate-fade-in">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <div>
                  <h3 className="text-red-400 font-semibold mb-1">Generation Failed</h3>
                  <p className="text-red-300/80 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="animate-slide-up space-y-6">
              {/* Success badge + SEO Score */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-emerald-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-semibold">Blog generated and saved successfully!</span>
                </div>

                {result.seoScore && (
                  <div className="flex items-center gap-3">
                    <SeoScoreBadge score={result.seoScore.score} grade={result.seoScore.grade} />
                    <button
                      onClick={() => setShowSeoDetails(!showSeoDetails)}
                      className="text-xs text-brand-400 hover:text-brand-300 underline"
                    >
                      {showSeoDetails ? "Hide details" : "View details"}
                    </button>
                  </div>
                )}
              </div>

              {/* SEO Details (collapsible) */}
              {showSeoDetails && result.seoScore && (
                <div className="glass-card p-6 animate-fade-in">
                  <h3 className="text-sm font-semibold text-white mb-1">SEO Analysis</h3>
                  <p className="text-xs text-dark-200 mb-3">
                    {result.seoScore.wordCount} words · {result.seoScore.keywordDensity}% keyword density
                  </p>
                  <SeoDetails details={result.seoScore.details} />
                </div>
              )}

              {/* Image */}
              {result.imageUrl && (
                <div className="glass-card gradient-border overflow-hidden">
                  <img
                    src={result.imageUrl}
                    alt={result.title}
                    className="w-full h-64 sm:h-80 object-cover"
                  />
                </div>
              )}

              {/* Blog content */}
              <div className="glass-card gradient-border p-8">
                <div className="mb-6">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="inline-block px-3 py-1 rounded-full bg-brand-600/15 text-brand-400 text-xs font-semibold uppercase tracking-wider">
                      {result.keyword}
                    </span>
                    {result.slug && (
                      <span className="inline-block px-3 py-1 rounded-full bg-dark-500 text-dark-200 text-xs font-mono">
                        /{result.slug}
                      </span>
                    )}
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-3">{result.title}</h2>
                  {result.metaDescription && (
                    <p className="text-dark-200 text-sm italic border-l-2 border-brand-500/30 pl-4">
                      {result.metaDescription}
                    </p>
                  )}
                </div>
                <hr className="border-dark-400/20 mb-6" />
                <div
                  className="blog-content"
                  dangerouslySetInnerHTML={{ __html: result.content }}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Link href="/blogs" className="btn-secondary text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  View All Blogs
                </Link>
                <button
                  onClick={() => { setResult(null); setKeyword(""); }}
                  className="btn-primary text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Generate Another
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
