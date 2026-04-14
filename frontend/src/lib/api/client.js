const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

/**
 * Shared API Client with unified error handling
 */
export const apiClient = {
  getHeaders: (token) => {
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  },

  async request(endpoint, options = {}, token) {
    // 1. Join Base URL and Endpoint
    const baseUrl = API_URL.replace(/\/$/, "");
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    let url = `${baseUrl}${cleanEndpoint}`;

    // 2. Global Path Sanitizer (Aggressive Deduplication)
    // First, collapse all redundant slashes into a single slash (except after protocol)
    url = url.replace(/(?<!:)\/\/+/g, "/"); 
    
    // Then, collapse any remaining /api/api occurrences
    url = url.replace(/\/api\/api\//g, "/api/");



    const config = {
      ...options,
      headers: {
        ...this.getHeaders(token),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);



      
      // Handle non-JSON responses gracefully
      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text); 
        } catch {
          data = { error: text || `Request failed with status ${response.status}` };
        }
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`[API Error] ${cleanEndpoint}:`, error.message);
      throw error;
    }
  }
};

