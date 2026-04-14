import { apiClient } from './client';

export const projectsApi = {
  getAll: (token) => {
    return apiClient.request('/projects', {}, token);
  },

  create: (data, token) => {
    return apiClient.request('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  },

  update: (id, data, token) => {
    return apiClient.request(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, token);
  },

  delete: (id, token) => {
    return apiClient.request(`/projects/${id}`, {
      method: 'DELETE',
    }, token);
  },

  getGuestPreview: (url, context) => {
    return apiClient.request('/projects/guest-preview', {
      method: 'POST',
      body: JSON.stringify({ url, context }),
    });
  }
};
