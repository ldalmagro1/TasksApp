import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../services/api';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Checkbox } from '@nextui-org/react';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProfileSettingsModal({ onClose, onSuccess }: Props) {
  const { user, login, token } = useAuth();
  const [username, setUsername] = useState(user?.username ?? '');
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | string[]>('');

  const handleSubmit = async () => {
    setError('');
    
    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const payload: any = { username, firstName, lastName };
      if (password) {
        payload.password = password;
      }

      await usersApi.updateProfile(payload);
      
      // Update local context
      if (user && token) {
        login({ ...user, username, firstName, lastName }, token);
      }
      onSuccess();
    } catch (err: any) {
      if (err.message && err.message.includes('[')) {
        // Backend returns an array for class-validator errors sometimes
        try {
          const parsed = JSON.parse(err.message);
          if (Array.isArray(parsed)) setError(parsed);
          else setError(err.message);
        } catch {
          setError(err.message);
        }
      } else {
        setError(err.message ?? 'Error updating profile');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={true} onOpenChange={onClose} placement="top-center" backdrop="blur" className="bg-content1">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Profile Settings</ModalHeader>
            <ModalBody>
              <Input
                label="Username"
                variant="bordered"
                value={username}
                onValueChange={setUsername}
                isRequired
              />
              <div className="flex gap-2">
                <Input
                  label="First Name"
                  variant="bordered"
                  value={firstName}
                  onValueChange={setFirstName}
                  isRequired
                />
                <Input
                  label="Last Name"
                  variant="bordered"
                  value={lastName}
                  onValueChange={setLastName}
                />
              </div>

              <div className="mt-4">
                <p className="text-sm text-default-500 mb-2">Change Password (optional)</p>
                <Input
                  label="New Password"
                  type={isVisible ? "text" : "password"}
                  variant="bordered"
                  value={password}
                  onValueChange={setPassword}
                  className="mb-2"
                />
                <Input
                  label="Confirm New Password"
                  type={isVisible ? "text" : "password"}
                  variant="bordered"
                  value={confirmPassword}
                  onValueChange={setConfirmPassword}
                />
                {(password || confirmPassword) && (
                  <div className="mt-2">
                    <Checkbox isSelected={isVisible} onValueChange={setIsVisible} size="sm">
                      Show passwords
                    </Checkbox>
                  </div>
                )}
              </div>

              {error && (
                <div className="text-danger text-sm text-center mt-2">
                  {Array.isArray(error) ? (
                    <ul className="list-disc list-inside text-left">
                      {error.map((msg, i) => <li key={i}>{msg}</li>)}
                    </ul>
                  ) : (
                    <p>{error}</p>
                  )}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleSubmit} isLoading={saving}>
                Save Changes
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
