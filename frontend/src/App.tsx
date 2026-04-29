import { useState, useEffect, useCallback } from 'react';
import { notesApi, categoriesApi } from './services/api';
import type { Note, Category } from './types';
import NoteCard from './components/NoteCard';
import NoteDetailModal from './components/NoteDetailModal';
import NoteFormModal from './components/NoteFormModal';
import ConfirmModal from './components/ConfirmModal';
import Toast from './components/Toast';
import { Button, Input, Chip, Divider } from '@nextui-org/react';

type View = 'active' | 'archived';

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [view, setView] = useState<View>('active');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  // Modals
  const [detailNote, setDetailNote] = useState<Note | null>(null);
  const [noteFormOpen, setNoteFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  // Pre-selected category IDs when opening the "new note" form
  const [preselectedCatIds, setPreselectedCatIds] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<Note | null>(null);
  const [confirmDeleteCategory, setConfirmDeleteCategory] = useState<Category | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Category input (sidebar)
  const [newCatName, setNewCatName] = useState('');

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const data = view === 'active'
        ? await notesApi.getAll(selectedCategoryId)
        : await notesApi.getArchived(selectedCategoryId);
      setNotes(data);
    } catch {
      showToast('Error loading notes', 'error');
    } finally {
      setLoading(false);
    }
  }, [view, selectedCategoryId]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);
  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // ── Note handlers ──────────────────────────────────────────────────────
  const handleSaveNote = async (payload: { title: string; content: string; categoryIds: string[] }) => {
    try {
      if (editingNote) {
        await notesApi.update(editingNote.id, payload);
        showToast('Note updated ✓');
      } else {
        await notesApi.create(payload);
        showToast('Note created ✓');
      }
      setNoteFormOpen(false);
      setEditingNote(null);
      setPreselectedCatIds([]);
      fetchNotes();
    } catch (e: any) {
      showToast(e.message ?? 'Error saving note', 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await notesApi.remove(confirmDelete.id);
      showToast('Note deleted');
      setConfirmDelete(null);
      fetchNotes();
    } catch {
      showToast('Error deleting note', 'error');
    }
  };

  const handleArchiveToggle = async (note: Note) => {
    try {
      if (note.archived) {
        await notesApi.unarchive(note.id);
        showToast('Note restored ✓');
      } else {
        await notesApi.archive(note.id);
        showToast('Note archived ✓');
      }
      fetchNotes();
    } catch {
      showToast('Error updating note', 'error');
    }
  };

  /** Open new note form, optionally pre-selecting a category */
  const openNewNote = (catId?: string) => {
    setEditingNote(null);
    setPreselectedCatIds(catId ? [catId] : []);
    setNoteFormOpen(true);
  };

  /** Open edit form (from detail modal or card action button) */
  const openEdit = (note: Note) => {
    setDetailNote(null);
    setEditingNote(note);
    setPreselectedCatIds([]);
    setNoteFormOpen(true);
  };

  /** Open delete confirm */
  const openDelete = (note: Note) => {
    setDetailNote(null);
    setConfirmDelete(note);
  };

  // ── Category handlers ─────────────────────────────────────────────────
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCatName.trim();
    if (!name) return;
    try {
      await categoriesApi.create(name);
      setNewCatName('');
      fetchCategories();
      showToast(`Category "${name}" created ✓`);
    } catch (e: any) {
      showToast(e.message ?? 'Error creating category', 'error');
    }
  };

  const handleDeleteCategory = async () => {
    if (!confirmDeleteCategory) return;
    try {
      await categoriesApi.remove(confirmDeleteCategory.id);
      if (selectedCategoryId === confirmDeleteCategory.id) setSelectedCategoryId(undefined);
      fetchCategories();
      fetchNotes();
      showToast('Category deleted');
      setConfirmDeleteCategory(null);
    } catch {
      showToast('Error deleting category', 'error');
    }
  };

  const activeCategoryName = selectedCategoryId
    ? categories.find(c => c.id === selectedCategoryId)?.name
    : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-content2 text-foreground">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 bg-content1 border-b border-divider shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3 font-bold text-xl tracking-tight">
          <span className="text-2xl"></span>
          TasksApp
        </div>
        <Button
          id="btn-new-note"
          color="primary"
          variant="shadow"
          onPress={() => openNewNote()}
          startContent={<span className="text-lg">＋</span>}
        >
          New Note
        </Button>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-content1 border-r border-divider flex flex-col shrink-0 overflow-y-auto">
          <div className="p-4 flex flex-col gap-2">
            <span className="text-xs font-semibold text-default-500 uppercase tracking-wider mb-2">Views</span>
            <Button
              id="nav-active"
              variant={view === 'active' ? 'flat' : 'light'}
              color={view === 'active' ? 'primary' : 'default'}
              className="justify-start font-medium"
              onPress={() => { setView('active'); setSelectedCategoryId(undefined); }}
              endContent={view === 'active' && <Chip size="sm" variant="flat" color="primary">{notes.length}</Chip>}
            >
              Active Notes
            </Button>
            <Button
              id="nav-archived"
              variant={view === 'archived' ? 'flat' : 'light'}
              color={view === 'archived' ? 'primary' : 'default'}
              className="justify-start font-medium"
              onPress={() => { setView('archived'); setSelectedCategoryId(undefined); }}
              endContent={view === 'archived' && <Chip size="sm" variant="flat" color="primary">{notes.length}</Chip>}
            >
              Archived
            </Button>
          </div>

          <Divider />

          <div className="p-4 flex flex-col gap-2 flex-1">
            <span className="text-xs font-semibold text-default-500 uppercase tracking-wider mb-2">Categories</span>

            {/* Filter by category */}
            <div className="flex flex-col gap-1 mb-4">
              <Button
                variant={!selectedCategoryId ? 'flat' : 'light'}
                color={!selectedCategoryId ? 'primary' : 'default'}
                className="justify-start"
                onPress={() => setSelectedCategoryId(undefined)}
                startContent={<div className="w-2 h-2 rounded-full bg-default-400" />}
              >
                All
              </Button>
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center gap-1 group">
                  <Button
                    variant={selectedCategoryId === cat.id ? 'flat' : 'light'}
                    color={selectedCategoryId === cat.id ? 'primary' : 'default'}
                    className="justify-start flex-1 overflow-hidden"
                    onPress={() => setSelectedCategoryId(cat.id === selectedCategoryId ? undefined : cat.id)}
                    startContent={<div className="w-2 h-2 rounded-full bg-primary-400" />}
                  >
                    <span className="truncate">{cat.name}</span>
                  </Button>
                  <Button
                    isIconOnly
                    variant="light"
                    color="danger"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onPress={() => setConfirmDeleteCategory(cat)}
                    title="Delete category"
                  >
                    🗑️
                  </Button>
                </div>
              ))}
            </div>

            {/* Add new category */}
            <form className="mt-auto pt-4 flex gap-2" onSubmit={handleAddCategory}>
              <Input
                size="sm"
                placeholder="New category..."
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                maxLength={100}
                classNames={{ inputWrapper: "bg-default-100" }}
              />
              <Button isIconOnly type="submit" color="primary" size="sm" variant="flat">
                ＋
              </Button>
            </form>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-8 flex flex-col">
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              {view === 'active' ? 'Active Notes' : 'Archived Notes'}
              {activeCategoryName && (
                <span className="text-primary-500 font-normal text-xl">
                  · {activeCategoryName}
                </span>
              )}
            </h1>
            <p className="text-default-500 mt-1">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 bg-content1 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 content-start">
              {notes.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                  <div className="text-6xl mb-4">{view === 'active' ? '📭' : '🗃️'}</div>
                  <h3 className="text-xl font-semibold mb-2">
                    {view === 'active' ? 'No active notes yet' : 'Nothing archived'}
                  </h3>
                  <p className="text-default-500 mb-6">
                    {view === 'active'
                      ? activeCategoryName
                        ? `No notes in "${activeCategoryName}" yet`
                        : 'Create your first note with the button above'
                      : 'Archive some notes to see them here'}
                  </p>
                  {view === 'active' && (
                    <Button
                      color="primary"
                      variant="shadow"
                      onPress={() => openNewNote(selectedCategoryId)}
                    >
                      Create Note
                    </Button>
                  )}
                </div>
              )}
              {notes.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onView={() => setDetailNote(note)}
                  onEdit={() => openEdit(note)}
                  onDelete={() => openDelete(note)}
                  onArchiveToggle={() => handleArchiveToggle(note)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Note Detail Modal */}
      {detailNote && (
        <NoteDetailModal
          note={detailNote}
          onEdit={() => openEdit(detailNote)}
          onDelete={() => openDelete(detailNote)}
          onArchiveToggle={() => { handleArchiveToggle(detailNote); setDetailNote(null); }}
          onClose={() => setDetailNote(null)}
        />
      )}

      {/* Note Form Modal */}
      {noteFormOpen && (
        <NoteFormModal
          note={editingNote}
          categories={categories}
          preselectedCatIds={preselectedCatIds}
          onSave={handleSaveNote}
          onClose={() => { setNoteFormOpen(false); setEditingNote(null); setPreselectedCatIds([]); }}
          onCategoryCreated={(cat) => setCategories(prev => [...prev, cat].sort((a, b) => a.name.localeCompare(b.name)))}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Delete Note"
          message={`Are you sure you want to permanently delete "${confirmDelete.title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* Category Delete Confirm Modal */}
      {confirmDeleteCategory && (
        <ConfirmModal
          title="Delete Category"
          message={`Are you sure you want to delete the category "${confirmDeleteCategory.name}"? This will remove the category from any notes that are using it.`}
          onConfirm={handleDeleteCategory}
          onCancel={() => setConfirmDeleteCategory(null)}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
