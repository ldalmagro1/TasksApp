import { useState } from 'react';
import { Input, Button, Card, CardBody, CardHeader, Checkbox } from '@nextui-org/react';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

interface Props {
  onSwitch: () => void;
}

export default function Register({ onSwitch }: Props) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState<string | string[]>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, firstName, lastName, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (Array.isArray(data.message)) {
          setError(data.message);
          return;
        }
        throw new Error(data.message || 'Registration failed');
      }
      
      onSwitch(); // Go to login
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
          <h1 className="text-2xl font-bold">Register</h1>
          <p className="text-default-500">Create a new account</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input label="Email" type="email" variant="bordered" value={email} onValueChange={setEmail} isRequired />
            <Input label="Username" variant="bordered" value={username} onValueChange={setUsername} isRequired />
            <div className="flex gap-2">
              <Input label="First Name" variant="bordered" value={firstName} onValueChange={setFirstName} isRequired />
              <Input label="Last Name" variant="bordered" value={lastName} onValueChange={setLastName} />
            </div>
            <Input 
              label="Password" 
              type={isVisible ? "text" : "password"} 
              variant="bordered" 
              value={password} 
              onValueChange={setPassword} 
              isRequired 
            />
            <Input 
              label="Confirm Password" 
              type={isVisible ? "text" : "password"} 
              variant="bordered" 
              value={confirmPassword} 
              onValueChange={setConfirmPassword} 
              isRequired 
            />
            <Checkbox 
              isSelected={isVisible} 
              onValueChange={setIsVisible} 
              size="sm"
            >
              Show passwords
            </Checkbox>
            
            {error && (
              <div className="text-danger text-sm text-center">
                {Array.isArray(error) ? (
                  <ul className="list-disc list-inside text-left">
                    {error.map((msg, i) => <li key={i}>{msg}</li>)}
                  </ul>
                ) : (
                  <p>{error}</p>
                )}
              </div>
            )}
            
            <Button color="primary" type="submit" isLoading={loading}>
              Sign Up
            </Button>
            <div className="text-center mt-2">
              <span className="text-default-500 text-sm">Already have an account? </span>
              <Button size="sm" variant="light" color="primary" onPress={onSwitch}>
                Log In
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
