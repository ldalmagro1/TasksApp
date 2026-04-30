import type { Note, Category, CreateNotePayload, UpdateNotePayload } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export interface NoteFilters {
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'title' | 'date';
  sortOrder?: 'ASC' | 'DESC';
}

function buildQuery(filters?: NoteFilters): string {
  if (!filters) return '';
  const params = new URLSearchParams();
  if (filters.categoryId) params.append('categoryId', filters.categoryId);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { ...headers, ...(options?.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Notes ────────────────────────────────────────────────────────────────────
export const notesApi = {
  getAll: (filters?: NoteFilters): Promise<Note[]> => {
    return request(`/notes${buildQuery(filters)}`);
  },

  getArchived: (filters?: NoteFilters): Promise<Note[]> => {
    return request(`/notes/archived${buildQuery(filters)}`);
  },

  getTrash: (): Promise<Note[]> => request('/notes/trash'),

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

  restore: (id: string): Promise<Note> =>
    request(`/notes/${id}/restore`, { method: 'PATCH' }),
};

// ── Categories ───────────────────────────────────────────────────────────────
export const categoriesApi = {
  getAll: (): Promise<Category[]> => request('/categories'),

  create: (name: string): Promise<Category> =>
    request('/categories', { method: 'POST', body: JSON.stringify({ name }) }),

  remove: (id: string): Promise<void> =>
    request(`/categories/${id}`, { method: 'DELETE' }),

  getTrash: (): Promise<Category[]> => request('/categories/trash'),

  restore: (id: string): Promise<Category> =>
    request(`/categories/${id}/restore`, { method: 'PATCH' }),
};

// ── Users ────────────────────────────────────────────────────────────────────
export const usersApi = {
  updateProfile: (payload: { username?: string; firstName?: string; lastName?: string; password?: string }) =>
    request('/users/profile', { method: 'PUT', body: JSON.stringify(payload) }),
};
