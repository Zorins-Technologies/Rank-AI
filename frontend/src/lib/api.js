const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const API_URL = rawUrl.replace(/\/$/, "");

console.log("========================================");
console.log("API URL CONFIGURED:", process.env.NEXT_PUBLIC_API_URL);
console.log("API URL IN USE:", API_URL);
console.log("========================================");

/**
 * Common headers for API requests
 */
const getHeaders = (token) => {
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

/**
 * Helper to handle fetch responses safely
 * Returns parsed JSON and handles non-OK statuses
 */
async function handleResponse(res, context) {
  let data = {};
  
  if (!res.ok) {
    try {
      data = await res.json();
    } catch (e) {
      // Ignored if not JSON
    }
    const errorMsg = data.error || `Request failed with status ${res.status}`;
    console.error(`[API ${context}] ERROR ${res.status}:`, errorMsg);
    throw new Error(res.status); // Conform to explicit user requirement
  }

  try {
    data = await res.json();
  } catch (e) {
    console.error(`[API ${context}] Failed to parse JSON:`, e);
    throw new Error("Invalid response from server");
  }

  console.log(`[API ${context}] Response Status:`, res.status);
  return data;
}

export async function generateBlog(keyword, token) {
  console.log(`[API] Generating blog for URL: ${API_URL}/generate, keyword: "${keyword}"`);
  try {
    const res = await fetch(`${API_URL}/generate`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify({ keyword }),
    });
    return await handleResponse(res, "GenerateBlog");
  } catch (err) {
    console.error("API ERROR:", err);
    // User-friendly fallback directly mapping to frontend UI logic
    return {
      success: false,
      error: "We could not reach the backend. Please check the server connection."
    };
  }
}

export async function fetchBlogs(searchTerm = "", cursor = "", token) {
  let url = `${API_URL}/blogs?`;
  if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;
  if (cursor) url += `cursor=${encodeURIComponent(cursor)}`;
  
  if (url.endsWith('?') || url.endsWith('&')) {
    url = url.slice(0, -1);
  }

  console.log(`[API] Fetching blogs from: ${url}`);
  try {
    const res = await fetch(url, { 
      cache: "no-store",
      headers: getHeaders(token)
    });
    return await handleResponse(res, "FetchBlogs");
  } catch (err) {
    console.error("API ERROR:", err);
    throw new Error("Unable to fetch library right now. Check if backend is reachable.");
  }
}

export async function fetchBlog(idOrSlug, token) {
  console.log(`[API] Fetching single blog detail: ${API_URL}/blogs/${idOrSlug}`);
  try {
    const res = await fetch(`${API_URL}/blogs/${idOrSlug}`, { 
      cache: "no-store",
      headers: getHeaders(token)
    });
    return await handleResponse(res, "FetchBlog");
  } catch (err) {
    console.error("API ERROR:", err);
    throw new Error("Failed to load article detail. The backend might be offline.");
  }
}
