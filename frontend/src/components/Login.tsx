import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Input, Button, Card, CardBody, CardHeader, Checkbox } from '@nextui-org/react';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

interface Props {
  onSwitch: () => void;
}

export default function Login({ onSwitch }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      login(data.user, data.access_token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-content2 p-4">
      <Card className="w-full max-w-md p-6">
        <CardHeader className="flex flex-col gap-1 items-center">
          <h1 className="text-2xl font-bold">TasksApp</h1>
          <p className="text-default-500">Log in to your account</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              variant="bordered"
              value={email}
              onValueChange={setEmail}
              isRequired
            />
            <Input
              label="Password"
              type={isVisible ? "text" : "password"}
              variant="bordered"
              value={password}
              onValueChange={setPassword}
              isRequired
            />
            <Checkbox 
              isSelected={isVisible} 
              onValueChange={setIsVisible} 
              size="sm"
            >
              Show password
            </Checkbox>
            {error && <p className="text-danger text-sm">{error}</p>}
            <Button color="primary" type="submit" isLoading={loading}>
              Log In
            </Button>
            <div className="text-center mt-4">
              <span className="text-default-500 text-sm">Don't have an account? </span>
              <Button size="sm" variant="light" color="primary" onPress={onSwitch}>
                Register
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
