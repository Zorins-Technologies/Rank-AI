import { apiClient } from './client';

export const keywordsApi = {
  getAll: (token, filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return apiClient.request(`/keywords${queryString ? `?${queryString}` : ''}`, {}, token);
  },

  research: (niche, projectId, token) => {
    return apiClient.request('/keywords/research', {
      method: 'POST',
      body: JSON.stringify({ niche, project_id: projectId }),
    }, token);
  },

  generateBlog: (keywordId, token) => {
    return apiClient.request(`/keywords/${keywordId}/generate`, {
      method: 'POST',
    }, token);
  }
};
