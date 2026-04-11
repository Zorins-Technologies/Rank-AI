export default async function sitemap() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const baseUrl = "https://rankai.zorins.tech";

  // 1. Fetch all published blogs
  let blogs = [];
  try {
    const res = await fetch(`${apiUrl}/blogs?status=published`, {
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
