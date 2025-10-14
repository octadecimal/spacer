import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Props for the Login component.
 */
interface ILoginProps {
  /**
   * Callback when user successfully logs in.
   * @param username The username that was logged in.
   */
  onLogin: (username: string) => void;

  /**
   * Callback when user logs out.
   */
  onLogout: () => void;

  /**
   * Whether the user is currently logged in.
   */
  isLoggedIn: boolean;

  /**
   * Current username if logged in.
   */
  currentUsername?: string;
}

/**
 * Login component handles user authentication and persistence.
 * Stores username in localStorage and provides login/logout functionality.
 */
export function Login({
  onLogin,
  onLogout,
  isLoggedIn,
  currentUsername,
}: ILoginProps) {
  const [username, setUsername] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Loads saved username from localStorage on component mount.
   */
  useEffect(() => {
    const savedUsername = localStorage.getItem('spacer_username');
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

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
      // Save username to localStorage
      localStorage.setItem('spacer_username', username.trim());

      // Notify parent component
      onLogin(username.trim());
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles logout action.
   */
  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('spacer_username');

    // Reset form
    setUsername('');

    // Notify parent component
    onLogout();
  };

  if (isLoggedIn) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Welcome Back!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Logged in as:</p>
            <p className="font-semibold">{currentUsername}</p>
          </div>

          <Button onClick={handleLogout} variant="outline" className="w-full">
            Logout
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
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
