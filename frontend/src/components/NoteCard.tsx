import type { Note } from '../types';
import { Card, CardHeader, CardBody, CardFooter, Chip, Button, Tooltip } from '@nextui-org/react';

interface Props {
  note: Note;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onArchiveToggle: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function NoteCard({ note, onView, onEdit, onDelete, onArchiveToggle }: Props) {
  return (
    <Card
      isPressable
      onPress={onView}
      id={`note-card-${note.id}`}
      className={`h-full border border-divider shadow-sm hover:shadow-md transition-shadow ${note.archived ? 'opacity-70 bg-default-50' : 'bg-content1'}`}
      shadow="none"
    >
      <CardHeader className="flex flex-col items-start gap-2 pt-4 px-4 pb-0">
        {note.categories && note.categories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.categories.map(cat => (
              <Chip key={cat.id} size="sm" variant="flat" color="primary" className="h-6 text-xs">
                {cat.name}
              </Chip>
            ))}
          </div>
        )}
        <h3 className="font-bold text-lg leading-tight line-clamp-2 text-foreground">
          {note.title}
        </h3>
      </CardHeader>

      <CardBody className="px-4 py-3 overflow-hidden">
        {note.content && (
          <p className="text-default-500 text-sm line-clamp-4">
            {note.content}
          </p>
        )}
      </CardBody>

      <CardFooter className="px-4 pb-4 pt-0 flex items-center justify-between mt-auto">
        <span className="text-xs text-default-400 font-medium">{formatDate(note.updatedAt)}</span>
        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
          <Tooltip content="Edit note" placement="top">
            <Button
              id={`btn-edit-${note.id}`}
              isIconOnly
              size="sm"
              variant="light"
              onPress={onEdit}
            >
              ✏️
            </Button>
          </Tooltip>
          <Tooltip content={note.archived ? 'Unarchive note' : 'Archive note'} placement="top">
            <Button
              id={`btn-archive-${note.id}`}
              isIconOnly
              size="sm"
              variant="light"
              color="secondary"
              onPress={onArchiveToggle}
            >
              {note.archived ? '📤' : '🗃️'}
            </Button>
          </Tooltip>
          <Tooltip content="Delete note" color="danger" placement="top">
            <Button
              id={`btn-delete-${note.id}`}
              isIconOnly
              size="sm"
              variant="light"
              color="danger"
              onPress={onDelete}
            >
              🗑️
            </Button>
          </Tooltip>
        </div>
      </CardFooter>
    </Card>
  );
}
