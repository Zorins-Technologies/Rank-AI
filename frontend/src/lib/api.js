const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
 * Robust fetch wrapper with timeout and retry logic
 */
async function fetchWithRetry(url, options = {}, retries = 1, timeoutMs = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    const isTimeout = err.name === 'AbortError';
    
    if (retries > 0) {
      console.warn(`[API] ${isTimeout ? 'Timeout' : 'Error'} on ${url}. Retrying... (${retries} left)`);
      // Wait a moment before retrying
      await new Promise(res => setTimeout(res, 1000));
      return fetchWithRetry(url, options, retries - 1, timeoutMs);
    }
    
    if (isTimeout) throw new Error("Request timed out after 30 seconds.");
    throw err;
  }
}

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
    const res = await fetchWithRetry(`${API_URL}/generate`, {
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

export async function fetchBlogs(searchTerm = "", cursor = "", token, project_id = "") {
  let url = `${API_URL}/blogs?`;
  if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;
  if (cursor) url += `cursor=${encodeURIComponent(cursor)}&`;
  if (project_id) url += `project_id=${encodeURIComponent(project_id)}`;
  
  if (url.endsWith('?') || url.endsWith('&')) {
    url = url.slice(0, -1);
  }

  console.log(`[API] Fetching blogs from: ${url}`);
  try {
    const res = await fetchWithRetry(url, { 
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
    const res = await fetchWithRetry(`${API_URL}/blogs/${idOrSlug}`, { 
      cache: "no-store",
      headers: getHeaders(token)
    });
    return await handleResponse(res, "FetchBlog");
  } catch (err) {
    console.error("API ERROR:", err);
    throw new Error("Failed to load article detail. The backend might be offline.");
  }
}

// ─── Keyword Research API ──────────────────────────────────────────────────────

export async function researchKeywords(niche, token) {
  console.log(`[API] Researching keywords for niche: "${niche}"`);
  try {
    const res = await fetchWithRetry(`${API_URL}/keywords/research`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify({ niche }),
    });
    return await handleResponse(res, "ResearchKeywords");
  } catch (err) {
    console.error("API ERROR:", err);
    return { success: false, error: "Failed to research keywords. Please try again." };
  }
}

export async function fetchKeywords(token, filters = {}) {
  const params = new URLSearchParams(filters).toString();
  const url = `${API_URL}/keywords${params ? "?" + params : ""}`;
  console.log(`[API] Fetching keywords from: ${url}`);
  try {
    const res = await fetchWithRetry(url, { cache: "no-store", headers: getHeaders(token) });
    return await handleResponse(res, "FetchKeywords");
  } catch (err) {
    console.error("API ERROR:", err);
    throw new Error("Unable to load keywords. Check backend connection.");
  }
}

export async function generateFromKeyword(keywordId, token) {
  console.log(`[API] Triggering generation for keyword ID: ${keywordId}`);
  try {
    const res = await fetchWithRetry(`${API_URL}/keywords/${keywordId}/generate`, {
      method: "POST",
      headers: getHeaders(token),
    });
    return await handleResponse(res, "GenerateFromKeyword");
  } catch (err) {
    console.error("API ERROR:", err);
    return { success: false, error: "Failed to start generation. Please try again." };
  }
}

// ─── Project Management API ──────────────────────────────────────────────────

export async function fetchProjects(token) {
  console.log(`[API] Fetching all projects...`);
  try {
    const res = await fetchWithRetry(`${API_URL}/api/projects`, { 
      cache: "no-store",
      headers: getHeaders(token) 
    });
    return await handleResponse(res, "FetchProjects");
  } catch (err) {
    console.error("API ERROR:", err);
    throw new Error("Failed to load projects.");
  }
}

export async function createProject(data, token) {
  console.log(`[API] Creating new project for: ${data.website_url}`);
  try {
    const res = await fetchWithRetry(`${API_URL}/api/projects`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return await handleResponse(res, "CreateProject");
  } catch (err) {
    console.error("API ERROR:", err);
    throw new Error("Failed to create project. Check URL and niche.");
  }
}

export async function updateProject(id, data, token) {
  console.log(`[API] Updating project ${id}...`);
  try {
    const res = await fetchWithRetry(`${API_URL}/api/projects/${id}`, {
      method: "PATCH",
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return await handleResponse(res, "UpdateProject");
  } catch (err) {
    console.error("API ERROR:", err);
    throw new Error("Failed to update project.");
  }
}

export async function deleteProject(id, token) {
  console.log(`[API] Deleting project ${id}...`);
  try {
    const res = await fetchWithRetry(`${API_URL}/api/projects/${id}`, {
      method: "DELETE",
      headers: getHeaders(token),
    });
    return await handleResponse(res, "DeleteProject");
  } catch (err) {
    console.error("API ERROR:", err);
    throw new Error("Failed to delete project.");
  }
}

// ─── Stripe & Billing API ──────────────────────────────────────────────────

export async function fetchUsage(token) {
  console.log(`[API] Fetching usage stats...`);
  try {
    const res = await fetchWithRetry(`${API_URL}/api/stripe/usage`, {
      cache: "no-store",
      headers: getHeaders(token),
    });
    return await handleResponse(res, "FetchUsage");
  } catch (err) {
    console.error("API ERROR:", err);
    throw new Error("Failed to load billing information.");
  }
}

export async function createCheckoutSession(plan, token) {
  console.log(`[API] Creating checkout session for plan: ${plan}`);
  try {
    const res = await fetchWithRetry(`${API_URL}/api/stripe/create-checkout-session`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify({ plan }),
    });
    return await handleResponse(res, "CreateCheckoutSession");
  } catch (err) {
    console.error("API ERROR:", err);
    throw new Error("Failed to initiate checkout. Please try again.");
  }
}
