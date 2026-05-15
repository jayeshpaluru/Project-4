import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  withCredentials: true,
});

export function getApiErrorMessage(error, fallback = 'Request failed.') {
  if (error.response?.data) {
    return typeof error.response.data === 'string'
      ? error.response.data
      : error.response.data.message || fallback;
  }

  return fallback;
}

export async function getCurrentUser() {
  let result;
  try {
    const response = await api.get('/admin/me');
    result = response.data;
  } catch (err) {
    if (err.response?.status === 401) {
      result = null;
    }
  }
  return result;
}

export async function loginUser(credentials) {
  const response = await api.post('/admin/login', credentials);
  return response.data;
}

export async function logoutUser() {
  await api.post('/admin/logout', {});
}

export async function registerUser(user) {
  const response = await api.post('/user', user);
  return response.data;
}

export async function addComment({ photoId, comment }) {
  await api.post(`/commentsOfPhoto/${photoId}`, { comment });
}

export async function savePhotoUrl(url) {
  const response = await api.post('/photos', { url });
  return response.data;
}

export default api;
