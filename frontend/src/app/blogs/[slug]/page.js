import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import BlogDetailActions from "@/components/BlogDetailActions";
import SeoGradeBadge from "@/components/SeoGradeBadge";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchBlogBySlug(slug) {
  const res = await fetch(`${API_URL}/blogs/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return data.success ? data.data : null;
}

export async function generateMetadata({ params }) {
  const blog = await fetchBlogBySlug(params.slug);

  if (!blog) {
    return {
      title: "Blog not found",
      description: "This blog could not be found in your generated library.",
    };
  }

  return {
    title: `${blog.title} | Rank AI Blog`,
    description: blog.metaDescription || "Review your generated blog content and SEO insights.",
    openGraph: {
      title: blog.title,
      description: blog.metaDescription,
      type: "article",
      images: blog.imageUrl ? [{ url: blog.imageUrl }] : undefined,
    },
  };
}

export default async function BlogDetailPage({ params }) {
  const blog = await fetchBlogBySlug(params.slug);
  if (!blog) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)] bg-slate-950 px-6 py-12 text-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-10">
          <section className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-10 shadow-2xl shadow-brand-500/10 backdrop-blur-xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-4">
                <p className="text-sm uppercase tracking-[0.35em] text-brand-400">Blog detail</p>
                <h1 className="text-4xl font-bold text-white sm:text-5xl">{blog.title}</h1>
                <p className="max-w-3xl text-lg leading-8 text-slate-300">Review the generated full blog, metadata, and SEO score for your latest content.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href="/blogs" className="btn-secondary inline-flex items-center justify-center px-5 py-3">
                  Back to library
                </a>
                <a href="/generate" className="btn-primary inline-flex items-center justify-center px-5 py-3">
                  Generate new
                </a>
              </div>
            </div>
          </section>

          <div className="grid gap-8 xl:grid-cols-[1.6fr_1fr]">
            <div className="space-y-6 rounded-[2rem] border border-white/10 bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/30">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Keyword</p>
                  <p className="mt-3 text-xl font-semibold text-white">{blog.keyword}</p>
                </div>
                <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Slug</p>
                  <p className="mt-3 text-xl font-semibold text-white">/{blog.slug}</p>
                </div>
              </div>

              {blog.imageUrl && (
                <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900">
                  <img src={blog.imageUrl} alt={blog.title} className="h-96 w-full object-cover" />
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Published</p>
                  <p className="mt-3 text-white">{blog.createdAt ? new Date(blog.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Unknown date"}</p>
                </div>
                <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Summary</p>
                  <p className="mt-3 text-slate-200">{blog.metaDescription || "No summary available."}</p>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-8">
                <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: blog.content }} />
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/15">
                <p className="text-xs uppercase tracking-[0.3em] text-brand-400 mb-4">SEO performance</p>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-white">{blog.seoScore?.score ?? "—"}</div>
                  <SeoGradeBadge grade={blog.seoScore?.grade} />
                </div>
                <div className="mt-6 space-y-3 text-sm text-slate-300">
                  <p><span className="font-semibold text-slate-100">Word count:</span> {blog.seoScore?.wordCount ?? "—"}</p>
                  <p><span className="font-semibold text-slate-100">Keyword density:</span> {blog.seoScore?.keywordDensity ?? "—"}%</p>
                </div>
              </div>

              <BlogDetailActions blog={blog} />

              <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/15">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-4">Quick notes</p>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="rounded-xl bg-slate-950/70 p-4">Use this as a starting draft and refine with your brand voice.</li>
                  <li className="rounded-xl bg-slate-950/70 p-4">Words, headings, and CTAs are ready for SEO optimization.</li>
                  <li className="rounded-xl bg-slate-950/70 p-4">Copy the blog content directly from the page for editing.</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
