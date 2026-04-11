import BlogDetailView from "./BlogDetailView";
import Navbar from "../../../components/Navbar";

// Helper to fetch blog data on the server
async function getBlog(slug) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  try {
    const res = await fetch(`${apiUrl}/blogs/${slug}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`[Server Fetch] Failed to fetch blog ${slug}:`, res.status);
      return null;
    }

    const json = await res.json();
    return json.success ? json.data : null;
  } catch (error) {
    console.error(`[Server Fetch] Error fetching blog ${slug}:`, error.message);
    return null;
  }
}

// ─── GENERATE METADATA (SEO) ──────────────────────────────────────────────────
export async function generateMetadata({ params }) {
  const blog = await getBlog(params.slug);

  if (!blog) {
    return {
      title: "Article Not Found | RankAI",
      description: "The requested AI-generated article could not be found.",
    };
  }

  const title = blog.title;
  const description = blog.metaDescription || blog.content?.substring(0, 160).replace(/<[^>]*>/g, "") || "Read this AI-optimized article on RankAI.";
  const ogImage = blog.imageUrl || "/default-og.png";

  return {
    title: `${title} | RankAI`,
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: `https://rankai.zorins.tech/blogs/${blog.slug}`, // Update with actual domain if known
      siteName: "RankAI",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [ogImage],
    },
  };
}

// ─── BLOG DETAIL PAGE (SERVER COMPONENT) ───────────────────────────────────────
export default async function BlogDetailPage({ params }) {
  const { slug } = params;
  const blog = await getBlog(slug);

  if (!blog) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center">
          <div className="text-6xl mb-6">🏜️</div>
          <h1 className="text-3xl font-display font-black text-white mb-4 uppercase tracking-tight">Article Not Found</h1>
          <p className="text-slate-500 mb-10 max-w-sm font-medium">The content you are looking for has been archived or moved by the AI engine.</p>
          <a href="/blogs" className="btn-secondary px-10">Return to Library</a>
        </main>
      </>
    );
  }

  return <BlogDetailView blog={blog} />;
}
