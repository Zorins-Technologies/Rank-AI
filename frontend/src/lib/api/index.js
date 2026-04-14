import { blogsApi } from './blogs';
import { projectsApi } from './projects';
import { keywordsApi } from './keywords';
import { apiClient } from './client';

// Named exports for convenient destructuring
export { blogsApi, projectsApi, keywordsApi, apiClient };

// Aggregator for all API modules
export const api = {
  blogs: blogsApi,
  projects: projectsApi,
  keywords: keywordsApi,
  
  // Growth Plan
  growthPlan: {
    get: (projectId, token) => apiClient.request(`/growth-plan/${projectId}`, {}, token),
    generate: (data, token) => apiClient.request('/growth-plan/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),
  },

  // AEO Monitoring
  aeo: {
    getChecks: (projectId, token) => apiClient.request(`/aeo/${projectId}`, {}, token),
    getSummary: (projectId, token) => apiClient.request(`/aeo/${projectId}/summary`, {}, token),
    runCheck: (data, token) => apiClient.request('/aeo/check', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),
  },

  // Backlinks
  backlinks: {
    get: (projectId, token) => apiClient.request(`/backlinks/${projectId}`, {}, token),
    generate: (projectId, blogId, token) => apiClient.request(`/backlinks/${projectId}/generate`, {
      method: 'POST',
      body: JSON.stringify({ blog_id: blogId }),
    }, token),
    updateTask: (taskId, data, token) => apiClient.request(`/backlinks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, token),
    getPlatforms: (token) => apiClient.request('/backlinks/platforms/list', {}, token),
  },

  // Billing (Stripe)
  billing: {
    getUsage: (token) => apiClient.request('/stripe/usage', {}, token),
    createSession: (plan, token) => apiClient.request('/stripe/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    }, token),
  },
  
  // Publishing & Calendar
  publish: {
    getCalendar: (projectId, token) => apiClient.request(`/publish/calendar/${projectId}`, {}, token),
    reschedule: (planId, newDate, token) => apiClient.request('/publish/reschedule', {
      method: 'PUT',
      body: JSON.stringify({ planId, newDate }),
    }, token),
    manual: (blogId, token) => apiClient.request('/publish/manual', {
      method: 'POST',
      body: JSON.stringify({ blogId }),
    }, token),
    testConnection: (projectId, token) => apiClient.request('/publish/test', {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId, cms_type: 'wordpress' }),
    }, token),
  }
};

