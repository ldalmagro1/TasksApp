import { useState, useRef, useEffect } from 'react';
import type { Note, Category } from '../types';
import { categoriesApi } from '../services/api';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea, Select, SelectItem, Chip } from '@nextui-org/react';

interface Props {
  note: Note | null;
  categories: Category[];
  preselectedCatIds?: string[];
  onSave: (payload: { title: string; content: string; categoryIds: string[]; date?: string | null }) => Promise<void>;
  onClose: () => void;
  onCategoryCreated?: (cat: Category) => void;
}

export default function NoteFormModal({
  note,
  categories,
  preselectedCatIds = [],
  onSave,
  onClose,
  onCategoryCreated,
}: Props) {
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [date, setDate] = useState(note?.date ? new Date(note.date).toISOString().split('T')[0] : '');
  const [selectedCatIds, setSelectedCatIds] = useState<Set<string>>(
    new Set(note?.categories?.map(c => c.id) ?? preselectedCatIds)
  );
  const [saving, setSaving] = useState(false);

  // Inline category creation
  const [newCatName, setNewCatName] = useState('');
  const [creatingCat, setCreatingCat] = useState(false);
  const [catError, setCatError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus title when modal opens
    setTimeout(() => {
      titleRef.current?.focus();
    }, 100);
  }, []);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await onSave({ title: title.trim(), content, categoryIds: Array.from(selectedCatIds), date: date || null });
    setSaving(false);
  };

  const handleCreateCategory = async () => {
    const name = newCatName.trim();
    if (!name || creatingCat) return;
    setCreatingCat(true);
    setCatError('');
    try {
      const cat = await categoriesApi.create(name);
      setNewCatName('');
      setSelectedCatIds(prev => {
        const next = new Set(prev);
        next.add(cat.id);
        return next;
      });
      onCategoryCreated?.(cat);
    } catch (err: any) {
      setCatError(err.message ?? 'Error creating category');
    } finally {
      setCreatingCat(false);
    }
  };

  const handleCatInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreateCategory();
    }
  };

  return (
    <Modal 
      isOpen={true} 
      onOpenChange={onClose} 
      placement="top-center" 
      backdrop="blur"
      className="bg-content1"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-foreground">
              {note ? 'Edit Note' : 'New Note'}
            </ModalHeader>
            <ModalBody>
              <Input
                autoFocus
                label="Title"
                placeholder="Note title..."
                variant="bordered"
                value={title}
                onValueChange={setTitle}
                isRequired
                maxLength={255}
                ref={titleRef}
              />
              <Textarea
                label="Content"
                placeholder="Write your note here..."
                variant="bordered"
                value={content}
                onValueChange={setContent}
                minRows={5}
                maxRows={10}
              />
              <Input
                type="date"
                label="Date"
                placeholder="Select a date"
                variant="bordered"
                value={date}
                onValueChange={setDate}
                min={today}
                max="9999-12-31"
              />
              
              <div className="flex flex-col gap-2 mt-2">
                <Select
                  label="Categories"
                  variant="bordered"
                  isMultiline={true}
                  selectionMode="multiple"
                  placeholder={categories.length === 0 ? "Create a category below..." : "Select categories..."}
                  selectedKeys={selectedCatIds}
                  onSelectionChange={(keys) => setSelectedCatIds(new Set(Array.from(keys) as string[]))}
                  className="max-w-full"
                  renderValue={(items) => {
                    return (
                      <div className="flex flex-wrap gap-2">
                        {items.map((item) => (
                          <Chip key={item.key} size="sm" variant="flat" color="primary">
                            {item.textValue}
                          </Chip>
                        ))}
                      </div>
                    );
                  }}
                >
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} textValue={cat.name} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </Select>

                <div className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Input
                      size="sm"
                      placeholder="+ New category name..."
                      value={newCatName}
                      onValueChange={(val) => { setNewCatName(val); setCatError(''); }}
                      onKeyDown={handleCatInputKeyDown}
                      maxLength={100}
                      variant="faded"
                      isInvalid={!!catError}
                      errorMessage={catError}
                      disabled={creatingCat}
                    />
                  </div>
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    isDisabled={creatingCat || !newCatName.trim()}
                    onPress={handleCreateCategory}
                    isLoading={creatingCat}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleSubmit} isLoading={saving} isDisabled={!title.trim()}>
                {note ? 'Save Changes' : 'Create Note'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
