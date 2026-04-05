const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function generateBlog(keyword) {
  const res = await fetch(`${API_URL}/generate-blog`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keyword }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export async function fetchBlogs() {
  const res = await fetch(`${API_URL}/blogs`, { cache: "no-store" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export async function fetchBlog(idOrSlug) {
  const res = await fetch(`${API_URL}/blogs/${idOrSlug}`, { cache: "no-store" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}
