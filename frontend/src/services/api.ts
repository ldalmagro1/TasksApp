import type { Note, Category, CreateNotePayload, UpdateNotePayload } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Notes ────────────────────────────────────────────────────────────────────
export const notesApi = {
  getAll: (categoryId?: string): Promise<Note[]> => {
    const qs = categoryId ? `?categoryId=${categoryId}` : '';
    return request(`/notes${qs}`);
  },

  getArchived: (categoryId?: string): Promise<Note[]> => {
    const qs = categoryId ? `?categoryId=${categoryId}` : '';
    return request(`/notes/archived${qs}`);
  },

  getOne: (id: string): Promise<Note> => request(`/notes/${id}`),

  create: (payload: CreateNotePayload): Promise<Note> =>
    request('/notes', { method: 'POST', body: JSON.stringify(payload) }),

  update: (id: string, payload: UpdateNotePayload): Promise<Note> =>
    request(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  remove: (id: string): Promise<void> =>
    request(`/notes/${id}`, { method: 'DELETE' }),

  archive: (id: string): Promise<Note> =>
    request(`/notes/${id}/archive`, { method: 'PATCH' }),

  unarchive: (id: string): Promise<Note> =>
    request(`/notes/${id}/unarchive`, { method: 'PATCH' }),
};

// ── Categories ───────────────────────────────────────────────────────────────
export const categoriesApi = {
  getAll: (): Promise<Category[]> => request('/categories'),

  create: (name: string): Promise<Category> =>
    request('/categories', { method: 'POST', body: JSON.stringify({ name }) }),

  remove: (id: string): Promise<void> =>
    request(`/categories/${id}`, { method: 'DELETE' }),
};
