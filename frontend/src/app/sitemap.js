export default async function sitemap() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const baseUrl = "https://rankai.zorins.tech";

  // 1. Fetch all published blogs
  let blogs = [];
  try {
    // Normalize URL construction to prevent /api/api duplication
    const cleanBase = apiUrl.replace(/\/$/, "");
    const endpoint = "/blogs?status=published";
    const requestUrl = cleanBase.endsWith("/api") ? `${cleanBase}${endpoint}` : `${cleanBase}/api${endpoint}`;

    const res = await fetch(requestUrl, {
      cache: "no-store",
    });

    const data = await res.json();
    if (data.success) {
      blogs = data.data;
    }
  } catch (error) {
    console.error("[Sitemap] Failed to fetch blogs:", error.message);
  }

  // 2. Static Pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // 3. Dynamic Blog Pages
  const blogEntries = blogs.map((blog) => ({
    url: `${baseUrl}/blogs/${blog.slug}`,
    lastModified: new Date(blog.updatedAt || blog.updated_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...blogEntries];
}
