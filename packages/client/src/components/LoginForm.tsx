import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Props for the LoginForm component.
 */
interface ILoginFormProps {
  /**
   * Callback when user successfully logs in.
   * @param username The username that was logged in.
   */
  onLogin: (username: string) => void;

  /**
   * Additional CSS classes.
   */
  className?: string;
}

/**
 * Login form component.
 * Handles user authentication form submission.
 */
export function LoginForm({ onLogin, className }: ILoginFormProps) {
  const [username, setUsername] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Handles login form submission.
   * @param event The form submit event.
   */
  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!username.trim()) {
      return;
    }

    setIsLoading(true);

    try {
      // Notify parent component
      onLogin(username.trim());
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-center">Space Mining Game</CardTitle>
        <p className="text-sm text-muted-foreground text-center">
          Enter your username to start playing
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              required
              autoFocus
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !username.trim()}
          >
            {isLoading ? 'Logging in...' : 'Start Playing'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
