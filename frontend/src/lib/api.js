const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

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
  
  try {
    data = await res.json();
  } catch (e) {
    console.error(`[API ${context}] Failed to parse JSON:`, e);
  }

  console.log(`[API ${context}] Response Status:`, res.status);

  if (!res.ok) {
    const errorMsg = data.error || `Request failed with status ${res.status}`;
    console.error(`[API ${context}] Error:`, errorMsg);
    throw new Error(errorMsg);
  }

  return data;
}

export async function generateBlog(keyword, token) {
  console.log(`[API] Generating blog for keyword: "${keyword}"`);
  try {
    const res = await fetch(`${API_URL}/generate`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify({ keyword }),
    });
    return await handleResponse(res, "GenerateBlog");
  } catch (error) {
    console.error("[API] HTTP Error in generateBlog:", error.message);
    throw error;
  }
}

export async function fetchBlogs(searchTerm = "", cursor = "", token) {
  let url = `${API_URL}/blogs?`;
  if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;
  if (cursor) url += `cursor=${encodeURIComponent(cursor)}`;
  
  // Remove trailing separator
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
  } catch (error) {
    console.error("[API] HTTP Error in fetchBlogs:", error.message);
    // Custom friendly message for connection failures
    if (error.message.includes("Failed to fetch")) {
      throw new Error("Unable to connect to the backend server. Please ensure it is running on http://localhost:8000");
    }
    throw error;
  }
}

export async function fetchBlog(idOrSlug, token) {
  console.log(`[API] Fetching single blog detail: ${idOrSlug}`);
  try {
    const res = await fetch(`${API_URL}/blogs/${idOrSlug}`, { 
      cache: "no-store",
      headers: getHeaders(token)
    });
    return await handleResponse(res, "FetchBlog");
  } catch (error) {
    console.error("[API] HTTP Error in fetchBlog:", error.message);
    throw error;
  }
}
