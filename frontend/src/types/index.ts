export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  archived: boolean;
  categories: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotePayload {
  title: string;
  content?: string;
  categoryIds?: string[];
}

export interface UpdateNotePayload {
  title?: string;
  content?: string;
  categoryIds?: string[];
}
