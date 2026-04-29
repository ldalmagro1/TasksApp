import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react';

interface Props {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ title, message, onConfirm, onCancel }: Props) {
  return (
    <Modal 
      isOpen={true} 
      onOpenChange={onCancel} 
      size="sm" 
      backdrop="blur"
      className="bg-content1"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-danger-500">
              {title}
            </ModalHeader>
            <ModalBody>
              <p className="text-default-500">{message}</p>
            </ModalBody>
            <ModalFooter>
              <Button id="confirm-cancel" color="default" variant="light" onPress={onCancel}>
                Cancel
              </Button>
              <Button id="confirm-delete" color="danger" onPress={() => { onConfirm(); onClose(); }}>
                Delete
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
