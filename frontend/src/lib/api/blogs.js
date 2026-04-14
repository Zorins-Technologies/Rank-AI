import { apiClient } from './client';

export const blogsApi = {
  getAll: (token, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.request(`/blogs${queryString ? `?${queryString}` : ''}`, {}, token);
  },

  getById: (idOrSlug, token) => {
    return apiClient.request(`/blogs/${idOrSlug}`, {}, token);
  },

  generate: (keyword, token, projectId = null) => {
    return apiClient.request('/blogs/generate', {
      method: 'POST',
      body: JSON.stringify({ keyword, project_id: projectId }),
    }, token);
  },

  update: (id, data, token) => {
    return apiClient.request(`/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token);
  },

  delete: (id, token) => {
    return apiClient.request(`/blogs/${id}`, {
      method: 'DELETE',
    }, token);
  },

  updateStatus: (id, status, token) => {
    return apiClient.request(`/blogs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }, token);
  }
};
