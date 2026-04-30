import { useState, useEffect } from 'react';
import type { Category } from '../types';
import { categoriesApi } from '../services/api';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from '@nextui-org/react';

interface Props {
  onClose: () => void;
  onRestore: () => void;
}

export default function DeletedCategoriesModal({ onClose, onRestore }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoriesApi.getTrash()
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  const handleRestore = async (id: string) => {
    try {
      await categoriesApi.restore(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      onRestore();
    } catch {
      // ignore
    }
  };

  return (
    <Modal isOpen={true} onOpenChange={onClose} placement="top-center" backdrop="blur" className="bg-content1">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Deleted Categories</ModalHeader>
            <ModalBody>
              {loading ? (
                <div className="flex justify-center p-4"><Spinner /></div>
              ) : categories.length === 0 ? (
                <p className="text-default-500 text-center py-4">No categories in trash.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex justify-between items-center bg-content2 p-3 rounded-md">
                      <span className="font-medium">{cat.name}</span>
                      <Button size="sm" color="primary" variant="flat" onPress={() => handleRestore(cat.id)}>
                        Restore
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={onClose}>
                Done
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
