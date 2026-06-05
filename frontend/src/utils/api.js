const API_BASE = import.meta.env.VITE_API_URL || 'https://backend-seven-wine-16.vercel.app/api';

function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { ...getAuthHeaders(), ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Something went wrong' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  auth: {
    login: (email, password) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    signup: (email, password) =>
      request('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password }) }),
    me: () => request('/auth/me'),
  },

  // Notes
  getNotes: (q) => request(`/notes${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  addNote: (data) => request('/notes', { method: 'POST', body: JSON.stringify(data) }),
  deleteNote: (id) => request(`/notes/${id}`, { method: 'DELETE' }),

  // Document Upload
  uploadDocument: async (file) => {
    const token = localStorage.getItem('auth_token');
    const formData = new FormData();
    formData.append('file', file);
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }
    return res.json();
  },

  // Documents
  getDocuments: () => request('/documents'),

  // AI
  askQuestion: (question, mode = 'classic', document_id = null, image_data = null) => 
    request('/ask', { method: 'POST', body: JSON.stringify({ question, mode, document_id, image_data }) }),

  // History
  getHistory: () => request('/history'),
};
