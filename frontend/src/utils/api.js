const API_BASE = 'https://study-klej.onrender.com';

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Something went wrong' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Notes
  getNotes: (q) => request(`/notes${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  addNote: (data) => request('/notes', { method: 'POST', body: JSON.stringify(data) }),
  deleteNote: (id) => request(`/notes/${id}`, { method: 'DELETE' }),

  // AI
  askQuestion: (question, mode = 'classic') => request('/ask', { method: 'POST', body: JSON.stringify({ question, mode }) }),

  // History
  getHistory: () => request('/history'),
};
