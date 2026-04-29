import type { Note } from '../types';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Chip, Divider } from '@nextui-org/react';

interface Props {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
  onArchiveToggle: () => void;
  onClose: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NoteDetailModal({
  note,
  onEdit,
  onDelete,
  onArchiveToggle,
  onClose,
}: Props) {
  return (
    <Modal 
      isOpen={true} 
      onOpenChange={onClose}
      backdrop="blur"
      size="2xl"
      className="bg-content1"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 pb-2">
              <div className="flex items-center gap-3">
                {note.archived && (
                  <Chip size="sm" color="warning" variant="flat">Archived</Chip>
                )}
                <h2 className="text-2xl font-bold break-words">{note.title}</h2>
              </div>
              
              {note.categories && note.categories.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {note.categories.map((cat) => (
                    <Chip key={cat.id} size="sm" variant="flat" color="primary">
                      {cat.name}
                    </Chip>
                  ))}
                </div>
              )}
            </ModalHeader>
            <Divider />
            <ModalBody className="py-6">
              {note.content ? (
                <div className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {note.content}
                </div>
              ) : (
                <p className="text-default-400 italic">No content</p>
              )}

              <div className="mt-8 flex flex-col gap-1 text-xs text-default-400">
                <span>Created {formatDate(note.createdAt)}</span>
                {note.updatedAt !== note.createdAt && (
                  <span>Updated {formatDate(note.updatedAt)}</span>
                )}
              </div>
            </ModalBody>
            <Divider />
            <ModalFooter className="flex justify-between items-center">
              <Button
                id={`detail-delete-${note.id}`}
                color="danger"
                variant="light"
                onPress={() => { onClose(); onDelete(); }}
                startContent={<span>🗑️</span>}
              >
                Delete
              </Button>
              <div className="flex gap-2">
                <Button
                  id={`detail-archive-${note.id}`}
                  color="secondary"
                  variant="flat"
                  onPress={() => { onArchiveToggle(); onClose(); }}
                  startContent={<span>{note.archived ? '📤' : '🗃️'}</span>}
                >
                  {note.archived ? 'Unarchive' : 'Archive'}
                </Button>
                <Button
                  id={`detail-edit-${note.id}`}
                  color="primary"
                  onPress={() => { onClose(); onEdit(); }}
                  startContent={<span>✏️</span>}
                >
                  Edit
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
